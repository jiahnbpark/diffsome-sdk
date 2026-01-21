/**
 * Diffsome SDK Types
 * Different + Awesome = Diffsome
 * Auto-generated from OpenAPI spec
 * Run `npm run generate:types` to regenerate
 */

// Re-export all generated types
export * from './generated';

// Convenience type aliases for common schemas
export type { components, paths, operations } from './generated';

// Schema shortcuts
type Schemas = import('./generated').components['schemas'];

// Blog
export type BlogPost = Schemas['BlogPostResource'];
export type BlogPostCollection = Schemas['BlogPostCollection'];

// Board
export type Board = Schemas['BoardResource'];
export type BoardPost = Schemas['BoardPostResource'];
export type BoardCollection = Schemas['BoardCollection'];
export type BoardPostCollection = Schemas['BoardPostCollection'];

// Member
export type Member = Schemas['MemberResource'];

// Product
export type Product = Schemas['ProductResource'];
export type ProductCategory = Schemas['ProductCategoryResource'];
export type ProductAttribute = Schemas['ProductAttributeResource'];
export type ProductAttributeValue = Schemas['ProductAttributeValueResource'];
export type ProductVariant = Schemas['ProductVariantResource'];
export type ProductCollection = Schemas['ProductCollection'];
export type ProductCategoryCollection = Schemas['ProductCategoryCollection'];

/** @deprecated Use ProductAttribute instead */
export type ProductOption = Schemas['ProductAttributeResource'];
/** @deprecated Use ProductAttributeValue instead */
export type ProductOptionValue = Schemas['ProductAttributeValueResource'];

// Comment
export type Comment = Schemas['CommentResource'];
export type CommentCollection = Schemas['CommentCollection'];

// Form
export type Form = Schemas['Form'];

// ============================================
// Request/Response types (not in OpenAPI spec)
// ============================================

export interface DiffsomeConfig {
  tenantId: string;
  baseUrl?: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
  /**
   * Enable automatic token persistence to browser storage.
   * When true, tokens are automatically saved after login/register
   * and restored on SDK initialization.
   * @default false
   */
  persistToken?: boolean;
  /**
   * Storage type for token persistence.
   * - 'localStorage': Persists across browser sessions
   * - 'sessionStorage': Cleared when browser tab closes
   * @default 'localStorage'
   */
  storageType?: 'localStorage' | 'sessionStorage';
  /**
   * Custom storage key for the auth token.
   * @default 'diffsome_auth_token_{tenantId}'
   */
  storageKey?: string;
  /**
   * Callback fired when auth state changes (login, logout, token restore).
   * Useful for React state updates.
   * @param token - The auth token or null if logged out
   * @param user - The logged-in user (Member) or null/undefined
   */
  onAuthStateChange?: (token: string | null, user?: Member | null) => void;
}

/** @deprecated Use DiffsomeConfig instead */
export type PromptlyConfig = DiffsomeConfig;

// API Error
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface ListParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
  path?: string;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  meta: PaginationMeta;
}

// Alias for compatibility
export type ListResponse<T> = PaginatedResponse<T>;

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: Member;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface SocialProvider {
  name: string;
  enabled: boolean;
}

export interface SocialAuthUrl {
  url: string;
  provider: string;
}

// Blog
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  posts_count?: number;
}

export interface BlogListParams extends ListParams {
  category?: string;
  category_id?: number;
  tag?: string;
  search?: string;
}

// Board
export interface BoardListParams extends ListParams {
  search?: string;
}

export interface BoardPostListParams extends ListParams {
  search?: string;
  is_notice?: boolean;
}

export interface CreateBoardPostData {
  board_id: number;
  title: string;
  content: string;
  is_notice?: boolean;
  is_secret?: boolean;
  password?: string;
}

export interface UpdateBoardPostData {
  title?: string;
  content?: string;
  is_notice?: boolean;
  is_secret?: boolean;
}

// Board aliases for compatibility
export type PostListParams = BoardPostListParams;
export type CreatePostData = CreateBoardPostData;
export type UpdatePostData = UpdateBoardPostData;
export type BoardComment = Comment;

// Product
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

// Cart (not in OpenAPI)
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id?: number;
  product?: Product;
  variant?: ProductVariant;
  product_name?: string;
  variant_name?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  shipping_fee?: number;
  in_stock?: boolean;
  options?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface CartShippingInfo {
  is_free: boolean;
  free_shipping_applied?: boolean;
  remaining_for_free?: number | null;
  message?: string | null;
  notice?: string | null;
}

export interface Cart {
  id: number;
  member_id?: number;
  session_id?: string;
  items: CartItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  total_quantity: number;
  item_count: number;
  shipping_info?: CartShippingInfo;
  created_at?: string;
  updated_at?: string;
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

// Order (not in OpenAPI)
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
  product?: Product;
  product_name: string;
  variant_name?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  total: number;
  options?: Record<string, string>;
}

export interface OrderShipping {
  name: string;
  phone: string;
  zipcode?: string;
  address: string;
  address_detail?: string;
  memo?: string;
  company?: string;
  tracking_number?: string;
}

export interface OrderOrderer {
  name: string;
  email: string;
  phone: string;
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
  shipped_at?: string;
  delivered_at?: string;
  can_cancel?: boolean;
  shipping?: OrderShipping;
  orderer?: OrderOrderer;
  items?: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at?: string;
}

export interface CreateOrderData {
  orderer_name: string;
  orderer_email: string;
  orderer_phone: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_zipcode: string;
  shipping_address: string;
  shipping_address_detail?: string;
  shipping_memo?: string;
  coupon_code?: string;
  payment_method?: string;
}

export interface OrderListParams extends ListParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
}

// Payment (not in OpenAPI)
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
  card_number?: string;
  card_type?: string;
  installment_months?: number;
  virtual_account_number?: string;
  virtual_account_bank?: string;
  virtual_account_due_date?: string;
  error_code?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TossPaymentReadyData {
  order_number: string;
  success_url: string;
  fail_url: string;
}

export interface TossPaymentReadyResponse {
  success: boolean;
  payment_id: number;
  order_id: string;
  order_name: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  success_url: string;
  fail_url: string;
  client_key: string;
}

export interface TossPaymentConfirmData {
  payment_key: string;
  order_id: string;
  amount: number;
}

export interface TossPaymentConfirmResponse {
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  payment?: {
    method: string;
    method_label: string;
    method_detail?: string;
    receipt_url?: string;
    approved_at?: string;
  };
}

// Payment aliases
export type PaymentReadyData = TossPaymentReadyData;
export type PaymentConfirmData = TossPaymentConfirmData;

export interface PaymentCancelData {
  cancel_reason: string;
  cancel_amount?: number;
}

// Stripe Payment
export interface StripeCheckoutData {
  order_number: string;
  success_url: string;
  cancel_url: string;
}

export interface StripeCheckoutResponse {
  success: boolean;
  session_id: string;
  checkout_url: string;
}

export interface StripeVerifyData {
  session_id: string;
}

export interface StripeVerifyResponse {
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  payment?: {
    method: string;
    approved_at?: string;
  };
}

export interface PaymentStatusResponse {
  toss: {
    available: boolean;
  };
  stripe: {
    available: boolean;
    publishable_key?: string;
  };
}

// Product Review
export interface ProductReviewAuthor {
  id: number;
  name: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_featured: boolean;
  helpful_count: number;
  author?: ProductReviewAuthor;
  admin_reply?: string;
  admin_replied_at?: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductReviewStats {
  average_rating: number;
  total_count: number;
  rating_counts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProductReviewListParams extends ListParams {
  rating?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export interface CreateProductReviewData {
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

export interface UpdateProductReviewData {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: 'not_logged_in' | 'already_reviewed' | 'not_purchased';
}

// Coupon (not in OpenAPI)
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

// Comment
export interface CreateCommentData {
  content: string;
  parent_id?: number;
  is_secret?: boolean;
  author_name?: string;
  password?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentListParams extends ListParams {
  commentable_type: 'board_post' | 'blog_post' | 'page';
  commentable_id: number;
}

// Form
export interface FormSubmissionData {
  [key: string]: any;
}

export type SubmitFormData = FormSubmissionData;

export interface FormSubmission {
  id: number;
  form_id: number;
  data: Record<string, any>;
  created_at: string;
}

export interface FormListParams extends ListParams {
  search?: string;
}

export interface SubmissionListParams extends ListParams {
  form_id?: number;
}

// Media
export interface Media {
  id: number;
  filename: string;
  path: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}

// Entity
export interface EntityField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'datetime' | 'boolean' | 'select' | 'file' | 'image' | 'relation';
  required?: boolean;
  options?: { value: string; label: string }[];
  relation?: {
    entity: string;
    display_field: string;
  };
}

export interface EntitySchema {
  fields: EntityField[];
}

export interface Entity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  schema: EntitySchema;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntityRecord {
  id: number;
  entity_id: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityData {
  name: string;
  slug: string;
  description?: string;
  schema: EntitySchema;
}

export interface UpdateEntityData {
  name?: string;
  description?: string;
  schema?: EntitySchema;
  is_active?: boolean;
}

// Entity aliases
export type CustomEntity = Entity;

export interface EntityListParams extends ListParams {
  search?: string;
  filters?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}

export interface CreateEntityRecordData {
  [key: string]: any;
}

export interface UpdateEntityRecordData {
  [key: string]: any;
}

// Reservation
export interface ReservationServiceStaff {
  id: number;
  name: string;
  avatar?: string;
}

export interface ReservationService {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  price: number;
  requires_staff: boolean;
  requires_payment: boolean;
  deposit?: number;
  staffs: ReservationServiceStaff[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationStaff {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationSlot {
  id: number;
  service_id: number;
  staff_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Reservation {
  id: number;
  service_id: number;
  staff_id?: number;
  member_id?: number;
  slot_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  service_id: number;
  slot_id: number;
  staff_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
}

export interface CreateReservationResult {
  success: boolean;
  reservation: Reservation;
  message?: string;
}

export interface ReservationSettings {
  min_advance_hours: number;
  max_advance_days: number;
  slot_duration: number;
  working_hours: {
    start: string;
    end: string;
  };
  working_days: number[];
}

export interface AvailableDatesParams {
  service_id: number;
  staff_id?: number;
  month?: string;
}

export interface AvailableSlotsParams {
  service_id: number;
  staff_id?: number;
  date: string;
}

export interface ReservationListParams extends ListParams {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  service_id?: number;
  staff_id?: number;
  start_date?: string;
  end_date?: string;
}

// Wishlist
export interface WishlistItem {
  id: number;
  product_id: number;
  variant_id?: number;
  note?: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string;
    sale_price?: number;
    regular_price?: number;
    status: string;
    stock_quantity?: number;
    in_stock: boolean;
  };
  variant?: {
    id: number;
    option_values?: Record<string, string>;
    sale_price?: number;
    regular_price?: number;
    stock_quantity?: number;
    image?: string;
    is_active: boolean;
  };
  created_at: string;
}

export interface WishlistToggleResult {
  action: 'added' | 'removed';
  in_wishlist: boolean;
}

export interface WishlistCheckResult {
  in_wishlist: boolean;
}

export interface WishlistCheckBulkResult {
  items: Record<string, boolean>;
}

export interface WishlistMoveToCartResult {
  moved: Array<{
    id: number;
    product_id: number;
    variant_id?: number;
  }>;
  failed: Array<{
    id: number;
    product_id: number;
    reason: string;
  }>;
  moved_count: number;
  failed_count: number;
}

export interface AddToWishlistData {
  product_id: number;
  variant_id?: number;
  note?: string;
}

export interface WishlistListParams extends ListParams {
  // No additional params
}

// ============================================
// Product Type (Digital, Subscription, Bundle)
// ============================================

export type ProductType = 'physical' | 'digital' | 'subscription' | 'bundle';

// Digital Product
export interface DigitalFile {
  id: number;
  name: string;
  original_filename: string;
  mime_type?: string;
  file_size: number;
  file_size_human: string;
  extension: string;
}

export interface DigitalDownloadLink {
  id: number;
  token: string;
  file?: DigitalFile;
  order_id: number;
  download_count: number;
  download_limit?: number;
  remaining_downloads?: number;
  can_download: boolean;
  blocked_reason?: 'expired' | 'limit_exceeded';
  expires_at?: string;
  first_downloaded_at?: string;
  last_downloaded_at?: string;
  created_at: string;
}

// Subscription
export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled' | 'expired';

export interface SubscriptionPlan {
  id: number;
  name?: string;
  interval: SubscriptionInterval;
  interval_count: number;
  interval_label: string;
  price: number;
  price_display: string;
  trial_days: number;
  features?: string[];
}

export interface MemberSubscription {
  id: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string;
  };
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  status_label: string;
  current_price: number;
  is_active: boolean;
  on_trial: boolean;
  is_canceled: boolean;
  is_paused: boolean;
  days_until_renewal?: number;
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  created_at: string;
}

export interface CreateSubscriptionData {
  plan_id: number;
  payment_method_id: string;
}

export interface CreateSubscriptionResult {
  subscription: MemberSubscription;
  client_secret?: string;
}

export interface SetupIntentResult {
  client_secret: string;
}

// Bundle
export interface BundleItem {
  product_id: number;
  variant_id?: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface BundlePricing {
  items: BundleItem[];
  original_total: number;
  discount_type?: 'fixed' | 'percent';
  discount_value: number;
  discount_amount: number;
  final_price: number;
  savings_percent: number;
}

// Extended Product List Params with type filter
export interface ProductListParamsExtended extends ProductListParams {
  type?: ProductType;
}
