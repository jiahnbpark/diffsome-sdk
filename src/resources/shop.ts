/**
 * Shop Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type {
  Product,
  ProductCategory,
  ProductListParams,
  ProductListParamsExtended,
  ProductType,
  Cart,
  AddToCartData,
  UpdateCartItemData,
  Order,
  OrderListParams,
  CreateOrderData,
  Payment,
  PaymentReadyData,
  PaymentConfirmData,
  PaymentCancelData,
  Coupon,
  ApplyCouponData,
  CouponValidation,
  TossPaymentReadyData,
  TossPaymentReadyResponse,
  TossPaymentConfirmData,
  TossPaymentConfirmResponse,
  StripeCheckoutData,
  StripeCheckoutResponse,
  StripeVerifyData,
  StripeVerifyResponse,
  PaymentStatusResponse,
  ProductReview,
  ProductReviewStats,
  ProductReviewListParams,
  CreateProductReviewData,
  UpdateProductReviewData,
  CanReviewResponse,
  WishlistItem,
  WishlistListParams,
  WishlistToggleResult,
  WishlistCheckResult,
  WishlistCheckBulkResult,
  WishlistMoveToCartResult,
  AddToWishlistData,
  // Digital Product
  DigitalDownloadLink,
  // Subscription
  MemberSubscription,
  CreateSubscriptionData,
  CreateSubscriptionResult,
  SetupIntentResult,
  // Bundle
  BundlePricing,
} from '../types';

export class ShopResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Products (Public)
  // ============================================

  /**
   * List products
   * @returns ListResponse with data array and pagination meta
   */
  async listProducts(params?: ProductListParams): Promise<ListResponse<Product>> {
    return this.http.getList<Product>('/products', params);
  }

  /**
   * Get product by ID or slug
   */
  async getProduct(idOrSlug: number | string): Promise<Product> {
    return this.http.get<Product>(`/products/${idOrSlug}`);
  }

  /**
   * Get featured products
   * @returns Array of featured products (always an array)
   */
  async featuredProducts(limit: number = 8): Promise<Product[]> {
    const response = await this.http.getList<Product>('/products', {
      per_page: limit,
      is_featured: true,
    });
    return response.data;
  }

  /**
   * Search products
   * @returns ListResponse with data array and pagination meta
   */
  async searchProducts(query: string, params?: Omit<ProductListParams, 'search'>): Promise<ListResponse<Product>> {
    return this.http.getList<Product>('/products', {
      ...params,
      search: query,
    });
  }

  // ============================================
  // Categories (Public)
  // ============================================

  /**
   * List product categories
   * @returns ListResponse with data array and pagination meta
   */
  async listCategories(): Promise<ListResponse<ProductCategory>> {
    return this.http.getList<ProductCategory>('/categories');
  }

  /**
   * Get category by ID or slug
   */
  async getCategory(idOrSlug: number | string): Promise<ProductCategory> {
    return this.http.get<ProductCategory>(`/categories/${idOrSlug}`);
  }

  /**
   * Get products in category
   * @returns ListResponse with data array and pagination meta
   */
  async categoryProducts(categoryIdOrSlug: number | string, params?: Omit<ProductListParams, 'category'>): Promise<ListResponse<Product>> {
    return this.http.getList<Product>(`/categories/${categoryIdOrSlug}/products`, params);
  }

  // ============================================
  // Cart
  // ============================================

  /**
   * Save cart session ID from response (for guest cart persistence)
   */
  private saveCartSession(cart: Cart): Cart {
    if (cart.session_id) {
      this.http.setCartSessionId(cart.session_id);
    }
    return cart;
  }

  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    const cart = await this.http.get<Cart>('/cart');
    return this.saveCartSession(cart);
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartData): Promise<Cart> {
    const cart = await this.http.post<Cart>('/cart/items', data);
    return this.saveCartSession(cart);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: number, data: UpdateCartItemData): Promise<Cart> {
    const cart = await this.http.put<Cart>(`/cart/items/${itemId}`, data);
    return this.saveCartSession(cart);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: number): Promise<Cart> {
    const cart = await this.http.delete<Cart>(`/cart/items/${itemId}`);
    return this.saveCartSession(cart);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await this.http.delete('/cart');
    // Clear cart session when cart is cleared
    this.http.setCartSessionId(null);
  }

  // ============================================
  // Orders (Protected)
  // ============================================

  /**
   * List my orders
   * @returns ListResponse with data array and pagination meta
   */
  async listOrders(params?: OrderListParams): Promise<ListResponse<Order>> {
    return this.http.getList<Order>('/orders', params);
  }

  /**
   * Get order by ID or order number
   */
  async getOrder(idOrNumber: number | string): Promise<Order> {
    return this.http.get<Order>(`/orders/${idOrNumber}`);
  }

  /**
   * Create order from cart
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    return this.http.post<Order>('/orders', data);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number): Promise<Order> {
    return this.http.post<Order>(`/orders/${orderId}/cancel`);
  }

  // ============================================
  // Payments
  // ============================================

  /**
   * Get payment for order
   */
  async getPayment(orderId: number): Promise<Payment> {
    return this.http.get<Payment>(`/orders/${orderId}/payment`);
  }

  /**
   * Get payment status (available payment methods)
   */
  async getPaymentStatus(): Promise<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>('/payments/status');
  }

  // ============================================
  // Toss Payments
  // ============================================

  /**
   * Prepare Toss payment (get client key and payment info)
   */
  async tossPaymentReady(data: TossPaymentReadyData): Promise<TossPaymentReadyResponse> {
    return this.http.post<TossPaymentReadyResponse>('/payments/toss/ready', data);
  }

  /**
   * Confirm Toss payment (after redirect)
   */
  async tossPaymentConfirm(data: TossPaymentConfirmData): Promise<TossPaymentConfirmResponse> {
    return this.http.post<TossPaymentConfirmResponse>('/payments/toss/confirm', data);
  }

  /**
   * Cancel Toss payment
   */
  async tossPaymentCancel(orderNumber: string, cancelReason: string, cancelAmount?: number): Promise<void> {
    await this.http.post('/payments/toss/cancel', {
      order_number: orderNumber,
      cancel_reason: cancelReason,
      cancel_amount: cancelAmount,
    });
  }

  // ============================================
  // Stripe Payments
  // ============================================

  /**
   * Create Stripe Checkout Session
   */
  async stripeCheckout(data: StripeCheckoutData): Promise<StripeCheckoutResponse> {
    return this.http.post<StripeCheckoutResponse>('/payments/stripe/checkout', data);
  }

  /**
   * Verify Stripe payment (after redirect)
   */
  async stripeVerify(data: StripeVerifyData): Promise<StripeVerifyResponse> {
    return this.http.post<StripeVerifyResponse>('/payments/stripe/verify', data);
  }

  /**
   * Refund Stripe payment
   */
  async stripeRefund(orderNumber: string, reason?: string, amount?: number): Promise<void> {
    await this.http.post('/payments/stripe/refund', {
      order_number: orderNumber,
      reason,
      amount,
    });
  }

  // ============================================
  // Legacy Payment Methods (deprecated)
  // ============================================

  /**
   * @deprecated Use tossPaymentReady instead
   */
  async preparePayment(data: PaymentReadyData): Promise<{ paymentKey: string; orderId: string }> {
    return this.http.post(`/payments/ready`, data);
  }

  /**
   * @deprecated Use tossPaymentConfirm instead
   */
  async confirmPayment(data: PaymentConfirmData): Promise<Payment> {
    return this.http.post<Payment>('/payments/confirm', data);
  }

  /**
   * @deprecated Use tossPaymentCancel instead
   */
  async cancelPayment(paymentId: number, data: PaymentCancelData): Promise<Payment> {
    return this.http.post<Payment>(`/payments/${paymentId}/cancel`, data);
  }

  // ============================================
  // Coupons
  // ============================================

  /**
   * Validate coupon code
   */
  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidation> {
    return this.http.post<CouponValidation>('/coupons/validate', {
      code,
      order_amount: orderAmount,
    });
  }

  /**
   * Get available coupons for current user
   * @returns Array of coupons (always an array)
   */
  async myCoupons(): Promise<Coupon[]> {
    const response = await this.http.getList<Coupon>('/coupons');
    return response.data;
  }

  // ============================================
  // Product Reviews
  // ============================================

  /**
   * Get reviews for a product
   * @param productSlug - Product slug
   * @param params - Optional list params (rating, sort, per_page)
   * @returns Reviews with stats
   */
  async getProductReviews(
    productSlug: string,
    params?: ProductReviewListParams
  ): Promise<{ data: ProductReview[]; meta: any; stats: ProductReviewStats }> {
    return this.http.get(`/products/${productSlug}/reviews`, params);
  }

  /**
   * Check if current user can review a product
   * Requires: logged in + purchased the product + not already reviewed
   */
  async canReviewProduct(productSlug: string): Promise<CanReviewResponse> {
    const response = await this.http.get<{ can_review: boolean; reason?: string }>(
      `/products/${productSlug}/reviews/can-review`
    );
    return response as CanReviewResponse;
  }

  /**
   * Create a product review (requires purchase)
   */
  async createReview(productSlug: string, data: CreateProductReviewData): Promise<ProductReview> {
    const response = await this.http.post<{ data: ProductReview }>(
      `/products/${productSlug}/reviews`,
      data
    );
    return response.data;
  }

  /**
   * Update your own review
   */
  async updateReview(reviewId: number, data: UpdateProductReviewData): Promise<ProductReview> {
    const response = await this.http.put<{ data: ProductReview }>(
      `/reviews/${reviewId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete your own review
   */
  async deleteReview(reviewId: number): Promise<void> {
    await this.http.delete(`/reviews/${reviewId}`);
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId: number): Promise<{ helpful_count: number }> {
    return this.http.post(`/reviews/${reviewId}/helpful`);
  }

  /**
   * Get my reviews
   * @returns Array of reviews written by the current user
   */
  async myReviews(params?: { per_page?: number; page?: number }): Promise<ListResponse<ProductReview>> {
    return this.http.getList<ProductReview>('/my/reviews', params);
  }

  // ============================================
  // Wishlist
  // ============================================

  /**
   * Get wishlist items
   * Requires authentication
   */
  async getWishlist(params?: WishlistListParams): Promise<ListResponse<WishlistItem>> {
    return this.http.getList<WishlistItem>('/wishlist', params);
  }

  /**
   * Add product to wishlist
   * Requires authentication
   */
  async addToWishlist(data: AddToWishlistData): Promise<WishlistItem> {
    return this.http.post<WishlistItem>('/wishlist', data);
  }

  /**
   * Remove item from wishlist
   * Requires authentication
   */
  async removeFromWishlist(wishlistId: number): Promise<void> {
    await this.http.delete(`/wishlist/${wishlistId}`);
  }

  /**
   * Toggle wishlist (add if not in wishlist, remove if in wishlist)
   * Requires authentication
   */
  async toggleWishlist(productId: number, variantId?: number): Promise<WishlistToggleResult> {
    return this.http.post<WishlistToggleResult>('/wishlist/toggle', {
      product_id: productId,
      variant_id: variantId,
    });
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: number, variantId?: number): Promise<boolean> {
    const result = await this.http.get<WishlistCheckResult>('/wishlist/check', {
      product_id: productId,
      variant_id: variantId,
    });
    return result.in_wishlist;
  }

  /**
   * Check multiple products' wishlist status
   * Useful for product list pages
   */
  async checkWishlistBulk(productIds: number[]): Promise<Record<string, boolean>> {
    const result = await this.http.post<WishlistCheckBulkResult>('/wishlist/check-bulk', {
      product_ids: productIds,
    });
    return result.items;
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount(): Promise<number> {
    const result = await this.http.get<{ count: number }>('/wishlist/count');
    return result.count;
  }

  /**
   * Move wishlist items to cart
   * @param wishlistIds - Optional array of wishlist item IDs to move. If empty, moves all items.
   */
  async moveWishlistToCart(wishlistIds?: number[]): Promise<WishlistMoveToCartResult> {
    return this.http.post<WishlistMoveToCartResult>('/wishlist/move-to-cart', {
      wishlist_ids: wishlistIds,
    });
  }

  /**
   * Update wishlist item note
   */
  async updateWishlistNote(wishlistId: number, note: string): Promise<WishlistItem> {
    return this.http.put<WishlistItem>(`/wishlist/${wishlistId}`, { note });
  }

  /**
   * Get product's wishlist count (how many users added this product)
   */
  async getProductWishlistCount(productSlug: string): Promise<number> {
    const result = await this.http.get<{ count: number }>(`/products/${productSlug}/wishlist-count`);
    return result.count;
  }

  // ============================================
  // Digital Downloads
  // ============================================

  /**
   * Get my download links
   * Requires authentication
   */
  async getMyDownloads(): Promise<DigitalDownloadLink[]> {
    const result = await this.http.get<{ downloads: DigitalDownloadLink[] }>('/my/downloads');
    return result.downloads;
  }

  /**
   * Get download links for a specific order
   * Requires authentication
   */
  async getOrderDownloads(orderNumber: string): Promise<DigitalDownloadLink[]> {
    const result = await this.http.get<{ downloads: DigitalDownloadLink[] }>(
      `/orders/${orderNumber}/downloads`
    );
    return result.downloads;
  }

  /**
   * Get download file URL
   * Returns the web download URL that handles server-side authentication
   * User must be logged in via session (not just API token)
   */
  getDownloadUrl(token: string): string {
    return this.http.getDownloadUrl(token);
  }

  /**
   * Get download link info (without triggering download)
   * Requires authentication
   */
  async getDownloadInfo(token: string): Promise<DigitalDownloadLink> {
    const result = await this.http.get<{ download: DigitalDownloadLink }>(`/downloads/${token}/info`);
    return result.download;
  }

  // ============================================
  // Subscriptions
  // ============================================

  /**
   * Get my subscriptions
   * Requires authentication
   */
  async getSubscriptions(): Promise<MemberSubscription[]> {
    const result = await this.http.get<{ subscriptions: MemberSubscription[] }>('/subscriptions');
    return result.subscriptions;
  }

  /**
   * Get subscription by ID
   * Requires authentication
   */
  async getSubscription(id: number): Promise<MemberSubscription> {
    const result = await this.http.get<{ subscription: MemberSubscription }>(`/subscriptions/${id}`);
    return result.subscription;
  }

  /**
   * Create a new subscription
   * Requires Stripe payment method ID
   * Requires authentication
   */
  async createSubscription(data: CreateSubscriptionData): Promise<CreateSubscriptionResult> {
    return this.http.post<CreateSubscriptionResult>('/subscriptions', data);
  }

  /**
   * Cancel subscription
   * @param immediately - If true, cancel immediately. Otherwise, cancel at end of billing period.
   * Requires authentication
   */
  async cancelSubscription(id: number, immediately: boolean = false): Promise<MemberSubscription> {
    const result = await this.http.post<{ subscription: MemberSubscription }>(
      `/subscriptions/${id}/cancel`,
      { immediately }
    );
    return result.subscription;
  }

  /**
   * Pause subscription
   * Requires authentication
   */
  async pauseSubscription(id: number): Promise<MemberSubscription> {
    const result = await this.http.post<{ subscription: MemberSubscription }>(
      `/subscriptions/${id}/pause`
    );
    return result.subscription;
  }

  /**
   * Resume paused subscription
   * Requires authentication
   */
  async resumeSubscription(id: number): Promise<MemberSubscription> {
    const result = await this.http.post<{ subscription: MemberSubscription }>(
      `/subscriptions/${id}/resume`
    );
    return result.subscription;
  }

  /**
   * Create Stripe Setup Intent for adding payment method
   * Use with Stripe.js to collect card details
   * Requires authentication
   */
  async createSetupIntent(): Promise<SetupIntentResult> {
    return this.http.post<SetupIntentResult>('/subscriptions/setup-intent');
  }

  /**
   * Create Stripe Checkout Session for subscription
   * Redirects to Stripe Checkout page
   * Requires authentication
   */
  async createSubscriptionCheckout(data: {
    plan_id: number;
    success_url: string;
    cancel_url: string;
  }): Promise<{ url: string; session_id: string }> {
    return this.http.post<{ url: string; session_id: string }>('/subscriptions/checkout', data);
  }

  /**
   * Verify Stripe Checkout Session for subscription
   * Call after returning from Stripe Checkout
   * Requires authentication
   */
  async verifySubscriptionCheckout(session_id: string): Promise<{ subscription: MemberSubscription }> {
    return this.http.post<{ subscription: MemberSubscription }>('/subscriptions/verify', { session_id });
  }

  // ============================================
  // Bundle Products
  // ============================================

  /**
   * Get bundle items and pricing
   * Returns all products in the bundle with calculated pricing
   */
  async getBundleItems(productSlug: string): Promise<BundlePricing> {
    const result = await this.http.get<{ bundle: BundlePricing }>(`/products/${productSlug}/bundle-items`);
    return result.bundle;
  }

  // ============================================
  // Product Type Filters
  // ============================================

  /**
   * List products with type filter
   */
  async listProductsByType(type: ProductType, params?: ProductListParams): Promise<ListResponse<Product>> {
    return this.http.getList<Product>('/products', { ...params, type });
  }

  /**
   * Get digital products
   */
  async getDigitalProducts(params?: ProductListParams): Promise<ListResponse<Product>> {
    return this.listProductsByType('digital', params);
  }

  /**
   * Get subscription products
   */
  async getSubscriptionProducts(params?: ProductListParams): Promise<ListResponse<Product>> {
    return this.listProductsByType('subscription', params);
  }

  /**
   * Get bundle products
   */
  async getBundleProducts(params?: ProductListParams): Promise<ListResponse<Product>> {
    return this.listProductsByType('bundle', params);
  }
}
