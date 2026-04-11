export type UserRole = "admin" | "inventory_manager" | "viewer";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  item_code: string;
  description: string;
  category_id: string;
  sub_type: string | null;
  image_url: string | null;
  low_stock_threshold: number;
  is_phased_out: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  category?: Category;
  total_stock_m?: number;
  active_roll_count?: number;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
}

export type RollStatus = "active" | "finished";

export interface Roll {
  id: string;
  product_id: string;
  roll_number: string;
  initial_length_m: number;
  current_length_m: number;
  is_full_roll: boolean;
  status: RollStatus;
  shipment_id: string | null;
  received_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  product?: Product;
}

export interface Bride {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  wedding_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockUsage {
  id: string;
  bride_id: string;
  roll_id: string;
  quantity_used: number;
  logged_by: string;
  usage_date: string;
  notes: string | null;
  created_at: string;
  // Joined
  bride?: Bride;
  roll?: Roll & { product?: Product };
  logged_by_profile?: Profile;
}

export type ShipmentStatus = "pending" | "received" | "cancelled";
export type InputUnit = "meters" | "yards";

export interface Shipment {
  id: string;
  shipment_number: string;
  supplier_id: string;
  status: ShipmentStatus;
  expected_date: string | null;
  received_date: string | null;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  supplier?: Supplier;
  items?: ShipmentItem[];
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  product_id: string;
  quantity: number;
  input_unit: InputUnit;
  quantity_in_meters: number;
  num_rolls: number;
  notes: string | null;
  created_at: string;
  // Joined
  product?: Product;
}

export type AdjustmentType = "addition" | "deduction" | "damage" | "correction";

export interface StockAdjustment {
  id: string;
  roll_id: string;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string;
  adjusted_by: string;
  created_at: string;
  // Joined
  roll?: Roll & { product?: Product };
  adjusted_by_profile?: Profile;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  // Joined
  user?: Profile;
}
