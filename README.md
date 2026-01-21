# @diffsome/sdk

Diffsome Official SDK - Headless CMS + E-commerce + AI platform.

**Version: 3.2.0**

## Installation

```bash
npm install @diffsome/sdk
```

## Quick Start

```typescript
import { Diffsome } from '@diffsome/sdk';

const client = new Diffsome({
  tenantId: 'your-tenant-id',
  apiKey: 'pky_xxxxxxxxxxxxxxxx',  // Required - Dashboard > Settings > API Tokens
  baseUrl: 'https://diffsome.com',  // Optional

  // Token auto-save (persistent login)
  persistToken: true,
  storageType: 'localStorage',  // or 'sessionStorage'
  onAuthStateChange: (token, user) => {
    console.log('Auth changed:', user);
  },
});

// Blog posts
const { data: posts } = await client.blog.list();

// Products
const { data: products } = await client.shop.listProducts();
```

---

## Authentication (Auth)

### Basic Setup

```typescript
const client = new Diffsome({
  tenantId: 'demo',
  apiKey: 'pky_xxxxxxxxxxxxxxxx',  // Required
  persistToken: true,  // Auto-save token
});
```

### Token Persistence

With `persistToken: true`:
- **Login**: Auto-saved to `localStorage`
- **Refresh**: Token auto-restored
- **Logout**: Token auto-removed
- **Storage key**: `diffsome_auth_token_{tenantId}`

```typescript
const client = new Diffsome({
  tenantId: 'demo',
  apiKey: 'pky_xxx',
  persistToken: true,
  storageType: 'localStorage',  // Default, or 'sessionStorage'
  onAuthStateChange: (token, user) => {
    if (token) {
      console.log('Logged in:', user);
    } else {
      console.log('Logged out');
    }
  },
});
```

### Login / Register

```typescript
// Register
await client.auth.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  password_confirmation: 'password',
});

// Login (token auto-saved)
const { member, token } = await client.auth.login({
  email: 'john@example.com',
  password: 'password',
});

// Logout (token auto-removed)
await client.auth.logout();

// Check auth status
client.auth.isAuthenticated();  // true/false

// Current user
const me = await client.auth.me();

// Update profile
await client.auth.updateProfile({ name: 'New Name' });
```

### Social Login

```typescript
// Available providers
const providers = await client.auth.getSocialProviders();
// ['google', 'kakao', 'naver']

// Get login URL
const { url } = await client.auth.getSocialAuthUrl('google');
window.location.href = url;

// Handle callback (after redirect)
const { member, token } = await client.auth.socialCallback('google', code);
```

### Password Reset

```typescript
// Send reset email
await client.auth.forgotPassword({ email: 'john@example.com' });

// Reset password
await client.auth.resetPassword({
  token: 'reset-token',
  email: 'john@example.com',
  password: 'newpassword',
  password_confirmation: 'newpassword',
});
```

---

## Blog API

```typescript
// List posts
const { data, meta } = await client.blog.list({
  page: 1,
  per_page: 10,
  category: 'tech',
  tag: 'laravel',
  search: 'keyword',
});

// Get post by slug
const post = await client.blog.get('post-slug');

// Featured posts
const featured = await client.blog.featured(5);

// Filter by category/tag
const { data } = await client.blog.byCategory('news');
const { data } = await client.blog.byTag('featured');

// Get categories/tags
const categories = await client.blog.categories();  // string[]
const tags = await client.blog.tags();  // string[]
```

---

## Boards API

```typescript
// List boards
const { data: boards } = await client.boards.list();

// Get board
const board = await client.boards.get('board-slug');

// List posts
const { data: posts } = await client.boards.listPosts('board-slug', {
  page: 1,
  per_page: 10,
  search: 'keyword',
});

// Get post
const post = await client.boards.getPost(postId);

// Create post (auth required)
await client.boards.createPost({
  board_id: 1,
  title: 'Title',
  content: 'Content',
  is_secret: false,
});

// Update/Delete post
await client.boards.updatePost(postId, { title: 'New Title' });
await client.boards.deletePost(postId);
```

---

## Comments API

Supports board posts, blog posts, and standalone pages (guestbook).

```typescript
// Board post comments
const { data } = await client.comments.boardPost(postId);
await client.comments.createBoardPost(postId, {
  author_name: 'John',
  content: 'Great!',
  password: '1234',  // Guest comment
});

// Blog post comments
const { data } = await client.comments.blogPost('post-slug');
await client.comments.createBlogPost('post-slug', {
  content: 'Nice article!',
});

// Standalone comments (guestbook)
const { data } = await client.comments.standalone('guestbook');
await client.comments.createStandalone('guestbook', {
  author_name: 'Visitor',
  content: 'Hello!',
});

// Common operations
await client.comments.update(commentId, { content: 'Updated' });
await client.comments.delete(commentId, { password: '1234' });
await client.comments.like(commentId);
```

---

## Shop API

### Products

```typescript
// List products
const { data: products } = await client.shop.listProducts({
  category: 'shoes',
  is_featured: true,
  min_price: 10000,
  max_price: 50000,
  search: 'keyword',
});

// Get product by slug
const product = await client.shop.getProduct('product-slug');

// Featured products
const featured = await client.shop.featuredProducts(8);

// Categories
const { data: categories } = await client.shop.listCategories();
```

### Product Types

```typescript
// Filter by product type
const { data } = await client.shop.listProductsByType('digital');
const { data } = await client.shop.getDigitalProducts();
const { data } = await client.shop.getSubscriptionProducts();
const { data } = await client.shop.getBundleProducts();
```

### Product Reviews

```typescript
// List reviews
const { data: reviews, stats } = await client.shop.getProductReviews('product-slug', {
  page: 1,
  per_page: 10,
  rating: 5,  // Filter by rating
});

// Review stats
// stats = { average_rating: 4.5, total_count: 123, rating_counts: { 5: 80, 4: 30, ... } }

// Create review (auth + purchase required)
await client.shop.createReview('product-slug', {
  rating: 5,
  title: 'Great product!',
  content: 'Highly recommended.',
  images: ['https://...'],
});

// Check if can review
const { can_review, reason } = await client.shop.canReviewProduct('product-slug');

// Update/Delete review
await client.shop.updateReview(reviewId, { rating: 4 });
await client.shop.deleteReview(reviewId);

// Mark as helpful
await client.shop.markReviewHelpful(reviewId);

// My reviews
const { data: myReviews } = await client.shop.myReviews();
```

### Cart

Works for both authenticated users and guests. Guest carts use session ID persistence.

```typescript
// Get cart
const cart = await client.shop.getCart();

// Add item
await client.shop.addToCart({
  product_id: 1,
  quantity: 2,
  variant_id: 3,  // Variant option
});

// Update quantity
await client.shop.updateCartItem(itemId, { quantity: 3 });

// Remove item
await client.shop.removeFromCart(itemId);

// Clear cart
await client.shop.clearCart();
```

### Wishlist (Auth Required)

```typescript
// Get wishlist
const { data: items } = await client.shop.getWishlist();

// Add to wishlist
await client.shop.addToWishlist({
  product_id: 1,
  variant_id: 2,
  note: 'Birthday gift',
});

// Toggle wishlist (add if not in, remove if in)
const { action, in_wishlist } = await client.shop.toggleWishlist(productId);

// Check if in wishlist
const isInWishlist = await client.shop.isInWishlist(productId);

// Bulk check (for product list pages)
const wishlistStatus = await client.shop.checkWishlistBulk([1, 2, 3]);
// { '1': true, '2': false, '3': true }

// Wishlist count
const count = await client.shop.getWishlistCount();

// Move to cart
const { moved, failed, moved_count } = await client.shop.moveWishlistToCart();

// Update note
await client.shop.updateWishlistNote(wishlistId, 'New note');

// Remove from wishlist
await client.shop.removeFromWishlist(wishlistId);
```

### Orders (Auth Required)

```typescript
// Create order
const order = await client.shop.createOrder({
  orderer_name: 'John Doe',
  orderer_email: 'john@example.com',
  orderer_phone: '010-1234-5678',
  shipping_name: 'John Doe',
  shipping_phone: '010-1234-5678',
  shipping_zipcode: '12345',
  shipping_address: 'Seoul, Gangnam',
  shipping_address_detail: 'Apt 101',
  shipping_memo: 'Leave at door',
  coupon_code: 'SAVE10',
});

// List orders
const { data: orders } = await client.shop.listOrders();

// Get order
const orderDetail = await client.shop.getOrder(orderId);

// Cancel order
await client.shop.cancelOrder(orderId);
```

### Payments - Toss Payments

```typescript
// Prepare payment
const payment = await client.shop.tossPaymentReady({
  order_number: 'ORD-123',
  success_url: 'https://mysite.com/payment/success',
  fail_url: 'https://mysite.com/payment/fail',
});
// { client_key, order_id, order_name, amount, customer_name, ... }

// Confirm payment (after Toss redirect)
const result = await client.shop.tossPaymentConfirm({
  payment_key: 'toss_payment_key',
  order_id: 'ORD-123',
  amount: 50000,
});

// Cancel payment
await client.shop.tossPaymentCancel('ORD-123', 'Customer request', 50000);
```

### Payments - Stripe

```typescript
// Create Checkout Session
const { session_id, checkout_url } = await client.shop.stripeCheckout({
  order_number: 'ORD-123',
  success_url: 'https://mysite.com/payment/success',
  cancel_url: 'https://mysite.com/payment/cancel',
});

// Redirect to Stripe
window.location.href = checkout_url;

// Verify payment (after Stripe redirect)
const result = await client.shop.stripeVerify({
  session_id: 'cs_xxx',
});

// Refund
await client.shop.stripeRefund('ORD-123', 'Customer request', 50000);
```

### Payment Status

```typescript
// Check available payment methods
const status = await client.shop.getPaymentStatus();
// {
//   toss: { available: true },
//   stripe: { available: true, publishable_key: 'pk_xxx' }
// }
```

### Coupons

```typescript
// Validate coupon
const result = await client.shop.validateCoupon('SAVE10', 50000);
// { valid: true, discount_amount: 5000, coupon: { ... } }

// My coupons
const coupons = await client.shop.myCoupons();
```

### Digital Downloads (Auth Required)

```typescript
// Get all my downloads
const downloads = await client.shop.getMyDownloads();

// Get downloads for specific order
const orderDownloads = await client.shop.getOrderDownloads('ORD-123');

// Get download URL
const downloadUrl = await client.shop.downloadFile(token);

// Get download info without downloading
const info = await client.shop.getDownloadInfo(token);
// {
//   id, token, file: { name, file_size_human, extension },
//   download_count, download_limit, remaining_downloads,
//   can_download, blocked_reason, expires_at
// }
```

### Subscriptions (Auth Required)

```typescript
// Get my subscriptions
const subscriptions = await client.shop.getSubscriptions();

// Get subscription detail
const subscription = await client.shop.getSubscription(id);
// {
//   id, product, plan: { interval, price, trial_days, features },
//   status, is_active, on_trial, current_period_end, ...
// }

// Create subscription (requires Stripe payment method)
const { subscription, client_secret } = await client.shop.createSubscription({
  plan_id: 1,
  payment_method_id: 'pm_xxx',
});

// Create setup intent for adding payment method
const { client_secret } = await client.shop.createSetupIntent();

// Cancel subscription
await client.shop.cancelSubscription(id);           // At end of period
await client.shop.cancelSubscription(id, true);     // Immediately

// Pause/Resume subscription
await client.shop.pauseSubscription(id);
await client.shop.resumeSubscription(id);
```

### Bundle Products

```typescript
// Get bundle items and pricing
const bundle = await client.shop.getBundleItems('product-slug');
// {
//   items: [{ product_id, name, quantity, unit_price, subtotal }],
//   original_total: 100000,
//   discount_type: 'percent',
//   discount_value: 20,
//   discount_amount: 20000,
//   final_price: 80000,
//   savings_percent: 20
// }
```

---

## Reservation API

### Public API

```typescript
// Reservation settings
const settings = await client.reservation.getSettings();

// Services list
const services = await client.reservation.listServices();

// Staff list
const staff = await client.reservation.listStaff(serviceId);

// Available dates
const dates = await client.reservation.getAvailableDates({
  service_id: 1,
  staff_id: 2,
  start_date: '2026-01-01',
  end_date: '2026-01-31',
});

// Available time slots
const slots = await client.reservation.getAvailableSlots({
  service_id: 1,
  date: '2026-01-15',
  staff_id: 2,
});
```

### Reservation Management (Auth Required)

```typescript
// Create reservation
await client.reservation.create({
  service_id: 1,
  staff_id: 2,
  reservation_date: '2026-01-15',
  start_time: '14:00',
  customer_name: 'John Doe',
  customer_phone: '010-1234-5678',
  customer_email: 'john@example.com',
  notes: 'Special request',
});

// My reservations
const { data } = await client.reservation.list({ status: 'confirmed' });

// Upcoming/Past reservations
const upcoming = await client.reservation.upcoming(5);
const past = await client.reservation.past(10);

// Cancel reservation
await client.reservation.cancel('RES-20260115-001', 'Schedule change');
```

---

## Forms API

```typescript
// List forms
const { data: forms } = await client.forms.list();

// Get form (includes field definitions)
const form = await client.forms.get('contact');

// Submit form
await client.forms.submit('contact', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!',
});

// My submissions (auth required)
const { data: submissions } = await client.forms.mySubmissions();
```

---

## Media API (Auth Required)

```typescript
// Upload file
const media = await client.media.upload(file);

// Upload multiple files
const mediaList = await client.media.uploadMultiple([file1, file2]);

// My media list
const { data: myMedia } = await client.media.list({ type: 'image/jpeg' });

// Delete media
await client.media.delete(mediaId);
```

---

## Custom Entities API

Dynamic data structure creation and management.

### Entity Definition

```typescript
// List entities
const entities = await client.entities.list();

// Get entity
const entity = await client.entities.get('customers');

// Create entity
await client.entities.create({
  name: 'Customer',
  slug: 'customers',
  schema: {
    fields: [
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]},
    ],
  },
});

// Update/Delete entity
await client.entities.update('customers', { name: 'Clients' });
await client.entities.delete('customers', true);  // force
```

### Records

```typescript
// List records
const { data: records } = await client.entities.listRecords('customers', {
  search: 'ACME',
  filters: JSON.stringify({ status: 'active' }),
});

// Get record
const record = await client.entities.getRecord('customers', 1);

// Create record
await client.entities.createRecord('customers', {
  company: 'ACME Corp',
  email: 'contact@acme.com',
  status: 'active',
});

// Update/Delete record
await client.entities.updateRecord('customers', 1, { status: 'inactive' });
await client.entities.deleteRecord('customers', 1);
```

### TypeScript Support

```typescript
interface Customer {
  company: string;
  email: string;
  status: 'active' | 'inactive';
}

const customers = client.entities.typed<Customer>('customers');
const { data } = await customers.list();  // data: Customer[]
```

---

## Response Types

All list APIs return consistent format:

```typescript
interface ListResponse<T> {
  data: T[];  // Always array, never null
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}
```

---

## Error Handling

```typescript
import { Diffsome, DiffsomeError } from '@diffsome/sdk';

try {
  await client.auth.login({ email: 'wrong@email.com', password: 'wrong' });
} catch (error) {
  if (error instanceof DiffsomeError) {
    console.log(error.message);  // "Invalid credentials"
    console.log(error.status);   // 401
    console.log(error.errors);   // { email: ["Invalid email or password"] }
  }
}
```

---

## React Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Diffsome } from '@diffsome/sdk';

// Singleton client
const client = new Diffsome({
  tenantId: process.env.NEXT_PUBLIC_DIFFSOME_TENANT_ID!,
  apiKey: process.env.NEXT_PUBLIC_DIFFSOME_API_KEY!,
  persistToken: true,
});

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.blog.list({ per_page: 10 })
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## Changelog

### v3.2.0
- Bundle product support
- `getBundleItems()` API
- Product type filter (`listProductsByType()`)

### v3.1.0
- Subscription management API
- `getSubscriptions()`, `createSubscription()`, `cancelSubscription()`
- `pauseSubscription()`, `resumeSubscription()`
- Stripe setup intent for payment method

### v3.0.0
- **Breaking:** Renamed from `Promptly` to `Diffsome`
- **Breaking:** Storage key changed from `promptly_auth_token_` to `diffsome_auth_token_`
- Digital download API (`getMyDownloads()`, `downloadFile()`)
- Wishlist API (full CRUD + bulk operations)
- Guest cart with session persistence
- Stripe payment integration

### v2.18.0
- Product review API
- Shipping settings API

### v2.15.0
- Toss Payments integration

### v2.12.0
- Blog category/tag filters
- Added `category`, `tags`, `views`, `published_at` fields

### v2.10.0
- `persistToken` option for auto token storage
- `onAuthStateChange` callback
- `storageType` option

### v2.5.0
- Secret posts support (`is_secret`, `is_mine`)

### v2.3.0
- Polymorphic comments API (board, blog, standalone)

### v2.0.0
- **Breaking:** API key required

### v1.3.0
- `ListResponse<T>` unified format
- Reservation system support

---

## License

MIT
