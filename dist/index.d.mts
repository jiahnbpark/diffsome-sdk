/**
 * Common types for Promptly SDK
 */
interface PromptlyConfig {
    /** Tenant ID (subdomain) */
    tenantId: string;
    /** Base URL of Promptly API */
    baseUrl?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
}
interface ApiResponse<T> {
    data: T;
    message?: string;
}
/**
 * Pagination metadata
 */
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
/**
 * Unified list response - ALWAYS returns this structure for list APIs
 * - data is ALWAYS an array (never null/undefined)
 * - meta contains pagination info
 */
interface ListResponse<T> {
    /** Array of items - guaranteed to be an array (empty if no data) */
    data: T[];
    /** Pagination metadata */
    meta: PaginationMeta;
}
/**
 * @deprecated Use ListResponse<T> instead. Kept for backward compatibility.
 */
interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}
interface ListParams {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}
interface Media {
    id: number;
    url: string;
    thumbnail_url?: string;
    filename: string;
    mime_type: string;
    size: number;
    created_at: string;
}

/**
 * Auth types for Promptly SDK
 */
interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
}
interface Member {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
interface AuthResponse {
    member: Member;
    token: string;
    token_type: string;
}
interface ForgotPasswordData {
    email: string;
}
interface ResetPasswordData {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}
interface SocialProvider {
    name: string;
    enabled: boolean;
}
interface SocialAuthUrl {
    url: string;
    provider: string;
}
interface UpdateProfileData {
    name?: string;
    phone?: string;
    avatar?: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
}

/**
 * Board types for Promptly SDK
 */

interface Board {
    id: number;
    slug: string;
    name: string;
    description?: string;
    settings: BoardSettings;
    posts_count?: number;
    created_at: string;
    updated_at: string;
}
interface BoardSettings {
    allow_comments: boolean;
    allow_attachments: boolean;
    require_login_to_view: boolean;
    require_login_to_write: boolean;
    posts_per_page: number;
}
interface BoardPost {
    id: number;
    board_id: number;
    board?: Board;
    member_id?: number;
    member?: Member;
    title: string;
    content: string;
    excerpt?: string;
    is_notice: boolean;
    is_private: boolean;
    view_count: number;
    comment_count: number;
    attachments?: Media[];
    created_at: string;
    updated_at: string;
}
interface BoardComment {
    id: number;
    post_id: number;
    member_id?: number;
    member?: Member;
    parent_id?: number;
    content: string;
    replies?: BoardComment[];
    created_at: string;
    updated_at: string;
}
interface BoardListParams extends ListParams {
}
interface PostListParams extends ListParams {
    search?: string;
    is_notice?: boolean;
}
interface CreatePostData {
    board_id: number;
    title: string;
    content: string;
    is_notice?: boolean;
    is_private?: boolean;
    attachments?: number[];
}
interface UpdatePostData {
    title?: string;
    content?: string;
    is_notice?: boolean;
    is_private?: boolean;
    attachments?: number[];
}
interface CreateCommentData {
    content: string;
    parent_id?: number;
}
interface UpdateCommentData {
    content: string;
}

/**
 * Blog types for Promptly SDK
 */

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    category?: string;
    tags?: string[];
    author_name?: string;
    is_published: boolean;
    published_at?: string;
    view_count: number;
    seo_title?: string;
    seo_description?: string;
    created_at: string;
    updated_at: string;
}
interface BlogListParams extends ListParams {
    category?: string;
    tag?: string;
    search?: string;
}

/**
 * Form types for Promptly SDK
 */

interface Form {
    id: number;
    slug: string;
    name: string;
    description?: string;
    fields: FormField[];
    settings: FormSettings;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
interface FormField {
    id: string;
    type: FormFieldType;
    name: string;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: FormFieldOption[];
    validation?: FormFieldValidation;
}
type FormFieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'file';
interface FormFieldOption {
    label: string;
    value: string;
}
interface FormFieldValidation {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
}
interface FormSettings {
    submit_button_text: string;
    success_message: string;
    redirect_url?: string;
    notify_email?: string;
}
interface FormSubmission {
    id: number;
    form_id: number;
    form?: Form;
    member_id?: number;
    data: Record<string, any>;
    status: 'pending' | 'reviewed' | 'completed';
    created_at: string;
    updated_at: string;
}
interface SubmitFormData {
    [key: string]: any;
}
interface FormListParams extends ListParams {
}
interface SubmissionListParams extends ListParams {
    form_id?: number;
    status?: string;
}

/**
 * Shop types for Promptly SDK
 */

interface ProductCategory {
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
interface ProductOption {
    id: number;
    product_id: number;
    name: string;
    sort_order: number;
    values: ProductOptionValue[];
}
interface ProductOptionValue {
    id: number;
    option_id: number;
    value: string;
    sort_order: number;
}
interface ProductVariant {
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
interface Product {
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
    discount_percent?: number;
    in_stock?: boolean;
    min_price?: number;
    max_price?: number;
    created_at: string;
    updated_at: string;
}
type ProductStatus = 'draft' | 'active' | 'inactive';
interface ProductListParams extends ListParams {
    category?: string;
    status?: ProductStatus;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    search?: string;
    in_stock?: boolean;
}
interface CartItem {
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
interface Cart {
    id: number;
    member_id?: number;
    session_id?: string;
    items: CartItem[];
    total: number;
    total_quantity: number;
    item_count: number;
    created_at: string;
    updated_at: string;
}
interface AddToCartData {
    product_id: number;
    variant_id?: number;
    quantity: number;
    options?: Record<string, string>;
}
interface UpdateCartItemData {
    quantity: number;
}
type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'ready' | 'done' | 'cancelled' | 'failed';
interface OrderItem {
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
interface Order {
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
    orderer_name: string;
    orderer_email: string;
    orderer_phone: string;
    items?: OrderItem[];
    payment?: Payment;
    created_at: string;
    updated_at: string;
}
interface CreateOrderData {
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
interface OrderListParams extends ListParams {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    start_date?: string;
    end_date?: string;
}
type PaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT' | 'TRANSFER' | 'MOBILE_PHONE' | 'CULTURE_GIFT_CERTIFICATE' | 'BOOK_GIFT_CERTIFICATE' | 'GAME_GIFT_CERTIFICATE';
interface Payment {
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
interface PaymentReadyData {
    order_id: number;
    amount: number;
    order_name: string;
    customer_name: string;
    customer_email: string;
    success_url: string;
    fail_url: string;
}
interface PaymentConfirmData {
    payment_key: string;
    order_id: string;
    amount: number;
}
interface PaymentCancelData {
    cancel_reason: string;
    cancel_amount?: number;
}
type CouponType = 'fixed' | 'percent';
interface Coupon {
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
interface ApplyCouponData {
    code: string;
}
interface CouponValidation {
    valid: boolean;
    message?: string;
    discount_amount?: number;
    coupon?: Coupon;
}

/**
 * Custom Entity types for Promptly SDK
 */
interface EntityField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect';
    required?: boolean;
    searchable?: boolean;
    default?: any;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
interface EntitySchema {
    fields: EntityField[];
    display?: {
        title_field?: string;
        list_fields?: string;
    };
}
interface CustomEntity {
    id: number;
    name: string;
    slug: string;
    description?: string;
    schema: EntitySchema;
    icon?: string;
    is_active: boolean;
    records_count?: number;
    created_at: string;
    updated_at: string;
}
interface EntityRecord {
    id: number;
    entity_id: number;
    data: Record<string, any>;
    status: 'active' | 'archived' | 'draft';
    created_by?: number;
    updated_by?: number;
    created_at: string;
    updated_at: string;
}
interface EntityListParams {
    page?: number;
    per_page?: number;
    status?: 'active' | 'archived' | 'draft';
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    [key: string]: any;
}
interface CreateEntityRecordData {
    data: Record<string, any>;
    status?: 'active' | 'archived' | 'draft';
}
interface UpdateEntityRecordData {
    data?: Record<string, any>;
    status?: 'active' | 'archived' | 'draft';
}

/**
 * Reservation types for Promptly SDK
 */
interface ReservationService {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    duration: number;
    price: number;
    requires_staff: boolean;
    requires_payment: boolean;
    deposit: number;
    staffs: ReservationStaffSummary[];
}
interface ReservationStaff {
    id: number;
    name: string;
    avatar: string | null;
    bio: string | null;
}
interface ReservationStaffSummary {
    id: number;
    name: string;
    avatar: string | null;
}
interface ReservationSlot {
    time: string;
    available: boolean;
    staff_id?: number;
}
interface ReservationSettings {
    timezone: string;
    slot_interval: number;
    min_notice_hours: number;
    max_advance_days: number;
    cancellation_hours: number;
    allow_online_payment: boolean;
    bookable_date_range: {
        start: string;
        end: string;
    };
}
interface Reservation {
    id: number;
    reservation_number: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    status_label: string;
    reservation_date: string;
    start_time: string;
    end_time: string;
    time_range: string;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    price: number;
    deposit: number;
    payment_status: 'pending' | 'paid' | 'refunded' | 'partial';
    payment_status_label: string;
    customer_memo: string | null;
    can_cancel: boolean;
    service: {
        id: number;
        name: string;
        duration: number;
    } | null;
    staff: ReservationStaffSummary | null;
    created_at: string;
}
interface CreateReservationData {
    service_id: number;
    staff_id?: number;
    reservation_date: string;
    start_time: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    customer_memo?: string;
}
interface CreateReservationResult {
    reservation: Reservation;
    requires_payment: boolean;
    deposit: number;
}
interface AvailableDatesParams {
    service_id: number;
    staff_id?: number;
    start_date?: string;
    end_date?: string;
}
interface AvailableSlotsParams {
    service_id: number;
    date: string;
    staff_id?: number;
}
interface ReservationListParams {
    status?: string;
    upcoming?: boolean;
    past?: boolean;
    per_page?: number;
    page?: number;
}

/**
 * HTTP Client for Promptly SDK
 */

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, any>;
    params?: Record<string, any>;
    headers?: Record<string, string>;
}
declare class PromptlyError extends Error {
    status: number;
    errors?: Record<string, string[]>;
    constructor(message: string, status: number, errors?: Record<string, string[]>);
}
declare class HttpClient {
    private baseUrl;
    private tenantId;
    private timeout;
    private token;
    constructor(config: PromptlyConfig);
    /**
     * Set authentication token
     */
    setToken(token: string | null): void;
    /**
     * Get current token
     */
    getToken(): string | null;
    /**
     * Check if authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Build full URL with query params
     */
    private buildUrl;
    /**
     * Build request headers
     */
    private buildHeaders;
    /**
     * Make HTTP request
     */
    request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
    /**
     * GET request
     */
    get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
    /**
     * GET request for list endpoints - ALWAYS returns normalized ListResponse
     * Guarantees: data is always an array, meta is always present
     */
    getList<T>(endpoint: string, params?: Record<string, any>): Promise<ListResponse<T>>;
    /**
     * POST request
     */
    post<T>(endpoint: string, body?: Record<string, any>): Promise<T>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, body?: Record<string, any>): Promise<T>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body?: Record<string, any>): Promise<T>;
    /**
     * DELETE request
     */
    delete<T>(endpoint: string): Promise<T>;
    /**
     * Upload file
     */
    upload<T>(endpoint: string, file: File | Blob, fieldName?: string): Promise<T>;
}

/**
 * Auth Resource for Promptly SDK
 */

declare class AuthResource {
    private http;
    constructor(http: HttpClient);
    /**
     * Login with email and password
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    /**
     * Register new member
     */
    register(data: RegisterData): Promise<AuthResponse>;
    /**
     * Logout current user
     */
    logout(): Promise<void>;
    /**
     * Get current user profile
     */
    me(): Promise<Member>;
    /**
     * Update profile
     */
    updateProfile(data: UpdateProfileData): Promise<Member>;
    /**
     * Send password reset email
     */
    forgotPassword(data: ForgotPasswordData): Promise<{
        message: string;
    }>;
    /**
     * Reset password with token
     */
    resetPassword(data: ResetPasswordData): Promise<{
        message: string;
    }>;
    /**
     * Get available social login providers
     */
    getSocialProviders(): Promise<SocialProvider[]>;
    /**
     * Get social login redirect URL
     */
    getSocialAuthUrl(provider: string): Promise<SocialAuthUrl>;
    /**
     * Handle social login callback
     */
    socialCallback(provider: string, code: string): Promise<AuthResponse>;
    /**
     * Set token manually (e.g., from localStorage)
     */
    setToken(token: string | null): void;
    /**
     * Get current token
     */
    getToken(): string | null;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
}

/**
 * Board Resource for Promptly SDK
 */

declare class BoardsResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List all boards
     * @returns ListResponse with data array (always defined) and pagination meta
     */
    list(params?: BoardListParams): Promise<ListResponse<Board>>;
    /**
     * Get board by ID or slug
     */
    get(idOrSlug: number | string): Promise<Board>;
    /**
     * List posts in a board
     * @returns ListResponse with data array and pagination meta
     */
    listPosts(boardIdOrSlug: number | string, params?: PostListParams): Promise<ListResponse<BoardPost>>;
    /**
     * Get post by ID
     */
    getPost(postId: number): Promise<BoardPost>;
    /**
     * Create new post
     */
    createPost(data: CreatePostData): Promise<BoardPost>;
    /**
     * Update post
     */
    updatePost(postId: number, data: UpdatePostData): Promise<BoardPost>;
    /**
     * Delete post
     */
    deletePost(postId: number): Promise<void>;
    /**
     * List comments for a post
     * @returns Array of comments (always an array, never null/undefined)
     */
    listComments(postId: number): Promise<BoardComment[]>;
    /**
     * Create comment on a post
     */
    createComment(postId: number, data: CreateCommentData): Promise<BoardComment>;
    /**
     * Update comment
     */
    updateComment(commentId: number, data: UpdateCommentData): Promise<BoardComment>;
    /**
     * Delete comment
     */
    deleteComment(commentId: number): Promise<void>;
}

/**
 * Blog Resource for Promptly SDK
 */

declare class BlogResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List blog posts
     * @returns ListResponse with data array (always defined) and pagination meta
     */
    list(params?: BlogListParams): Promise<ListResponse<BlogPost>>;
    /**
     * Get blog post by slug
     */
    get(slug: string): Promise<BlogPost>;
    /**
     * Get blog post by ID
     */
    getById(id: number): Promise<BlogPost>;
    /**
     * Get featured blog posts
     * @returns Array of featured posts (always an array, never null/undefined)
     */
    featured(limit?: number): Promise<BlogPost[]>;
    /**
     * Get blog posts by category
     * @returns ListResponse with data array and pagination meta
     */
    byCategory(category: string, params?: Omit<BlogListParams, 'category'>): Promise<ListResponse<BlogPost>>;
    /**
     * Get blog posts by tag
     * @returns ListResponse with data array and pagination meta
     */
    byTag(tag: string, params?: Omit<BlogListParams, 'tag'>): Promise<ListResponse<BlogPost>>;
    /**
     * Search blog posts
     * @returns ListResponse with data array and pagination meta
     */
    search(query: string, params?: Omit<BlogListParams, 'search'>): Promise<ListResponse<BlogPost>>;
    /**
     * Get blog categories
     * @returns Array of category names (always an array)
     */
    categories(): Promise<string[]>;
    /**
     * Get blog tags
     * @returns Array of tag names (always an array)
     */
    tags(): Promise<string[]>;
}

/**
 * Form Resource for Promptly SDK
 */

declare class FormsResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List all forms
     * @returns ListResponse with data array and pagination meta
     */
    list(params?: FormListParams): Promise<ListResponse<Form>>;
    /**
     * Get form by ID or slug
     */
    get(idOrSlug: number | string): Promise<Form>;
    /**
     * Submit form data
     */
    submit(formIdOrSlug: number | string, data: SubmitFormData): Promise<FormSubmission>;
    /**
     * Get my form submissions
     * @returns ListResponse with data array and pagination meta
     */
    mySubmissions(params?: SubmissionListParams): Promise<ListResponse<FormSubmission>>;
    /**
     * Get specific submission
     */
    getSubmission(submissionId: number): Promise<FormSubmission>;
}

/**
 * Shop Resource for Promptly SDK
 */

declare class ShopResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List products
     * @returns ListResponse with data array and pagination meta
     */
    listProducts(params?: ProductListParams): Promise<ListResponse<Product>>;
    /**
     * Get product by ID or slug
     */
    getProduct(idOrSlug: number | string): Promise<Product>;
    /**
     * Get featured products
     * @returns Array of featured products (always an array)
     */
    featuredProducts(limit?: number): Promise<Product[]>;
    /**
     * Search products
     * @returns ListResponse with data array and pagination meta
     */
    searchProducts(query: string, params?: Omit<ProductListParams, 'search'>): Promise<ListResponse<Product>>;
    /**
     * List product categories
     * @returns Array of categories (always an array)
     */
    listCategories(): Promise<ProductCategory[]>;
    /**
     * Get category by ID or slug
     */
    getCategory(idOrSlug: number | string): Promise<ProductCategory>;
    /**
     * Get products in category
     * @returns ListResponse with data array and pagination meta
     */
    categoryProducts(categoryIdOrSlug: number | string, params?: Omit<ProductListParams, 'category'>): Promise<ListResponse<Product>>;
    /**
     * Get current cart
     */
    getCart(): Promise<Cart>;
    /**
     * Add item to cart
     */
    addToCart(data: AddToCartData): Promise<Cart>;
    /**
     * Update cart item quantity
     */
    updateCartItem(itemId: number, data: UpdateCartItemData): Promise<Cart>;
    /**
     * Remove item from cart
     */
    removeFromCart(itemId: number): Promise<Cart>;
    /**
     * Clear entire cart
     */
    clearCart(): Promise<void>;
    /**
     * List my orders
     * @returns ListResponse with data array and pagination meta
     */
    listOrders(params?: OrderListParams): Promise<ListResponse<Order>>;
    /**
     * Get order by ID or order number
     */
    getOrder(idOrNumber: number | string): Promise<Order>;
    /**
     * Create order from cart
     */
    createOrder(data: CreateOrderData): Promise<Order>;
    /**
     * Cancel order
     */
    cancelOrder(orderId: number): Promise<Order>;
    /**
     * Get payment for order
     */
    getPayment(orderId: number): Promise<Payment>;
    /**
     * Prepare payment (get payment key)
     */
    preparePayment(data: PaymentReadyData): Promise<{
        paymentKey: string;
        orderId: string;
    }>;
    /**
     * Confirm payment (after Toss redirect)
     */
    confirmPayment(data: PaymentConfirmData): Promise<Payment>;
    /**
     * Cancel payment
     */
    cancelPayment(paymentId: number, data: PaymentCancelData): Promise<Payment>;
    /**
     * Validate coupon code
     */
    validateCoupon(code: string, orderAmount: number): Promise<CouponValidation>;
    /**
     * Get available coupons for current user
     * @returns Array of coupons (always an array)
     */
    myCoupons(): Promise<Coupon[]>;
}

/**
 * Media Resource for Promptly SDK
 */

interface MediaListParams extends ListParams {
    type?: string;
}
declare class MediaResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List my media files
     */
    list(params?: MediaListParams): Promise<PaginatedResponse<Media>>;
    /**
     * Get media by ID
     */
    get(mediaId: number): Promise<Media>;
    /**
     * Upload file
     */
    upload(file: File | Blob): Promise<Media>;
    /**
     * Upload multiple files
     */
    uploadMultiple(files: (File | Blob)[]): Promise<Media[]>;
    /**
     * Delete media
     */
    delete(mediaId: number): Promise<void>;
}

declare class EntitiesResource {
    private http;
    constructor(http: HttpClient);
    /**
     * List all active custom entities
     * @returns Array of entities (always an array)
     *
     * @example
     * ```typescript
     * const entities = await client.entities.list();
     * // [{ id: 1, name: 'Customer', slug: 'customer', ... }]
     * ```
     */
    list(): Promise<CustomEntity[]>;
    /**
     * Get entity schema by slug
     *
     * @example
     * ```typescript
     * const schema = await client.entities.getSchema('customer');
     * // { fields: [{ name: 'company', label: '회사명', type: 'text', ... }] }
     * ```
     */
    getSchema(slug: string): Promise<EntitySchema>;
    /**
     * List records for an entity
     * @returns ListResponse with data array and pagination meta
     *
     * @example
     * ```typescript
     * // Basic listing
     * const customers = await client.entities.listRecords('customer');
     *
     * // With pagination
     * const customers = await client.entities.listRecords('customer', {
     *   page: 1,
     *   per_page: 20,
     *   status: 'active',
     * });
     *
     * // With filtering by data fields
     * const vipCustomers = await client.entities.listRecords('customer', {
     *   'data.tier': 'vip',
     * });
     * ```
     */
    listRecords(slug: string, params?: EntityListParams): Promise<ListResponse<EntityRecord>>;
    /**
     * Get a single record by ID
     *
     * @example
     * ```typescript
     * const customer = await client.entities.getRecord('customer', 1);
     * console.log(customer.data.company); // 'ABC Corp'
     * ```
     */
    getRecord(slug: string, id: number): Promise<EntityRecord>;
    /**
     * Create a new record
     *
     * @example
     * ```typescript
     * const newCustomer = await client.entities.createRecord('customer', {
     *   data: {
     *     company: 'ABC Corp',
     *     email: 'contact@abc.com',
     *     tier: 'standard',
     *   },
     *   status: 'active',
     * });
     * ```
     */
    createRecord(slug: string, data: CreateEntityRecordData): Promise<EntityRecord>;
    /**
     * Update a record
     *
     * @example
     * ```typescript
     * const updated = await client.entities.updateRecord('customer', 1, {
     *   data: {
     *     tier: 'vip',
     *   },
     * });
     * ```
     */
    updateRecord(slug: string, id: number, data: UpdateEntityRecordData): Promise<EntityRecord>;
    /**
     * Delete a record
     *
     * @example
     * ```typescript
     * await client.entities.deleteRecord('customer', 1);
     * ```
     */
    deleteRecord(slug: string, id: number): Promise<void>;
    /**
     * Get a value from a record's data
     *
     * @example
     * ```typescript
     * const record = await client.entities.getRecord('customer', 1);
     * const company = client.entities.getValue(record, 'company');
     * ```
     */
    getValue(record: EntityRecord, field: string): any;
    /**
     * Create a typed accessor for an entity
     *
     * @example
     * ```typescript
     * interface Customer {
     *   company: string;
     *   email: string;
     *   tier: 'standard' | 'vip';
     * }
     *
     * const customers = client.entities.typed<Customer>('customer');
     * const list = await customers.list(); // Typed records
     * const record = await customers.get(1);
     * console.log(record.data.company); // TypeScript knows this is string
     * ```
     */
    typed<T extends Record<string, any>>(slug: string): {
        list: (params?: EntityListParams) => Promise<{
            data: Array<Omit<EntityRecord, "data"> & {
                data: T;
            }>;
            meta: PaginationMeta;
        }>;
        get: (id: number) => Promise<Omit<EntityRecord, "data"> & {
            data: T;
        }>;
        create: (data: T, status?: EntityRecord["status"]) => Promise<Omit<EntityRecord, "data"> & {
            data: T;
        }>;
        update: (id: number, data: Partial<T>, status?: EntityRecord["status"]) => Promise<Omit<EntityRecord, "data"> & {
            data: T;
        }>;
        delete: (id: number) => Promise<void>;
    };
}

/**
 * Reservation Resource for Promptly SDK
 */

declare class ReservationResource {
    private http;
    constructor(http: HttpClient);
    /**
     * Get reservation settings
     * @returns Reservation settings for the tenant
     */
    getSettings(): Promise<ReservationSettings>;
    /**
     * List available services
     * @returns Array of services (always an array)
     */
    listServices(): Promise<ReservationService[]>;
    /**
     * List available staff members
     * @param serviceId - Optional: filter staff by service
     * @returns Array of staff members (always an array)
     */
    listStaff(serviceId?: number): Promise<ReservationStaff[]>;
    /**
     * Get available dates for booking
     * @returns Array of available date strings (YYYY-MM-DD)
     */
    getAvailableDates(params: AvailableDatesParams): Promise<string[]>;
    /**
     * Get available time slots for a specific date
     * @returns Array of available slots (always an array)
     */
    getAvailableSlots(params: AvailableSlotsParams): Promise<ReservationSlot[]>;
    /**
     * Create a new reservation
     * @returns Created reservation with payment info
     */
    create(data: CreateReservationData): Promise<CreateReservationResult>;
    /**
     * List my reservations
     * @returns ListResponse with reservations and pagination meta
     */
    list(params?: ReservationListParams): Promise<ListResponse<Reservation>>;
    /**
     * Get upcoming reservations
     * @returns Array of upcoming reservations
     */
    upcoming(limit?: number): Promise<Reservation[]>;
    /**
     * Get past reservations
     * @returns Array of past reservations
     */
    past(limit?: number): Promise<Reservation[]>;
    /**
     * Get reservation by reservation number
     */
    get(reservationNumber: string): Promise<Reservation>;
    /**
     * Cancel a reservation
     * @param reservationNumber - Reservation number to cancel
     * @param reason - Optional cancellation reason
     */
    cancel(reservationNumber: string, reason?: string): Promise<Reservation>;
}

/**
 * Promptly SDK
 *
 * A TypeScript/JavaScript SDK for the Promptly AI CMS platform.
 *
 * @example
 * ```typescript
 * import { Promptly } from '@promptly/sdk';
 *
 * const client = new Promptly({
 *   tenantId: 'my-site',
 *   baseUrl: 'https://promptly.webbyon.com',
 * });
 *
 * // Public API
 * const posts = await client.blog.list();
 * const products = await client.shop.listProducts();
 *
 * // Authentication
 * await client.auth.login({ email: 'user@example.com', password: 'password' });
 *
 * // Protected API
 * const orders = await client.shop.listOrders();
 * ```
 */

declare class Promptly {
    private http;
    /** Authentication & user management */
    readonly auth: AuthResource;
    /** Board posts and comments */
    readonly boards: BoardsResource;
    /** Blog posts */
    readonly blog: BlogResource;
    /** Forms and submissions */
    readonly forms: FormsResource;
    /** E-commerce: products, cart, orders, payments */
    readonly shop: ShopResource;
    /** Media file management */
    readonly media: MediaResource;
    /** Custom entities - dynamic data structures created by AI */
    readonly entities: EntitiesResource;
    /** Reservations - booking services and time slots */
    readonly reservation: ReservationResource;
    constructor(config: PromptlyConfig);
    /**
     * Get site theme settings
     */
    getTheme(): Promise<{
        name: string;
        colors: Record<string, string>;
        fonts: Record<string, string>;
    }>;
    /**
     * Get site settings
     */
    getSettings(): Promise<Record<string, any>>;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Set authentication token manually
     */
    setToken(token: string | null): void;
    /**
     * Get current authentication token
     */
    getToken(): string | null;
}

export { type AddToCartData, type ApiError, type ApiResponse, type ApplyCouponData, type AuthResponse, type AvailableDatesParams, type AvailableSlotsParams, type BlogListParams, type BlogPost, type Board, type BoardComment, type BoardListParams, type BoardPost, type BoardSettings, type Cart, type CartItem, type Coupon, type CouponType, type CouponValidation, type CreateCommentData, type CreateEntityRecordData, type CreateOrderData, type CreatePostData, type CreateReservationData, type CreateReservationResult, type CustomEntity, type EntityField, type EntityListParams, type EntityRecord, type EntitySchema, type ForgotPasswordData, type Form, type FormField, type FormFieldOption, type FormFieldType, type FormFieldValidation, type FormListParams, type FormSettings, type FormSubmission, type ListParams, type ListResponse, type LoginCredentials, type Media, type Member, type Order, type OrderItem, type OrderListParams, type OrderStatus, type PaginatedResponse, type PaginationMeta, type Payment, type PaymentCancelData, type PaymentConfirmData, type PaymentMethod, type PaymentReadyData, type PaymentStatus, type PostListParams, type Product, type ProductCategory, type ProductListParams, type ProductOption, type ProductOptionValue, type ProductStatus, type ProductVariant, Promptly, type PromptlyConfig, PromptlyError, type RegisterData, type Reservation, type ReservationListParams, type ReservationService, type ReservationSettings, type ReservationSlot, type ReservationStaff, type ReservationStaffSummary, type ResetPasswordData, type SocialAuthUrl, type SocialProvider, type SubmissionListParams, type SubmitFormData, type UpdateCartItemData, type UpdateCommentData, type UpdateEntityRecordData, type UpdatePostData, type UpdateProfileData, Promptly as default };
