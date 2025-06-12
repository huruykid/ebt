
export interface CSVRow {
  [key: string]: string;
}

export interface TransformedStore {
  record_id?: string;
  object_id?: string;
  store_name: string;
  store_street_address?: string;
  additional_address?: string;
  city?: string;
  county?: string;
  state?: string;
  zip_code?: string;
  zip4?: string;
  latitude?: number;
  longitude?: number;
  x?: number;
  y?: number;
  grantee_name?: string;
  store_type?: string;
  incentive_program?: string;
}
