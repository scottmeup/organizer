import crypto from 'crypto';

export function hashPayload(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function hashTaskCanonical(row) {
  return hashPayload({
    title: row.title,
    status: row.status,
    dueDate: row.due_date,
    description: row.description,
    metadata: row.metadata_json,
  });
}

export function hashTaskNative(remote) {
  return hashPayload({
    id: remote.id,
    title: remote.title,
    status: remote.status,
    due: remote.due,
    notes: remote.notes,
    updated: remote.updated,
  });
}

export function hashCalendarCanonical(row) {
  return hashPayload({
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    description: row.description,
    metadata: row.metadata_json,
  });
}

export function hashCalendarNative(remote) {
  return hashPayload({
    id: remote.id,
    summary: remote.summary,
    description: remote.description,
    start: remote.start,
    end: remote.end,
    updated: remote.updated,
  });
}
