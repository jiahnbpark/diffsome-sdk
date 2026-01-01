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
  Promptly: () => Promptly,
  PromptlyError: () => PromptlyError,
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
var PromptlyError = class extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "PromptlyError";
    this.status = status;
    this.errors = errors;
  }
};
var HttpClient = class {
  constructor(config) {
    this.token = null;
    this.tenantId = config.tenantId;
    this.baseUrl = (config.baseUrl || "https://promptly.webbyon.com").replace(/\/$/, "");
    this.timeout = config.timeout || 3e4;
  }
  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
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
    return this.token !== null;
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
   */
  buildHeaders(customHeaders) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
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
        throw new PromptlyError(
          data.message || "Request failed",
          response.status,
          data.errors
        );
      }
      return data.data !== void 0 ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof PromptlyError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new PromptlyError("Request timeout", 408);
        }
        throw new PromptlyError(error.message, 0);
      }
      throw new PromptlyError("Unknown error", 0);
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
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
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
        throw new PromptlyError(
          data.message || "Upload failed",
          response.status,
          data.errors
        );
      }
      return data.data !== void 0 ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof PromptlyError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new PromptlyError("Upload timeout", 408);
        }
        throw new PromptlyError(error.message, 0);
      }
      throw new PromptlyError("Unknown error", 0);
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
   */
  async login(credentials) {
    const response = await this.http.post("/auth/login", credentials);
    if (response.token) {
      this.http.setToken(response.token);
    }
    return response;
  }
  /**
   * Register new member
   */
  async register(data) {
    const response = await this.http.post("/auth/register", data);
    if (response.token) {
      this.http.setToken(response.token);
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
    return this.http.get("/auth/social");
  }
  /**
   * Get social login redirect URL
   */
  async getSocialAuthUrl(provider) {
    return this.http.get(`/auth/social/${provider}`);
  }
  /**
   * Handle social login callback
   */
  async socialCallback(provider, code) {
    const response = await this.http.post(`/auth/social/${provider}/callback`, { code });
    if (response.token) {
      this.http.setToken(response.token);
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
    return this.http.getList("/public/boards", params);
  }
  /**
   * Get board by ID or slug
   */
  async get(idOrSlug) {
    return this.http.get(`/public/boards/${idOrSlug}`);
  }
  // ============================================
  // Posts (Public)
  // ============================================
  /**
   * List posts in a board
   * @returns ListResponse with data array and pagination meta
   */
  async listPosts(boardIdOrSlug, params) {
    return this.http.getList(`/public/boards/${boardIdOrSlug}/posts`, params);
  }
  /**
   * Get post by ID
   */
  async getPost(postId) {
    return this.http.get(`/public/posts/${postId}`);
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
    const response = await this.http.getList(`/public/posts/${postId}/comments`);
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
    return this.http.getList("/public/blog", params);
  }
  /**
   * Get blog post by slug
   */
  async get(slug) {
    return this.http.get(`/public/blog/${slug}`);
  }
  /**
   * Get blog post by ID
   */
  async getById(id) {
    return this.http.get(`/public/blog/id/${id}`);
  }
  /**
   * Get featured blog posts
   * @returns Array of featured posts (always an array, never null/undefined)
   */
  async featured(limit = 5) {
    const response = await this.http.getList("/public/blog", {
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
    return this.http.getList("/public/blog", {
      ...params,
      category
    });
  }
  /**
   * Get blog posts by tag
   * @returns ListResponse with data array and pagination meta
   */
  async byTag(tag, params) {
    return this.http.getList("/public/blog", {
      ...params,
      tag
    });
  }
  /**
   * Search blog posts
   * @returns ListResponse with data array and pagination meta
   */
  async search(query, params) {
    return this.http.getList("/public/blog", {
      ...params,
      search: query
    });
  }
  /**
   * Get blog categories
   * @returns Array of category names (always an array)
   */
  async categories() {
    const response = await this.http.get("/public/blog/categories");
    return Array.isArray(response) ? response : response?.data ?? [];
  }
  /**
   * Get blog tags
   * @returns Array of tag names (always an array)
   */
  async tags() {
    const response = await this.http.get("/public/blog/tags");
    return Array.isArray(response) ? response : response?.data ?? [];
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
    return this.http.getList("/public/forms", params);
  }
  /**
   * Get form by ID or slug
   */
  async get(idOrSlug) {
    return this.http.get(`/public/forms/${idOrSlug}`);
  }
  /**
   * Submit form data
   */
  async submit(formIdOrSlug, data) {
    return this.http.post(`/public/forms/${formIdOrSlug}/submit`, data);
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
    return this.http.getList("/public/products", params);
  }
  /**
   * Get product by ID or slug
   */
  async getProduct(idOrSlug) {
    return this.http.get(`/public/products/${idOrSlug}`);
  }
  /**
   * Get featured products
   * @returns Array of featured products (always an array)
   */
  async featuredProducts(limit = 8) {
    const response = await this.http.getList("/public/products", {
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
    return this.http.getList("/public/products", {
      ...params,
      search: query
    });
  }
  // ============================================
  // Categories (Public)
  // ============================================
  /**
   * List product categories
   * @returns Array of categories (always an array)
   */
  async listCategories() {
    const response = await this.http.getList("/public/categories");
    return response.data;
  }
  /**
   * Get category by ID or slug
   */
  async getCategory(idOrSlug) {
    return this.http.get(`/public/categories/${idOrSlug}`);
  }
  /**
   * Get products in category
   * @returns ListResponse with data array and pagination meta
   */
  async categoryProducts(categoryIdOrSlug, params) {
    return this.http.getList(`/public/categories/${categoryIdOrSlug}/products`, params);
  }
  // ============================================
  // Cart
  // ============================================
  /**
   * Get current cart
   */
  async getCart() {
    return this.http.get("/cart");
  }
  /**
   * Add item to cart
   */
  async addToCart(data) {
    return this.http.post("/cart/items", data);
  }
  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId, data) {
    return this.http.put(`/cart/items/${itemId}`, data);
  }
  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    return this.http.delete(`/cart/items/${itemId}`);
  }
  /**
   * Clear entire cart
   */
  async clearCart() {
    return this.http.delete("/cart");
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
   * Prepare payment (get payment key)
   */
  async preparePayment(data) {
    return this.http.post(`/payments/ready`, data);
  }
  /**
   * Confirm payment (after Toss redirect)
   */
  async confirmPayment(data) {
    return this.http.post("/payments/confirm", data);
  }
  /**
   * Cancel payment
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
  // Entities (Public)
  // ============================================
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
  async list() {
    const response = await this.http.getList("/public/entities");
    return response.data;
  }
  /**
   * Get entity schema by slug
   *
   * @example
   * ```typescript
   * const schema = await client.entities.getSchema('customer');
   * // { fields: [{ name: 'company', label: '회사명', type: 'text', ... }] }
   * ```
   */
  async getSchema(slug) {
    return this.http.get(`/public/entities/${slug}/schema`);
  }
  // ============================================
  // Records (Public Read)
  // ============================================
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
  async listRecords(slug, params) {
    return this.http.getList(`/public/entities/${slug}`, params);
  }
  /**
   * Get a single record by ID
   *
   * @example
   * ```typescript
   * const customer = await client.entities.getRecord('customer', 1);
   * console.log(customer.data.company); // 'ABC Corp'
   * ```
   */
  async getRecord(slug, id) {
    return this.http.get(`/public/entities/${slug}/${id}`);
  }
  // ============================================
  // Records (Protected - requires auth)
  // ============================================
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
  async createRecord(slug, data) {
    return this.http.post(`/entities/${slug}`, data);
  }
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
  async updateRecord(slug, id, data) {
    return this.http.put(`/entities/${slug}/${id}`, data);
  }
  /**
   * Delete a record
   *
   * @example
   * ```typescript
   * await client.entities.deleteRecord('customer', 1);
   * ```
   */
  async deleteRecord(slug, id) {
    return this.http.delete(`/entities/${slug}/${id}`);
  }
  // ============================================
  // Helper Methods
  // ============================================
  /**
   * Get a value from a record's data
   *
   * @example
   * ```typescript
   * const record = await client.entities.getRecord('customer', 1);
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
   * const customers = client.entities.typed<Customer>('customer');
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
      create: async (data, status) => {
        const record = await this.createRecord(slug, { data, status });
        return record;
      },
      update: async (id, data, status) => {
        const record = await this.updateRecord(slug, id, { data, status });
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
    return this.http.get("/public/reservations/settings");
  }
  /**
   * List available services
   * @returns Array of services (always an array)
   */
  async listServices() {
    const response = await this.http.getList("/public/reservations/services");
    return response.data;
  }
  /**
   * List available staff members
   * @param serviceId - Optional: filter staff by service
   * @returns Array of staff members (always an array)
   */
  async listStaff(serviceId) {
    const params = serviceId ? { service_id: serviceId } : void 0;
    const response = await this.http.getList("/public/reservations/staffs", params);
    return response.data;
  }
  /**
   * Get available dates for booking
   * @returns Array of available date strings (YYYY-MM-DD)
   */
  async getAvailableDates(params) {
    const response = await this.http.get("/public/reservations/dates", params);
    return Array.isArray(response) ? response : response?.data ?? [];
  }
  /**
   * Get available time slots for a specific date
   * @returns Array of available slots (always an array)
   */
  async getAvailableSlots(params) {
    const response = await this.http.get("/public/reservations/slots", params);
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
var Promptly = class {
  constructor(config) {
    this.http = new HttpClient(config);
    this.auth = new AuthResource(this.http);
    this.boards = new BoardsResource(this.http);
    this.blog = new BlogResource(this.http);
    this.forms = new FormsResource(this.http);
    this.shop = new ShopResource(this.http);
    this.media = new MediaResource(this.http);
    this.entities = new EntitiesResource(this.http);
    this.reservation = new ReservationResource(this.http);
  }
  /**
   * Get site theme settings
   */
  async getTheme() {
    return this.http.get("/public/theme");
  }
  /**
   * Get site settings
   */
  async getSettings() {
    return this.http.get("/public/settings");
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
};
var index_default = Promptly;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Promptly,
  PromptlyError
});
