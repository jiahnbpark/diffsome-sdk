"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Diffsome: () => Diffsome,
  DiffsomeError: () => DiffsomeError,
  Promptly: () => Diffsome,
  PromptlyError: () => DiffsomeError,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/http.ts
var DEFAULT_META = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null
};
function normalizeListResponse(response) {
  if (response == null) {
    return { data: [], meta: { ...DEFAULT_META } };
  }
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: { ...DEFAULT_META, total: response.length, from: response.length > 0 ? 1 : null, to: response.length > 0 ? response.length : null }
    };
  }
  if (typeof response === "object") {
    const data = Array.isArray(response.data) ? response.data : [];
    const meta = {
      current_page: response.meta?.current_page ?? response.current_page ?? 1,
      last_page: response.meta?.last_page ?? response.last_page ?? 1,
      per_page: response.meta?.per_page ?? response.per_page ?? 15,
      total: response.meta?.total ?? response.total ?? data.length,
      from: response.meta?.from ?? response.from ?? (data.length > 0 ? 1 : null),
      to: response.meta?.to ?? response.to ?? (data.length > 0 ? data.length : null)
    };
    return { data, meta };
  }
  return { data: [], meta: { ...DEFAULT_META } };
}
var DiffsomeError = class extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "DiffsomeError";
    this.status = status;
    this.errors = errors;
  }
};
var HttpClient = class {
  constructor(config) {
    this.token = null;
    this.apiKey = null;
    this.cartSessionId = null;
    // Token persistence options
    this.persistToken = false;
    this.storageType = "localStorage";
    this.tenantId = config.tenantId;
    this.baseUrl = (config.baseUrl || "https://diffsome.com").replace(/\/$/, "");
    this.timeout = config.timeout || 3e4;
    this.apiKey = config.apiKey || null;
    this.persistToken = config.persistToken ?? false;
    this.storageType = config.storageType ?? "localStorage";
    this.storageKey = config.storageKey ?? `diffsome_auth_token_${this.tenantId}`;
    this.onAuthStateChange = config.onAuthStateChange;
    if (typeof window !== "undefined" && window.localStorage) {
      this.cartSessionId = localStorage.getItem(`diffsome_cart_session_${this.tenantId}`);
    }
    if (this.persistToken && typeof window !== "undefined") {
      const storage = this.getStorage();
      if (storage) {
        const savedToken = storage.getItem(this.storageKey);
        if (savedToken) {
          this.token = savedToken;
          this.onAuthStateChange?.(savedToken, void 0);
        }
      }
    }
    if (config.token) {
      this.token = config.token;
    }
  }
  /**
   * Get the storage object based on config
   */
  getStorage() {
    if (typeof window === "undefined") return null;
    return this.storageType === "sessionStorage" ? window.sessionStorage : window.localStorage;
  }
  /**
   * Set authentication token
   * If persistToken is enabled, automatically saves/removes from storage
   * @param token - The auth token or null to clear
   * @param user - The logged-in user (Member) for the callback
   */
  setToken(token, user) {
    this.token = token;
    if (this.persistToken) {
      const storage = this.getStorage();
      if (storage) {
        if (token) {
          storage.setItem(this.storageKey, token);
        } else {
          storage.removeItem(this.storageKey);
        }
      }
    }
    this.onAuthStateChange?.(token, user ?? null);
  }
  /**
   * Get current token
   */
  getToken() {
    return this.token;
  }
  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return this.token !== null || this.apiKey !== null;
  }
  /**
   * Set API key for server-to-server authentication
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  /**
   * Get current API key
   */
  getApiKey() {
    return this.apiKey;
  }
  /**
   * Get the base URL with tenant path
   */
  getBaseUrl() {
    return `${this.baseUrl}/api/${this.tenantId}`;
  }
  /**
   * Get the download URL for a digital file
   * Includes auth_token query parameter for authentication
   */
  getDownloadUrl(token) {
    const url = `${this.baseUrl}/download/${this.tenantId}/${token}`;
    if (this.token) {
      return `${url}?auth_token=${encodeURIComponent(this.token)}`;
    }
    return url;
  }
  /**
   * Set cart session ID (for guest cart persistence)
   */
  setCartSessionId(sessionId) {
    this.cartSessionId = sessionId;
    if (typeof window !== "undefined" && window.localStorage) {
      if (sessionId) {
        localStorage.setItem(`diffsome_cart_session_${this.tenantId}`, sessionId);
      } else {
        localStorage.removeItem(`diffsome_cart_session_${this.tenantId}`);
      }
    }
  }
  /**
   * Get cart session ID
   */
  getCartSessionId() {
    return this.cartSessionId;
  }
  /**
   * Build full URL with query params
   */
  buildUrl(endpoint, params) {
    const url = new URL(`${this.baseUrl}/api/${this.tenantId}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
  /**
   * Build request headers
   * Both API key and bearer token can be sent together
   */
  buildHeaders(customHeaders) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders
    };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    if (this.cartSessionId) {
      headers["X-Cart-Session"] = this.cartSessionId;
    }
    return headers;
  }
  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const { method = "GET", body, params, headers } = options;
    const url = this.buildUrl(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : void 0,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new DiffsomeError(
          data.message || "Request failed",
          response.status,
          data.errors
        );
      }
      return data.data !== void 0 ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DiffsomeError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new DiffsomeError("Request timeout", 408);
        }
        throw new DiffsomeError(error.message, 0);
      }
      throw new DiffsomeError("Unknown error", 0);
    }
  }
  /**
   * GET request
   */
  get(endpoint, params) {
    return this.request(endpoint, { method: "GET", params });
  }
  /**
   * GET request for list endpoints - ALWAYS returns normalized ListResponse
   * Guarantees: data is always an array, meta is always present
   */
  async getList(endpoint, params) {
    const response = await this.request(endpoint, { method: "GET", params });
    return normalizeListResponse(response);
  }
  /**
   * POST request
   */
  post(endpoint, body) {
    return this.request(endpoint, { method: "POST", body });
  }
  /**
   * PUT request
   */
  put(endpoint, body) {
    return this.request(endpoint, { method: "PUT", body });
  }
  /**
   * PATCH request
   */
  patch(endpoint, body) {
    return this.request(endpoint, { method: "PATCH", body });
  }
  /**
   * DELETE request
   */
  delete(endpoint, params) {
    return this.request(endpoint, { method: "DELETE", params });
  }
  /**
   * Upload file
   */
  async upload(endpoint, file, fieldName = "file") {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    formData.append(fieldName, file);
    const headers = {
      "Accept": "application/json"
    };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new DiffsomeError(
          data.message || "Upload failed",
          response.status,
          data.errors
        );
      }
      return data.data !== void 0 ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DiffsomeError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new DiffsomeError("Upload timeout", 408);
        }
        throw new DiffsomeError(error.message, 0);
      }
      throw new DiffsomeError("Unknown error", 0);
    }
  }
};

// src/resources/auth.ts
var AuthResource = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Login with email and password
   * Token is automatically saved if persistToken is enabled
   */
  async login(credentials) {
    const response = await this.http.post("/auth/login", credentials);
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }
  /**
   * Register new member
   * Token is automatically saved if persistToken is enabled
   */
  async register(data) {
    const response = await this.http.post("/auth/register", data);
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }
  /**
   * Logout current user
   */
  async logout() {
    try {
      await this.http.post("/auth/logout");
    } finally {
      this.http.setToken(null);
    }
  }
  /**
   * Get current user profile
   */
  async me() {
    return this.http.get("/profile");
  }
  /**
   * Update profile
   */
  async updateProfile(data) {
    return this.http.put("/profile", data);
  }
  /**
   * Send password reset email
   */
  async forgotPassword(data) {
    return this.http.post("/auth/forgot-password", data);
  }
  /**
   * Reset password with token
   */
  async resetPassword(data) {
    return this.http.post("/auth/reset-password", data);
  }
  /**
   * Get available social login providers
   */
  async getSocialProviders() {
    return this.http.get("/auth/social/providers");
  }
  /**
   * Get social login redirect URL
   */
  async getSocialAuthUrl(provider) {
    return this.http.get(`/auth/social/${provider}`);
  }
  /**
   * Handle social login callback
   * Token is automatically saved if persistToken is enabled
   */
  async socialCallback(provider, code) {
    const response = await this.http.post(`/auth/social/${provider}/callback`, { code });
    if (response.token) {
      this.http.setToken(response.token, response.user);
    }
    return response;
  }
  /**
   * Set token manually (e.g., from localStorage)
   */
  setToken(token) {
    this.http.setToken(token);
  }
  /**
   * Get current token
   */
  getToken() {
    return this.http.getToken();
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.http.isAuthenticated();
  }
};

// src/resources/boards.ts
var BoardsResource = class {
  constructor(http) {
    this.http = http;
  }
  // ============================================
  // Boards (Public)
  // ============================================
  /**
   * List all boards
   * @returns ListResponse with data array (always defined) and pagination meta
   */
  async list(params) {
    return this.http.getList("/boards", params);
  }
  /**
   * Get board by ID or slug
   */
  async get(idOrSlug) {
    return this.http.get(`/boards/${idOrSlug}`);
  }
  // ============================================
  // Posts
  // ============================================
  /**
   * List posts in a board
   * @returns ListResponse with data array and pagination meta
   */
  async listPosts(boardIdOrSlug, params) {
    return this.http.getList(`/boards/${boardIdOrSlug}/posts`, params);
  }
  /**
   * Get post by ID
   */
  async getPost(postId) {
    return this.http.get(`/posts/${postId}`);
  }
  // ============================================
  // Posts (Protected - requires auth)
  // ============================================
  /**
   * Create new post
   */
  async createPost(data) {
    return this.http.post("/posts", data);
  }
  /**
   * Update post
   */
  async updatePost(postId, data) {
    return this.http.put(`/posts/${postId}`, data);
  }
  /**
   * Delete post
   */
  async deletePost(postId) {
    return this.http.delete(`/posts/${postId}`);
  }
  // ============================================
  // Comments
  // ============================================
  /**
   * List comments for a post
   * @returns Array of comments (always an array, never null/undefined)
   */
  async listComments(postId) {
    const response = await this.http.getList(`/posts/${postId}/comments`);
    return response.data;
  }
  /**
   * Create comment on a post
   */
  async createComment(postId, data) {
    return this.http.post(`/posts/${postId}/comments`, data);
  }
  /**
   * Update comment
   */
  async updateComment(commentId, data) {
    return this.http.put(`/comments/${commentId}`, data);
  }
  /**
   * Delete comment
   */
  async deleteComment(commentId) {
    return this.http.delete(`/comments/${commentId}`);
  }
};

// src/resources/blog.ts
var BlogResource = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * List blog posts
   * @returns ListResponse with data array (always defined) and pagination meta
   */
  async list(params) {
    return this.http.getList("/blog", params);
  }
  /**
   * Get blog post by slug
   */
  async get(slug) {
    return this.http.get(`/blog/${slug}`);
  }
  /**
   * Get blog post by ID
   */
  async getById(id) {
    return this.http.get(`/blog/id/${id}`);
  }
  /**
   * Get featured blog posts
   * @returns Array of featured posts (always an array, never null/undefined)
   */
  async featured(limit = 5) {
    const response = await this.http.getList("/blog", {
      per_page: limit,
      featured: true
    });
    return response.data;
  }
  /**
   * Get blog posts by category
   * @returns ListResponse with data array and pagination meta
   */
  async byCategory(category, params) {
    return this.http.getList("/blog", {
      ...params,
      category
    });
  }
  /**
   * Get blog posts by tag
   * @returns ListResponse with data array and pagination meta
   */
  async byTag(tag, params) {
    return this.http.getList("/blog", {
      ...params,
      tag
    });
  }
  /**
   * Search blog posts
   * @returns ListResponse with data array and pagination meta
   */
  async search(query, params) {
    return this.http.getList("/blog", {
      ...params,
      search: query
    });
  }
  /**
   * Get blog categories
   * @returns Array of blog categories with details
   */
  async categories() {
    const response = await this.http.get("/blog/categories");
    return Array.isArray(response) ? response : response?.data ?? [];
  }
  /**
   * Get blog tags
   * @returns Array of tag names (always an array)
   */
  async tags() {
    const response = await this.http.get("/blog/tags");
    return Array.isArray(response) ? response : response?.data ?? [];
  }
};

// src/resources/comments.ts
var CommentsResource = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get comments for a board post
   */
  async boardPost(postId, params) {
    return this.http.get(`/posts/${postId}/comments`, params);
  }
  /**
   * Create a comment on a board post
   */
  async createBoardPost(postId, data) {
    return this.http.post(`/posts/${postId}/comments`, data);
  }
  /**
   * Get comments for a blog post
   */
  async blogPost(slug, params) {
    return this.http.get(`/blog/${slug}/comments`, params);
  }
  /**
   * Create a comment on a blog post
   */
  async createBlogPost(slug, data) {
    return this.http.post(`/blog/${slug}/comments`, data);
  }
  /**
   * Get standalone comments (guestbook, feedback, etc.)
   */
  async standalone(pageSlug, params) {
    return this.http.get(`/comments/${pageSlug}`, params);
  }
  /**
   * Create a standalone comment
   */
  async createStandalone(pageSlug, data) {
    return this.http.post(`/comments/${pageSlug}`, data);
  }
  /**
   * Update a comment
   */
  async update(commentId, data) {
    return this.http.put(`/comments/${commentId}`, data);
  }
  /**
   * Delete a comment
   */
  async delete(commentId, data) {
    return this.http.delete(`/comments/${commentId}`, data);
  }
  /**
   * Like a comment
   */
  async like(commentId) {
    return this.http.post(`/comments/${commentId}/like`);
  }
};

// src/resources/forms.ts
var FormsResource = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * List all forms
   * @returns ListResponse with data array and pagination meta
   */
  async list(params) {
    return this.http.getList("/forms", params);
  }
  /**
   * Get form by ID or slug
   */
  async get(idOrSlug) {
    return this.http.get(`/forms/${idOrSlug}`);
  }
  /**
   * Submit form data
   */
  async submit(formIdOrSlug, data) {
    return this.http.post(`/forms/${formIdOrSlug}/submit`, data);
  }
  // ============================================
  // Protected endpoints (requires auth)
  // ============================================
  /**
   * Get my form submissions
   * @returns ListResponse with data array and pagination meta
   */
  async mySubmissions(params) {
    return this.http.getList("/form-submissions", params);
  }
  /**
   * Get specific submission
   */
  async getSubmission(submissionId) {
    return this.http.get(`/form-submissions/${submissionId}`);
  }
};

// src/resources/shop.ts
var ShopResource = class {
  constructor(http) {
    this.http = http;
  }
  // ============================================
  // Products (Public)
  // ============================================
  /**
   * List products
   * @returns ListResponse with data array and pagination meta
   */
  async listProducts(params) {
    return this.http.getList("/products", params);
  }
  /**
   * Get product by ID or slug
   */
  async getProduct(idOrSlug) {
    return this.http.get(`/products/${idOrSlug}`);
  }
  /**
   * Get featured products
   * @returns Array of featured products (always an array)
   */
  async featuredProducts(limit = 8) {
    const response = await this.http.getList("/products", {
      per_page: limit,
      is_featured: true
    });
    return response.data;
  }
  /**
   * Search products
   * @returns ListResponse with data array and pagination meta
   */
  async searchProducts(query, params) {
    return this.http.getList("/products", {
      ...params,
      search: query
    });
  }
  // ============================================
  // Categories (Public)
  // ============================================
  /**
   * List product categories
   * @returns ListResponse with data array and pagination meta
   */
  async listCategories() {
    return this.http.getList("/categories");
  }
  /**
   * Get category by ID or slug
   */
  async getCategory(idOrSlug) {
    return this.http.get(`/categories/${idOrSlug}`);
  }
  /**
   * Get products in category
   * @returns ListResponse with data array and pagination meta
   */
  async categoryProducts(categoryIdOrSlug, params) {
    return this.http.getList(`/categories/${categoryIdOrSlug}/products`, params);
  }
  // ============================================
  // Cart
  // ============================================
  /**
   * Save cart session ID from response (for guest cart persistence)
   */
  saveCartSession(cart) {
    if (cart.session_id) {
      this.http.setCartSessionId(cart.session_id);
    }
    return cart;
  }
  /**
   * Get current cart
   */
  async getCart() {
    const cart = await this.http.get("/cart");
    return this.saveCartSession(cart);
  }
  /**
   * Add item to cart
   */
  async addToCart(data) {
    const cart = await this.http.post("/cart/items", data);
    return this.saveCartSession(cart);
  }
  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId, data) {
    const cart = await this.http.put(`/cart/items/${itemId}`, data);
    return this.saveCartSession(cart);
  }
  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    const cart = await this.http.delete(`/cart/items/${itemId}`);
    return this.saveCartSession(cart);
  }
  /**
   * Clear entire cart
   */
  async clearCart() {
    await this.http.delete("/cart");
    this.http.setCartSessionId(null);
  }
  // ============================================
  // Orders (Protected)
  // ============================================
  /**
   * List my orders
   * @returns ListResponse with data array and pagination meta
   */
  async listOrders(params) {
    return this.http.getList("/orders", params);
  }
  /**
   * Get order by ID or order number
   */
  async getOrder(idOrNumber) {
    return this.http.get(`/orders/${idOrNumber}`);
  }
  /**
   * Create order from cart
   */
  async createOrder(data) {
    return this.http.post("/orders", data);
  }
  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return this.http.post(`/orders/${orderId}/cancel`);
  }
  // ============================================
  // Payments
  // ============================================
  /**
   * Get payment for order
   */
  async getPayment(orderId) {
    return this.http.get(`/orders/${orderId}/payment`);
  }
  /**
   * Get payment status (available payment methods)
   */
  async getPaymentStatus() {
    return this.http.get("/payments/status");
  }
  // ============================================
  // Toss Payments
  // ============================================
  /**
   * Prepare Toss payment (get client key and payment info)
   */
  async tossPaymentReady(data) {
    return this.http.post("/payments/toss/ready", data);
  }
  /**
   * Confirm Toss payment (after redirect)
   */
  async tossPaymentConfirm(data) {
    return this.http.post("/payments/toss/confirm", data);
  }
  /**
   * Cancel Toss payment
   */
  async tossPaymentCancel(orderNumber, cancelReason, cancelAmount) {
    await this.http.post("/payments/toss/cancel", {
      order_number: orderNumber,
      cancel_reason: cancelReason,
      cancel_amount: cancelAmount
    });
  }
  // ============================================
  // Stripe Payments
  // ============================================
  /**
   * Create Stripe Checkout Session
   */
  async stripeCheckout(data) {
    return this.http.post("/payments/stripe/checkout", data);
  }
  /**
   * Verify Stripe payment (after redirect)
   */
  async stripeVerify(data) {
    return this.http.post("/payments/stripe/verify", data);
  }
  /**
   * Refund Stripe payment
   */
  async stripeRefund(orderNumber, reason, amount) {
    await this.http.post("/payments/stripe/refund", {
      order_number: orderNumber,
      reason,
      amount
    });
  }
  // ============================================
  // Legacy Payment Methods (deprecated)
  // ============================================
  /**
   * @deprecated Use tossPaymentReady instead
   */
  async preparePayment(data) {
    return this.http.post(`/payments/ready`, data);
  }
  /**
   * @deprecated Use tossPaymentConfirm instead
   */
  async confirmPayment(data) {
    return this.http.post("/payments/confirm", data);
  }
  /**
   * @deprecated Use tossPaymentCancel instead
   */
  async cancelPayment(paymentId, data) {
    return this.http.post(`/payments/${paymentId}/cancel`, data);
  }
  // ============================================
  // Coupons
  // ============================================
  /**
   * Validate coupon code
   */
  async validateCoupon(code, orderAmount) {
    return this.http.post("/coupons/validate", {
      code,
      order_amount: orderAmount
    });
  }
  /**
   * Get available coupons for current user
   * @returns Array of coupons (always an array)
   */
  async myCoupons() {
    const response = await this.http.getList("/coupons");
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
  async getProductReviews(productSlug, params) {
    return this.http.get(`/products/${productSlug}/reviews`, params);
  }
  /**
   * Check if current user can review a product
   * Requires: logged in + purchased the product + not already reviewed
   */
  async canReviewProduct(productSlug) {
    const response = await this.http.get(
      `/products/${productSlug}/reviews/can-review`
    );
    return response;
  }
  /**
   * Create a product review (requires purchase)
   */
  async createReview(productSlug, data) {
    const response = await this.http.post(
      `/products/${productSlug}/reviews`,
      data
    );
    return response.data;
  }
  /**
   * Update your own review
   */
  async updateReview(reviewId, data) {
    const response = await this.http.put(
      `/reviews/${reviewId}`,
      data
    );
    return response.data;
  }
  /**
   * Delete your own review
   */
  async deleteReview(reviewId) {
    await this.http.delete(`/reviews/${reviewId}`);
  }
  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId) {
    return this.http.post(`/reviews/${reviewId}/helpful`);
  }
  /**
   * Get my reviews
   * @returns Array of reviews written by the current user
   */
  async myReviews(params) {
    return this.http.getList("/my/reviews", params);
  }
  // ============================================
  // Wishlist
  // ============================================
  /**
   * Get wishlist items
   * Requires authentication
   */
  async getWishlist(params) {
    return this.http.getList("/wishlist", params);
  }
  /**
   * Add product to wishlist
   * Requires authentication
   */
  async addToWishlist(data) {
    return this.http.post("/wishlist", data);
  }
  /**
   * Remove item from wishlist
   * Requires authentication
   */
  async removeFromWishlist(wishlistId) {
    await this.http.delete(`/wishlist/${wishlistId}`);
  }
  /**
   * Toggle wishlist (add if not in wishlist, remove if in wishlist)
   * Requires authentication
   */
  async toggleWishlist(productId, variantId) {
    return this.http.post("/wishlist/toggle", {
      product_id: productId,
      variant_id: variantId
    });
  }
  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId, variantId) {
    const result = await this.http.get("/wishlist/check", {
      product_id: productId,
      variant_id: variantId
    });
    return result.in_wishlist;
  }
  /**
   * Check multiple products' wishlist status
   * Useful for product list pages
   */
  async checkWishlistBulk(productIds) {
    const result = await this.http.post("/wishlist/check-bulk", {
      product_ids: productIds
    });
    return result.items;
  }
  /**
   * Get wishlist count
   */
  async getWishlistCount() {
    const result = await this.http.get("/wishlist/count");
    return result.count;
  }
  /**
   * Move wishlist items to cart
   * @param wishlistIds - Optional array of wishlist item IDs to move. If empty, moves all items.
   */
  async moveWishlistToCart(wishlistIds) {
    return this.http.post("/wishlist/move-to-cart", {
      wishlist_ids: wishlistIds
    });
  }
  /**
   * Update wishlist item note
   */
  async updateWishlistNote(wishlistId, note) {
    return this.http.put(`/wishlist/${wishlistId}`, { note });
  }
  /**
   * Get product's wishlist count (how many users added this product)
   */
  async getProductWishlistCount(productSlug) {
    const result = await this.http.get(`/products/${productSlug}/wishlist-count`);
    return result.count;
  }
  // ============================================
  // Digital Downloads
  // ============================================
  /**
   * Get my download links
   * Requires authentication
   */
  async getMyDownloads() {
    const result = await this.http.get("/my/downloads");
    return result.downloads;
  }
  /**
   * Get download links for a specific order
   * Requires authentication
   */
  async getOrderDownloads(orderNumber) {
    const result = await this.http.get(
      `/orders/${orderNumber}/downloads`
    );
    return result.downloads;
  }
  /**
   * Get download file URL
   * Returns the web download URL that handles server-side authentication
   * User must be logged in via session (not just API token)
   */
  getDownloadUrl(token) {
    return this.http.getDownloadUrl(token);
  }
  /**
   * Get download link info (without triggering download)
   * Requires authentication
   */
  async getDownloadInfo(token) {
    const result = await this.http.get(`/downloads/${token}/info`);
    return result.download;
  }
  // ============================================
  // Subscriptions
  // ============================================
  /**
   * Get my subscriptions
   * Requires authentication
   */
  async getSubscriptions() {
    const result = await this.http.get("/subscriptions");
    return result.subscriptions;
  }
  /**
   * Get subscription by ID
   * Requires authentication
   */
  async getSubscription(id) {
    const result = await this.http.get(`/subscriptions/${id}`);
    return result.subscription;
  }
  /**
   * Create a new subscription
   * Requires Stripe payment method ID
   * Requires authentication
   */
  async createSubscription(data) {
    return this.http.post("/subscriptions", data);
  }
  /**
   * Cancel subscription
   * @param immediately - If true, cancel immediately. Otherwise, cancel at end of billing period.
   * Requires authentication
   */
  async cancelSubscription(id, immediately = false) {
    const result = await this.http.post(
      `/subscriptions/${id}/cancel`,
      { immediately }
    );
    return result.subscription;
  }
  /**
   * Pause subscription
   * Requires authentication
   */
  async pauseSubscription(id) {
    const result = await this.http.post(
      `/subscriptions/${id}/pause`
    );
    return result.subscription;
  }
  /**
   * Resume paused subscription
   * Requires authentication
   */
  async resumeSubscription(id) {
    const result = await this.http.post(
      `/subscriptions/${id}/resume`
    );
    return result.subscription;
  }
  /**
   * Create Stripe Setup Intent for adding payment method
   * Use with Stripe.js to collect card details
   * Requires authentication
   */
  async createSetupIntent() {
    return this.http.post("/subscriptions/setup-intent");
  }
  /**
   * Create Stripe Checkout Session for subscription
   * Redirects to Stripe Checkout page
   * Requires authentication
   */
  async createSubscriptionCheckout(data) {
    return this.http.post("/subscriptions/checkout", data);
  }
  /**
   * Verify Stripe Checkout Session for subscription
   * Call after returning from Stripe Checkout
   * Requires authentication
   */
  async verifySubscriptionCheckout(session_id) {
    return this.http.post("/subscriptions/verify", { session_id });
  }
  // ============================================
  // Bundle Products
  // ============================================
  /**
   * Get bundle items and pricing
   * Returns all products in the bundle with calculated pricing
   */
  async getBundleItems(productSlug) {
    const result = await this.http.get(`/products/${productSlug}/bundle-items`);
    return result.bundle;
  }
  // ============================================
  // Product Type Filters
  // ============================================
  /**
   * List products with type filter
   */
  async listProductsByType(type, params) {
    return this.http.getList("/products", { ...params, type });
  }
  /**
   * Get digital products
   */
  async getDigitalProducts(params) {
    return this.listProductsByType("digital", params);
  }
  /**
   * Get subscription products
   */
  async getSubscriptionProducts(params) {
    return this.listProductsByType("subscription", params);
  }
  /**
   * Get bundle products
   */
  async getBundleProducts(params) {
    return this.listProductsByType("bundle", params);
  }
};

// src/resources/media.ts
var MediaResource = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * List my media files
   */
  async list(params) {
    return this.http.get("/media", params);
  }
  /**
   * Get media by ID
   */
  async get(mediaId) {
    return this.http.get(`/media/${mediaId}`);
  }
  /**
   * Upload file
   */
  async upload(file) {
    return this.http.upload("/media", file, "file");
  }
  /**
   * Upload multiple files
   */
  async uploadMultiple(files) {
    const results = [];
    for (const file of files) {
      const media = await this.upload(file);
      results.push(media);
    }
    return results;
  }
  /**
   * Delete media
   */
  async delete(mediaId) {
    return this.http.delete(`/media/${mediaId}`);
  }
};

// src/resources/entities.ts
var EntitiesResource = class {
  constructor(http) {
    this.http = http;
  }
  // ============================================
  // Entity Definitions CRUD
  // ============================================
  /**
   * List all custom entities
   * @returns Array of entities
   *
   * @example
   * ```typescript
   * const entities = await client.entities.list();
   * // [{ id: 1, name: 'Customer', slug: 'customer', records_count: 150, ... }]
   * ```
   */
  async list() {
    const response = await this.http.getList("/entities");
    return response.data;
  }
  /**
   * Create a new entity definition
   *
   * @example
   * ```typescript
   * const entity = await client.entities.create({
   *   name: '고객',
   *   slug: 'customers',  // optional, auto-generated from name
   *   description: '고객 관리',
   *   schema: {
   *     fields: [
   *       { name: 'company', label: '회사명', type: 'text', required: true },
   *       { name: 'email', label: '이메일', type: 'email', required: true },
   *       { name: 'status', label: '상태', type: 'select', options: [
   *         { value: 'active', label: '활성' },
   *         { value: 'inactive', label: '비활성' }
   *       ]}
   *     ]
   *   },
   *   icon: 'users'
   * });
   * ```
   */
  async create(data) {
    return this.http.post("/entities", data);
  }
  /**
   * Get entity definition by slug (includes schema)
   *
   * @example
   * ```typescript
   * const entity = await client.entities.get('customers');
   * console.log(entity.schema.fields);
   * ```
   */
  async get(slug) {
    return this.http.get(`/entities/${slug}`);
  }
  /**
   * Update an entity definition
   *
   * @example
   * ```typescript
   * const updated = await client.entities.update('customers', {
   *   name: '고객사',
   *   description: '고객사 관리'
   * });
   * ```
   */
  async update(slug, data) {
    return this.http.put(`/entities/${slug}`, data);
  }
  /**
   * Delete an entity definition
   * If entity has records, use force=true to delete anyway
   *
   * @example
   * ```typescript
   * // Will fail if entity has records
   * await client.entities.delete('customers');
   *
   * // Force delete with all records
   * await client.entities.delete('customers', true);
   * ```
   */
  async delete(slug, force = false) {
    const params = force ? { force: "true" } : void 0;
    return this.http.delete(`/entities/${slug}`, params);
  }
  /**
   * Get entity schema (convenience method)
   * @deprecated Use get(slug) instead - it includes schema
   */
  async getSchema(slug) {
    const entity = await this.get(slug);
    return entity.schema;
  }
  // ============================================
  // Records CRUD
  // ============================================
  /**
   * List records for an entity
   * @returns ListResponse with data array and pagination meta
   *
   * @example
   * ```typescript
   * // Basic listing
   * const customers = await client.entities.listRecords('customers');
   *
   * // With pagination and search
   * const customers = await client.entities.listRecords('customers', {
   *   page: 1,
   *   per_page: 20,
   *   search: 'ACME',
   *   sort: 'company',
   *   dir: 'asc'
   * });
   *
   * // With filtering
   * const vipCustomers = await client.entities.listRecords('customers', {
   *   filters: JSON.stringify({ tier: 'vip' })
   * });
   * ```
   */
  async listRecords(slug, params) {
    return this.http.getList(`/entities/${slug}/records`, params);
  }
  /**
   * Get a single record by ID
   *
   * @example
   * ```typescript
   * const customer = await client.entities.getRecord('customers', 1);
   * console.log(customer.data.company); // 'ABC Corp'
   * ```
   */
  async getRecord(slug, id) {
    return this.http.get(`/entities/${slug}/records/${id}`);
  }
  /**
   * Create a new record
   * Request body fields are defined by entity schema
   *
   * @example
   * ```typescript
   * const newCustomer = await client.entities.createRecord('customers', {
   *   company: 'ABC Corp',
   *   email: 'contact@abc.com',
   *   tier: 'standard',
   * });
   * ```
   */
  async createRecord(slug, data) {
    return this.http.post(`/entities/${slug}/records`, data);
  }
  /**
   * Update a record
   * Only provided fields will be updated, existing data is preserved
   *
   * @example
   * ```typescript
   * const updated = await client.entities.updateRecord('customers', 1, {
   *   tier: 'vip',
   *   email: 'new@abc.com'
   * });
   * ```
   */
  async updateRecord(slug, id, data) {
    return this.http.put(`/entities/${slug}/records/${id}`, data);
  }
  /**
   * Delete a record
   *
   * @example
   * ```typescript
   * await client.entities.deleteRecord('customers', 1);
   * ```
   */
  async deleteRecord(slug, id) {
    return this.http.delete(`/entities/${slug}/records/${id}`);
  }
  // ============================================
  // Helper Methods
  // ============================================
  /**
   * Get a value from a record's data
   *
   * @example
   * ```typescript
   * const record = await client.entities.getRecord('customers', 1);
   * const company = client.entities.getValue(record, 'company');
   * ```
   */
  getValue(record, field) {
    return record.data?.[field];
  }
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
   * const customers = client.entities.typed<Customer>('customers');
   * const list = await customers.list(); // Typed records
   * const record = await customers.get(1);
   * console.log(record.data.company); // TypeScript knows this is string
   * ```
   */
  typed(slug) {
    return {
      list: async (params) => {
        const response = await this.listRecords(slug, params);
        return {
          ...response,
          data: response.data
        };
      },
      get: async (id) => {
        const record = await this.getRecord(slug, id);
        return record;
      },
      create: async (data) => {
        const record = await this.createRecord(slug, data);
        return record;
      },
      update: async (id, data) => {
        const record = await this.updateRecord(slug, id, data);
        return record;
      },
      delete: (id) => this.deleteRecord(slug, id)
    };
  }
};

// src/resources/reservation.ts
var ReservationResource = class {
  constructor(http) {
    this.http = http;
  }
  // ============================================
  // Public Endpoints
  // ============================================
  /**
   * Get reservation settings
   * @returns Reservation settings for the tenant
   */
  async getSettings() {
    return this.http.get("/reservation/settings");
  }
  /**
   * List available services
   * @returns Array of services (always an array)
   */
  async listServices() {
    const response = await this.http.getList("/reservation/services");
    return response.data;
  }
  /**
   * List available staff members
   * @param serviceId - Optional: filter staff by service
   * @returns Array of staff members (always an array)
   */
  async listStaff(serviceId) {
    const params = serviceId ? { service_id: serviceId } : void 0;
    const response = await this.http.getList("/reservation/staffs", params);
    return response.data;
  }
  /**
   * Get available dates for booking
   * @returns Array of available date strings (YYYY-MM-DD)
   */
  async getAvailableDates(params) {
    const response = await this.http.get("/reservation/available-dates", params);
    return Array.isArray(response) ? response : response?.data ?? [];
  }
  /**
   * Get available time slots for a specific date
   * @returns Array of available slots (always an array)
   */
  async getAvailableSlots(params) {
    const response = await this.http.get("/reservation/available-slots", params);
    return Array.isArray(response) ? response : response?.data ?? [];
  }
  // ============================================
  // Protected Endpoints (requires auth)
  // ============================================
  /**
   * Create a new reservation
   * @returns Created reservation with payment info
   */
  async create(data) {
    return this.http.post("/reservations", data);
  }
  /**
   * List my reservations
   * @returns ListResponse with reservations and pagination meta
   */
  async list(params) {
    return this.http.getList("/reservations", params);
  }
  /**
   * Get upcoming reservations
   * @returns Array of upcoming reservations
   */
  async upcoming(limit = 10) {
    const response = await this.http.getList("/reservations", {
      upcoming: true,
      per_page: limit
    });
    return response.data;
  }
  /**
   * Get past reservations
   * @returns Array of past reservations
   */
  async past(limit = 10) {
    const response = await this.http.getList("/reservations", {
      past: true,
      per_page: limit
    });
    return response.data;
  }
  /**
   * Get reservation by reservation number
   */
  async get(reservationNumber) {
    return this.http.get(`/reservations/${reservationNumber}`);
  }
  /**
   * Cancel a reservation
   * @param reservationNumber - Reservation number to cancel
   * @param reason - Optional cancellation reason
   */
  async cancel(reservationNumber, reason) {
    return this.http.post(`/reservations/${reservationNumber}/cancel`, { reason });
  }
};

// src/index.ts
var Diffsome = class {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("API key is required. Get your API key from Dashboard > Settings > API Tokens");
    }
    this.http = new HttpClient(config);
    this.auth = new AuthResource(this.http);
    this.boards = new BoardsResource(this.http);
    this.blog = new BlogResource(this.http);
    this.comments = new CommentsResource(this.http);
    this.forms = new FormsResource(this.http);
    this.shop = new ShopResource(this.http);
    this.media = new MediaResource(this.http);
    this.entities = new EntitiesResource(this.http);
    this.reservation = new ReservationResource(this.http);
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.auth.isAuthenticated();
  }
  /**
   * Set authentication token manually
   */
  setToken(token) {
    this.auth.setToken(token);
  }
  /**
   * Get current authentication token
   */
  getToken() {
    return this.auth.getToken();
  }
  /**
   * Set API key for server-to-server authentication
   * Alternative to user token authentication
   *
   * @example
   * ```typescript
   * const client = new Diffsome({
   *   tenantId: 'my-site',
   *   apiKey: 'pky_your_api_key_here',
   * });
   *
   * // Or set later
   * client.setApiKey('pky_your_api_key_here');
   * ```
   */
  setApiKey(apiKey) {
    this.http.setApiKey(apiKey);
  }
  /**
   * Get current API key
   */
  getApiKey() {
    return this.http.getApiKey();
  }
};
var index_default = Diffsome;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Diffsome,
  DiffsomeError,
  Promptly,
  PromptlyError
});
