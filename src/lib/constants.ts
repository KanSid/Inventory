export const ACTION_TYPES = {
  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_PHASED_OUT: "product_phased_out",
  ROLL_ADDED: "roll_added",
  STOCK_USED: "stock_used",
  ADJUSTMENT_MADE: "adjustment_made",
  SHIPMENT_CREATED: "shipment_created",
  SHIPMENT_RECEIVED: "shipment_received",
  SHIPMENT_CANCELLED: "shipment_cancelled",
  BRIDE_ADDED: "bride_added",
  USER_LOGIN: "user_login",
  USER_ROLE_CHANGED: "user_role_changed",
  CATEGORY_CREATED: "category_created",
  CATEGORY_UPDATED: "category_updated",
  SUPPLIER_CREATED: "supplier_created",
  SUPPLIER_UPDATED: "supplier_updated",
} as const;

export const ENTITY_TYPES = {
  PRODUCT: "product",
  ROLL: "roll",
  SHIPMENT: "shipment",
  BRIDE: "bride",
  USER: "user",
  CATEGORY: "category",
  SUPPLIER: "supplier",
  ADJUSTMENT: "adjustment",
  USAGE: "usage",
} as const;

export const STOCK_STATUS_COLORS = {
  in_stock: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  low_stock: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  out_of_stock: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  phased_out: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
} as const;

export const ATELIER_CHART_COLORS = {
  primary: "#735b2c",      // Harvest Gold
  secondary: "#a68b54",    // Light Gold
  tertiary: "#c4a265",     // Bright Gold
  complementary: "#5b8a72", // Muted Sage
  accent: "#8b6e4e",       // Warm Bronze
} as const;

export const CHART_COLOR_ARRAY = [
  ATELIER_CHART_COLORS.primary,
  ATELIER_CHART_COLORS.secondary,
  ATELIER_CHART_COLORS.tertiary,
  ATELIER_CHART_COLORS.complementary,
  ATELIER_CHART_COLORS.accent,
] as const;
