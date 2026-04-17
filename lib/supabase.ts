import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// تعريفات الأنواع (Type Definitions)
// ============================================

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  items: CartItem[];
  total_amount: number;
  discount_amount?: number;
  coupon_code?: string;    
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  yallapay_reference: string | null;
  created_at: string;
};

export type OrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: CartItem[];
  total_amount: number;
  payment_method: string;
};

export type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
};

export type ProductWithStock = Product & {
  low_stock_threshold: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
};

export type ProductWithCost = Product & {
  cost_price: number;
  sku: string | null;
  supplier: string | null;
  location: string | null;
  reorder_point: number;
  last_restocked: string | null;
  total_sold: number;
  total_revenue: number;
  total_profit: number;
  profit_margin: number;
};

export type StockMovement = {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  old_quantity: number;
  new_quantity: number;
  reference: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type MonthlyReport = {
  id: string;
  year: number;
  month: number;
  total_orders: number;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  avg_order_value: number;
  top_product_id: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type CouponUsage = {
  id: string;
  coupon_id: string;
  order_id: string;
  customer_phone: string;
  discount_amount: number;
  created_at: string;
};
export type Category = {
  id: string;
  name: string;
  name_en: string | null;
  icon: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};