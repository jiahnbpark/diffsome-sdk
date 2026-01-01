/**
 * Shop Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { PaginatedResponse } from '../types';
import type {
  Product,
  ProductCategory,
  ProductListParams,
  Cart,
  CartItem,
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
} from '../types';

export class ShopResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Products (Public)
  // ============================================

  /**
   * List products
   */
  async listProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>('/public/products', params);
  }

  /**
   * Get product by ID or slug
   */
  async getProduct(idOrSlug: number | string): Promise<Product> {
    return this.http.get<Product>(`/public/products/${idOrSlug}`);
  }

  /**
   * Get featured products
   */
  async featuredProducts(limit: number = 8): Promise<Product[]> {
    const response = await this.http.get<PaginatedResponse<Product>>('/public/products', {
      per_page: limit,
      is_featured: true,
    });
    return response.data;
  }

  /**
   * Search products
   */
  async searchProducts(query: string, params?: Omit<ProductListParams, 'search'>): Promise<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>('/public/products', {
      ...params,
      search: query,
    });
  }

  // ============================================
  // Categories (Public)
  // ============================================

  /**
   * List product categories
   */
  async listCategories(): Promise<ProductCategory[]> {
    return this.http.get<ProductCategory[]>('/public/categories');
  }

  /**
   * Get category by ID or slug
   */
  async getCategory(idOrSlug: number | string): Promise<ProductCategory> {
    return this.http.get<ProductCategory>(`/public/categories/${idOrSlug}`);
  }

  /**
   * Get products in category
   */
  async categoryProducts(categoryIdOrSlug: number | string, params?: Omit<ProductListParams, 'category'>): Promise<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`/public/categories/${categoryIdOrSlug}/products`, params);
  }

  // ============================================
  // Cart
  // ============================================

  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    return this.http.get<Cart>('/cart');
  }

  /**
   * Add item to cart
   */
  async addToCart(data: AddToCartData): Promise<Cart> {
    return this.http.post<Cart>('/cart/items', data);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: number, data: UpdateCartItemData): Promise<Cart> {
    return this.http.put<Cart>(`/cart/items/${itemId}`, data);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: number): Promise<Cart> {
    return this.http.delete<Cart>(`/cart/items/${itemId}`);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    return this.http.delete('/cart');
  }

  // ============================================
  // Orders (Protected)
  // ============================================

  /**
   * List my orders
   */
  async listOrders(params?: OrderListParams): Promise<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>('/orders', params);
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
   * Prepare payment (get payment key)
   */
  async preparePayment(data: PaymentReadyData): Promise<{ paymentKey: string; orderId: string }> {
    return this.http.post(`/payments/ready`, data);
  }

  /**
   * Confirm payment (after Toss redirect)
   */
  async confirmPayment(data: PaymentConfirmData): Promise<Payment> {
    return this.http.post<Payment>('/payments/confirm', data);
  }

  /**
   * Cancel payment
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
   */
  async myCoupons(): Promise<Coupon[]> {
    return this.http.get<Coupon[]>('/coupons');
  }
}
