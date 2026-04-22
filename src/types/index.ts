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
  unit: "roll" | "pieces";
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

export interface ProductTypeRow {
  id: string;
  name: string;
  sort_order: number;
}

export interface CostingCategoryRow {
  id: string;
  name: string;
  sort_order: number;
}

export interface DesignFamilyRow {
  id: string;
  name: string;
  sort_order: number;
}

export interface Product {
  id: string;
  item_code: string;
  description: string;
  category_id: string;
  image_url: string | null;
  type_id: string | null;
  costing_category_id: string | null;
  design_family_id: string | null;
  comment: string | null;
  low_stock_threshold: number;
  is_phased_out: boolean;
  created_at: string;
  updated_at: string;
  // Computed / joined
  category?: Category;
  suppliers?: Supplier[];
  stock_unit?: "roll" | "pieces"; // from view (category.unit)
  total_stock?: number;
  active_count?: number;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock" | "phased_out";
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

export interface PieceBatch {
  id: string;
  product_id: string;
  batch_number: string;
  initial_count: number;
  current_count: number;
  status: "active" | "finished";
  shipment_id: string | null;
  received_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  product?: Product;
}

export interface StockUsage {
  id: string;
  bride_id: string;
  roll_id: string | null;
  batch_id: string | null;
  quantity_used: number;
  logged_by: string;
  usage_date: string;
  notes: string | null;
  created_at: string;
  // Joined
  bride?: Bride;
  roll?: Roll & { product?: Product };
  batch?: PieceBatch & { product?: Product };
  logged_by_profile?: Profile;
}

export type ShipmentStatus = "pending" | "received" | "cancelled";
export type InputUnit = "meters" | "yards" | "pieces";
export type StockUnit = "roll" | "pieces";

export interface Shipment {
  id: string;
  shipment_number: string;
  supplier_id: string | null;
  status: ShipmentStatus;
  date: string | null;
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
  supplier_id: string | null;
  quantity: number;
  input_unit: InputUnit;
  quantity_in_meters: number;
  num_rolls: number;
  notes: string | null;
  created_at: string;
  // Joined
  product?: Product;
  supplier?: Supplier;
}

export type AdjustmentType = "addition" | "deduction" | "damage" | "correction";

export interface StockAdjustment {
  id: string;
  roll_id: string | null;
  batch_id: string | null;
  adjustment_type: AdjustmentType;
  quantity: number;
  reason: string;
  adjusted_by: string;
  created_at: string;
  // Joined
  roll?: Roll & { product?: Product };
  batch?: PieceBatch & { product?: Product };
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
