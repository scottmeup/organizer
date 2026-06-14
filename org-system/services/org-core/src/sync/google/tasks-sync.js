import { resolveConflict } from '../conflict/resolve.js';
import { hashTaskCanonical, hashTaskNative } from '../util/hash.js';
import { buildTaskInputFromRemote } from './task-input.js';
import * as mappingRepo from '../../db/repositories/sync-mappings.js';
import { getTaskRow, insertTaskRow, listTaskRows, updateTaskRow } from '../../db/repositories/tasks.js';
import { createGoogleTask, listGoogleTaskLists, listGoogleTasks, updateGoogleTask } from '../../integrations/google-tasks-api.js';

const PROVIDER_ID = 'google-tasks';
const CANONICAL_TYPE = 'task';

async function resolveTaskListIds(accessToken, connection) {
  if (connection.taskListIds?.length) return connection.taskListIds;
  const lists = await listGoogleTaskLists(accessToken);
  const ids = (lists.items || []).map((item) => item.id).filter(Boolean);
  return ids.length ? ids : [];
}

async function fetchRemoteTasks(accessToken, taskListIds) {
  const items = [];
  for (const taskListId of taskListIds) {
    const result = await listGoogleTasks(accessToken, taskListId);
    for (const task of result.items || []) {
      if (task.deleted) continue;
      items.push({ ...task, _taskListId: taskListId });
    }
  }
  return items;
}

async function reconcileRemoteTask({ remote, adapter, stats }) {
  const mapping = await mappingRepo.findMappingByRemote(PROVIDER_ID, CANONICAL_TYPE, remote.id);
  const nativeHash = hashTaskNative(remote);
  const input = buildTaskInputFromRemote(adapter, remote);

  if (!mapping) {
    const created = await insertTaskRow(input);
    await mappingRepo.upsertSyncMappingRow({
      canonicalType: CANONICAL_TYPE,
      canonicalId: created.id,
      providerId: PROVIDER_ID,
      remoteId: remote.id,
      metadataHash: hashTaskCanonical(created),
      nativeHash,
      lastSource: 'remote',
    });
    stats.pulled += 1;
    return;
  }

  const canonical = await getTaskRow(mapping.canonical_id);
  if (!canonical) {
    stats.skipped += 1;
    return;
  }

  const canonicalHash = hashTaskCanonical(canonical);
  const remoteChanged = nativeHash !== mapping.native_hash;
  const canonicalChanged = canonicalHash !== mapping.metadata_hash;

  if (!remoteChanged && !canonicalChanged) {
    stats.skipped += 1;
    return;
  }

  let updatedRow = canonical;
  let lastSource = mapping.last_source;

  if (remoteChanged && !canonicalChanged) {
    updatedRow = await updateTaskRow(canonical.id, input);
    lastSource = 'remote';
    stats.pulled += 1;
  } else if (remoteChanged && canonicalChanged) {
    const winner = resolveConflict({
      leftUpdatedAt: canonical.updated_at,
      rightUpdatedAt: remote.updated,
    });
    if (winner === 'right') {
      updatedRow = await updateTaskRow(canonical.id, input);
      lastSource = 'remote';
      stats.pulled += 1;
    } else {
      stats.skipped += 1;
    }
  } else {
    stats.skipped += 1;
  }

  await mappingRepo.upsertSyncMappingRow({
    canonicalType: CANONICAL_TYPE,
    canonicalId: updatedRow.id,
    providerId: PROVIDER_ID,
    remoteId: remote.id,
    metadataHash: hashTaskCanonical(updatedRow),
    nativeHash,
    lastSource,
  });
}

async function pushCanonicalTask({ canonical, accessToken, adapter, stats, defaultTaskListId }) {
  const mapping = await mappingRepo.findMappingByCanonical(PROVIDER_ID, CANONICAL_TYPE, canonical.id);
  const canonicalHash = hashTaskCanonical(canonical);

  if (!mapping) {
    const nativeBody = adapter.toNativePayload(canonical);
    const created = await createGoogleTask(accessToken, defaultTaskListId, nativeBody);
    await mappingRepo.upsertSyncMappingRow({
      canonicalType: CANONICAL_TYPE,
      canonicalId: canonical.id,
      providerId: PROVIDER_ID,
      remoteId: created.id,
      metadataHash: canonicalHash,
      nativeHash: hashTaskNative(created),
      lastSource: 'canonical',
    });
    stats.pushed += 1;
    return;
  }

  if (canonicalHash === mapping.metadata_hash) {
    stats.skipped += 1;
    return;
  }

  const shouldPush = mapping.last_source === 'canonical'
    || new Date(canonical.updated_at).getTime() > new Date(mapping.updated_at).getTime();

  if (!shouldPush) {
    stats.skipped += 1;
    return;
  }

  const nativeBody = adapter.toNativePayload(canonical);
  const updated = await updateGoogleTask(accessToken, defaultTaskListId, mapping.remote_id, nativeBody);
  await mappingRepo.upsertSyncMappingRow({
    canonicalType: CANONICAL_TYPE,
    canonicalId: canonical.id,
    providerId: PROVIDER_ID,
    remoteId: mapping.remote_id,
    metadataHash: canonicalHash,
    nativeHash: hashTaskNative(updated),
    lastSource: 'canonical',
  });
  stats.pushed += 1;
}

export async function syncGoogleTasks({ accessToken, connection, adapter }) {
  const stats = { pulled: 0, pushed: 0, skipped: 0, errors: [] };
  const taskListIds = await resolveTaskListIds(accessToken, connection);

  if (!taskListIds.length) {
    return { ...stats, errors: [{ error: 'no_task_lists_available' }] };
  }

  const defaultTaskListId = taskListIds[0];
  const remoteTasks = await fetchRemoteTasks(accessToken, taskListIds);

  for (const remote of remoteTasks) {
    try {
      await reconcileRemoteTask({ remote, adapter, stats });
    } catch (error) {
      stats.errors.push({ remoteId: remote.id, error: error.message || String(error) });
    }
  }

  const canonicalTasks = await listTaskRows();
  for (const canonical of canonicalTasks) {
    try {
      await pushCanonicalTask({ canonical, accessToken, adapter, stats, defaultTaskListId });
    } catch (error) {
      stats.errors.push({ canonicalId: canonical.id, error: error.message || String(error) });
    }
  }

  return stats;
}
