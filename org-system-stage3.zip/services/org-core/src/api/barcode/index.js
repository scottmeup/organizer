import { createShoppingItem } from '../shopping/index.js';
export async function barcodeIntake(input, headers) {
  const expected = process.env.BARCODE_SHARED_SECRET || '';
  const supplied = String(headers['x-barcode-secret'] || input.secret || '');
  const authorized = expected ? supplied === expected : true;
  if (!authorized) {
    return { ok: false, error: 'unauthorized' };
  }
  const item = await createShoppingItem({
    title: input.title || input.barcode || 'Scanned item',
    quantity: input.quantity || 1,
    checked: false
  });
  return { ok: true, item };
}
