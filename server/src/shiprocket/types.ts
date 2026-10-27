export interface ShiprocketAuthResponse {
  token: string;
  created_at?: string;
  expires_in_hours?: number;
}

export interface ShiprocketCourierOption {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd?: string | number;
  estimated_delivery_days?: string | number;
  freight_charge?: number;
  cod?: number;
  available?: boolean;
}

export interface ShiprocketServiceabilityResponse {
  status?: number;
  message?: string;
  data?: {
    available_courier_companies?: ShiprocketCourierOption[];
  };
}

export interface ShiprocketCreateOrderInput {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
  }>;
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketCreateOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code?: number;
  awb_code?: string;
  courier_company_id?: string | number;
  courier_name?: string;
  channel_order_id?: string;
}

export interface ShiprocketAssignAwbResponse {
  awb_assign_status?: number;
  response?: {
    data?: {
      awb_code?: string;
      courier_company_id?: number;
      courier_name?: string;
      assigned_date_time?: string;
      freight_charges?: number;
    };
  };
}

export interface ShiprocketTrackingScan {
  date?: string;
  status?: string;
  activity?: string;
  location?: string;
  'sr-status'?: string;
  'sr-status-label'?: string;
}

export interface ShiprocketTrackResponse {
  tracking_data?: {
    track_status?: number;
    shipment_status?: number | string;
    shipment_track?: Array<{
      awb_code?: string;
      courier_name?: string;
      current_status?: string;
      etd?: string;
    }>;
    shipment_track_activities?: ShiprocketTrackingScan[];
    track_url?: string;
  };
}

export interface NormalizedCourierRate {
  courierId: number;
  courierName: string;
  ratePaise: number;
  etdDays: number | null;
  raw: ShiprocketCourierOption;
}

export interface NormalizedTrackingEvent {
  providerEventKey: string;
  eventCode: string | null;
  eventLabel: string;
  eventAt: string;
  location: string | null;
}

export type ShipmentStatus =
  | 'pending'
  | 'created'
  | 'awb_assigned'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'exception'
  | 'rto_initiated'
  | 'rto_delivered'
  | 'cancelled'
  | 'failed';
