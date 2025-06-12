
import type { CSVRow, TransformedStore } from './types.ts';

export function transformCSVRow(row: CSVRow): TransformedStore {
  // Transform CSV row to match snap_stores table structure
  // Adjust field mappings based on your CSV structure
  return {
    record_id: row.RECORDID || row.record_id || undefined,
    object_id: row.OBJECTID || row.object_id || undefined,
    store_name: row.STORENAME || row.store_name || row.name || '',
    store_street_address: row.ADDRESS || row.store_street_address || row.address || undefined,
    additional_address: row.ADDRESS2 || row.additional_address || undefined,
    city: row.CITY || row.city || undefined,
    county: row.COUNTY || row.county || undefined,
    state: row.STATE || row.state || undefined,
    zip_code: row.ZIP || row.zip_code || row.zipcode || undefined,
    zip4: row.ZIP4 || row.zip4 || undefined,
    latitude: row.LATITUDE || row.latitude || row.lat ? parseFloat(row.LATITUDE || row.latitude || row.lat) : undefined,
    longitude: row.LONGITUDE || row.longitude || row.lng || row.lon ? parseFloat(row.LONGITUDE || row.longitude || row.lng || row.lon) : undefined,
    x: row.X || row.x ? parseFloat(row.X || row.x) : undefined,
    y: row.Y || row.y ? parseFloat(row.Y || row.y) : undefined,
    grantee_name: row.GRANTEENAME || row.grantee_name || undefined,
    store_type: row.STORETYPE || row.store_type || undefined,
    incentive_program: row.INCENTIVEPROGRAM || row.incentive_program || undefined,
  };
}
