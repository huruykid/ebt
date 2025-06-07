
export interface ArcGISFeature {
  attributes: {
    OBJECTID: number;
    Store_Name: string;
    Store_Type: string;
    Store_Street_Address: string; // Fixed field name
    Additonal_Address?: string; // Fixed field name (note ArcGIS typo)
    City: string;
    State: string;
    Zip_Code: string; // Fixed field name
    Zip4?: string;
    County: string;
    Longitude: number;
    Latitude: number;
    X?: number;
    Y?: number;
    Grantee_Name?: string;
    Incentive_Program?: string;
    Record_ID?: string;
  };
}

export interface ArcGISResponse {
  features: ArcGISFeature[];
  exceededTransferLimit?: boolean;
  error?: any;
}

export interface TransformedStore {
  object_id: string;
  record_id: string;
  store_name: string;
  store_type: string;
  store_street_address: string;
  additional_address: string;
  city: string;
  state: string;
  zip_code: string;
  zip4: string;
  county: string;
  longitude: number;
  latitude: number;
  x: number;
  y: number;
  grantee_name: string;
  incentive_program: string;
}
