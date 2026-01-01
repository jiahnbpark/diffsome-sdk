/**
 * Shop types for Promptly SDK
 */

import type { Media, ListParams } from './common';

// ============================================
// Product Types
// ============================================

export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: number;
  parent?: ProductCategory;
  children?: ProductCategory[];
  products_count?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  sort_order: number;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: number;
  option_id: number;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku?: string;
  price?: number;
  compare_price?: number;
  stock_quantity: number;
  option_values: Record<string, string>;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id?: number;
  category?: ProductCategory;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  sku?: string;
  stock_quantity: number;
  track_inventory: boolean;
  thumbnail?: string;
  images?: string[];
  status: ProductStatus;
  is_featured: boolean;
  has_options: boolean;
  option_type?: 'single' | 'combination';
  options?: ProductOption[];
  variants?: ProductVariant[];
  weight?: number;
  meta?: Record<string, any>;
  sort_order: number;
  // Computed
  discount_percent?: number;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = 'draft' | 'active' | 'inactive';

export interface ProductListParams extends ListParams {
  category?: string;
  status?: ProductStatus;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  in_stock?: boolean;
}

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id?: number;
  product?: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  options?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  member_id?: number;
  session_id?: string;
  items: CartItem[];
  // Computed
  total: number;
  total_quantity: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  product_id: number;
  variant_id?: number;
  quantity: number;
  options?: Record<string, string>;
}

export interface UpdateCartItemData {
  quantity: number;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'ready'
  | 'done'
  | 'cancelled'
  | 'failed';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  variant_name?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  total: number;
  options?: Record<string, string>;
}

export interface Order {
  id: number;
  member_id?: number;
  order_number: string;
  status: OrderStatus;
  status_label?: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  coupon_id?: number;
  coupon_code?: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_status_label?: string;
  paid_at?: string;
  // Shipping info
  shipping_name: string;
  shipping_phone: string;
  shipping_zipcode: string;
  shipping_address: string;
  shipping_address_detail?: string;
  shipping_memo?: string;
  shipping_company?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  // Orderer info
  orderer_name: string;
  orderer_email: string;
  orderer_phone: string;
  // Relations
  items?: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  // Orderer info
  orderer_name: string;
  orderer_email: string;
  orderer_phone: string;
  // Shipping info
  shipping_name: string;
  shipping_phone: string;
  shipping_zipcode: string;
  shipping_address: string;
  shipping_address_detail?: string;
  shipping_memo?: string;
  // Optional
  coupon_code?: string;
  payment_method?: string;
}

export interface OrderListParams extends ListParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
}

// ============================================
// Payment Types
// ============================================

export type PaymentMethod =
  | 'CARD'
  | 'VIRTUAL_ACCOUNT'
  | 'TRANSFER'
  | 'MOBILE_PHONE'
  | 'CULTURE_GIFT_CERTIFICATE'
  | 'BOOK_GIFT_CERTIFICATE'
  | 'GAME_GIFT_CERTIFICATE';

export interface Payment {
  id: number;
  order_id: number;
  payment_key?: string;
  order_id_toss?: string;
  method?: PaymentMethod;
  method_label?: string;
  method_detail?: string;
  amount: number;
  status: PaymentStatus;
  status_label?: string;
  approved_at?: string;
  cancelled_at?: string;
  cancel_amount?: number;
  cancel_reason?: string;
  receipt_url?: string;
  // Card info
  card_number?: string;
  card_type?: string;
  installment_months?: number;
  // Virtual account
  virtual_account_number?: string;
  virtual_account_bank?: string;
  virtual_account_due_date?: string;
  // Error info
  error_code?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentReadyData {
  order_id: number;
  amount: number;
  order_name: string;
  customer_name: string;
  customer_email: string;
  success_url: string;
  fail_url: string;
}

export interface PaymentConfirmData {
  payment_key: string;
  order_id: string;
  amount: number;
}

export interface PaymentCancelData {
  cancel_reason: string;
  cancel_amount?: number;
}

// ============================================
// Coupon Types
// ============================================

export type CouponType = 'fixed' | 'percent';

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit?: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplyCouponData {
  code: string;
}

export interface CouponValidation {
  valid: boolean;
  message?: string;
  discount_amount?: number;
  coupon?: Coupon;
}
