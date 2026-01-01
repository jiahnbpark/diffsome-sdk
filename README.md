# @back23/promptly-sdk

Promptly AI CMS SDK for JavaScript/TypeScript

## Installation

```bash
npm install @back23/promptly-sdk
```

## Quick Start

```typescript
import { Promptly } from '@back23/promptly-sdk';

const client = new Promptly({
  tenantId: 'demo',
  baseUrl: 'https://promptly.webbyon.com',
});
```

## v1.3.0 Changes

### Unified Response Structure

All list APIs now return a consistent `ListResponse<T>` format:

```typescript
interface ListResponse<T> {
  data: T[];  // Always an array (never null/undefined)
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

**No more defensive code needed:**

```typescript
// Before (v1.1.0)
const posts = await client.blog.list();
const items = posts?.data ?? [];  // Defensive check needed

// After (v1.3.0)
const { data, meta } = await client.blog.list();
data.map(post => ...);  // data is always an array
```

## API Overview

| Resource | Public (No Auth) | Protected (Auth Required) |
|----------|------------------|---------------------------|
| **Boards** | list, get | - |
| **Posts** | listPosts, getPost | createPost, updatePost, deletePost |
| **Comments** | listComments | createComment, updateComment, deleteComment |
| **Blog** | list, get, featured, byCategory, byTag | - |
| **Shop** | listProducts, getProduct, listCategories | getCart, addToCart, listOrders, createOrder |
| **Forms** | list, get, submit | mySubmissions |
| **Auth** | login, register | logout, me, updateProfile |
| **Media** | - | upload, list, delete |
| **Entities** | list, getSchema, listRecords, getRecord | createRecord, updateRecord, deleteRecord |
| **Reservation** | getSettings, listServices, listStaff, getAvailableDates, getAvailableSlots | create, list, get, cancel |

## API Reference

### Boards (게시판) - Public

```typescript
// 게시판 목록
const { data: boards, meta } = await client.boards.list();
// Returns: ListResponse<Board>

// 게시판 상세
const board = await client.boards.get('first'); // slug or id
// Returns: Board

// 게시판 글 목록
const { data: posts, meta } = await client.boards.listPosts('first', {
  page: 1,
  per_page: 10,
  search: '검색어', // optional
});
// Returns: ListResponse<BoardPost>

// 글 상세
const post = await client.boards.getPost(1);
// Returns: BoardPost

// 댓글 목록
const comments = await client.boards.listComments(1);
// Returns: BoardComment[] (always an array)
```

### Posts & Comments - Protected (로그인 필요)

```typescript
// 먼저 로그인
await client.auth.login({ email: 'user@example.com', password: 'password' });

// 글 작성
const newPost = await client.boards.createPost({
  board_id: 1,
  title: '제목',
  content: '내용',
  is_notice: false,
});

// 글 수정
await client.boards.updatePost(postId, {
  title: '수정된 제목',
  content: '수정된 내용',
});

// 글 삭제
await client.boards.deletePost(postId);

// 댓글 작성
await client.boards.createComment(postId, {
  content: '댓글 내용',
  parent_id: null, // 대댓글이면 부모 댓글 ID
});

// 댓글 수정
await client.boards.updateComment(commentId, {
  content: '수정된 댓글',
});

// 댓글 삭제
await client.boards.deleteComment(commentId);
```

### Blog (블로그) - Public

```typescript
// 블로그 글 목록
const { data: posts, meta } = await client.blog.list({
  page: 1,
  per_page: 10,
  category: 'news', // optional
  tag: 'featured',  // optional
  search: '검색어', // optional
});
// Returns: ListResponse<BlogPost>

// 블로그 글 상세
const post = await client.blog.get('post-slug');
// Returns: BlogPost

// 추천 글
const featured = await client.blog.featured(5);
// Returns: BlogPost[] (always an array)

// 카테고리별 조회
const { data: newsPosts } = await client.blog.byCategory('news');

// 태그별 조회
const { data: taggedPosts } = await client.blog.byTag('featured');

// 카테고리 목록
const categories = await client.blog.categories();
// Returns: string[] (always an array)

// 태그 목록
const tags = await client.blog.tags();
// Returns: string[] (always an array)
```

### Shop (쇼핑)

#### Public (로그인 불필요)

```typescript
// 상품 목록
const { data: products, meta } = await client.shop.listProducts({
  page: 1,
  per_page: 10,
  category: 'electronics', // optional
  is_featured: true,       // optional
  search: '검색어',        // optional
});
// Returns: ListResponse<Product>

// 상품 상세
const product = await client.shop.getProduct('product-slug');
// Returns: Product

// 추천 상품
const featured = await client.shop.featuredProducts(8);
// Returns: Product[] (always an array)

// 카테고리 목록
const categories = await client.shop.listCategories();
// Returns: ProductCategory[] (always an array)
```

#### Protected (로그인 필요)

```typescript
// 장바구니 조회
const cart = await client.shop.getCart();
// Returns: Cart

// 장바구니 추가
await client.shop.addToCart({
  product_id: 1,
  quantity: 2,
  variant_id: 10, // optional - 옵션상품인 경우
});

// 장바구니 수량 변경
await client.shop.updateCartItem(itemId, { quantity: 3 });

// 장바구니 삭제
await client.shop.removeFromCart(itemId);

// 장바구니 비우기
await client.shop.clearCart();

// 주문 생성
const order = await client.shop.createOrder({
  orderer_name: '홍길동',
  orderer_email: 'hong@example.com',
  orderer_phone: '010-1234-5678',
  shipping_name: '홍길동',
  shipping_phone: '010-1234-5678',
  shipping_zipcode: '12345',
  shipping_address: '서울시 강남구',
  shipping_address_detail: '101호',
  shipping_memo: '문 앞에 놓아주세요',
  coupon_code: 'SAVE10', // optional
});

// 주문 목록
const { data: orders, meta } = await client.shop.listOrders();
// Returns: ListResponse<Order>

// 주문 상세
const order = await client.shop.getOrder(orderId);
// Returns: Order

// 주문 취소
await client.shop.cancelOrder(orderId);

// 쿠폰 검증
const validation = await client.shop.validateCoupon('SAVE10', 50000);
// Returns: { valid: boolean, discount_amount: number, coupon: Coupon }

// 내 쿠폰 목록
const coupons = await client.shop.myCoupons();
// Returns: Coupon[] (always an array)
```

### Reservation (예약) - NEW in v1.3.0

#### Public (로그인 불필요)

```typescript
// 예약 설정 조회
const settings = await client.reservation.getSettings();
// Returns: ReservationSettings

// 서비스 목록
const services = await client.reservation.listServices();
// Returns: ReservationService[] (always an array)

// 담당자 목록
const staffs = await client.reservation.listStaff();
// Returns: ReservationStaff[] (always an array)

// 특정 서비스의 담당자만 조회
const serviceStaffs = await client.reservation.listStaff(serviceId);

// 예약 가능 날짜 조회
const dates = await client.reservation.getAvailableDates({
  service_id: 1,
  staff_id: 2,        // optional
  start_date: '2026-01-01', // optional
  end_date: '2026-01-31',   // optional
});
// Returns: string[] (YYYY-MM-DD format)

// 예약 가능 시간 슬롯 조회
const slots = await client.reservation.getAvailableSlots({
  service_id: 1,
  date: '2026-01-15',
  staff_id: 2, // optional
});
// Returns: ReservationSlot[]
```

#### Protected (로그인 필요)

```typescript
// 예약 생성
const result = await client.reservation.create({
  service_id: 1,
  staff_id: 2, // optional
  reservation_date: '2026-01-15',
  start_time: '14:00',
  customer_name: '홍길동',
  customer_phone: '010-1234-5678', // optional
  customer_email: 'hong@example.com', // optional
  customer_memo: '요청사항', // optional
});
// Returns: { reservation: Reservation, requires_payment: boolean, deposit: number }

// 내 예약 목록
const { data: reservations, meta } = await client.reservation.list({
  status: 'confirmed', // optional
  upcoming: true,      // optional
  past: false,         // optional
});
// Returns: ListResponse<Reservation>

// 다가오는 예약
const upcoming = await client.reservation.upcoming(5);
// Returns: Reservation[] (always an array)

// 지난 예약
const past = await client.reservation.past(10);
// Returns: Reservation[] (always an array)

// 예약 상세
const reservation = await client.reservation.get('RES-20260115-001');
// Returns: Reservation

// 예약 취소
const cancelled = await client.reservation.cancel('RES-20260115-001', '일정 변경');
// Returns: Reservation
```

### Auth (인증)

```typescript
// 로그인
const response = await client.auth.login({
  email: 'user@example.com',
  password: 'password',
});
// Returns: { member: Member, token: string }
// 토큰은 자동으로 저장됨

// 회원가입
await client.auth.register({
  name: '홍길동',
  email: 'user@example.com',
  password: 'password',
  password_confirmation: 'password',
  phone: '010-1234-5678', // optional
});

// 로그아웃
await client.auth.logout();

// 내 정보 조회
const me = await client.auth.me();
// Returns: Member

// 프로필 수정
await client.auth.updateProfile({
  name: '새이름',
  phone: '010-9999-8888',
});

// 비밀번호 변경
await client.auth.updateProfile({
  current_password: '현재비밀번호',
  password: '새비밀번호',
  password_confirmation: '새비밀번호',
});

// 인증 여부 확인
client.isAuthenticated(); // true or false

// 토큰 직접 설정 (localStorage에서 복원시)
client.setToken('saved-token');

// 토큰 가져오기
const token = client.getToken();
```

#### 소셜 로그인

```typescript
// 소셜 로그인 제공자 목록
const providers = await client.auth.getSocialProviders();
// Returns: SocialProvider[]

// 소셜 로그인 URL 가져오기
const { url } = await client.auth.getSocialAuthUrl('google');
// 해당 URL로 리다이렉트

// 콜백 처리 (리다이렉트 후)
const response = await client.auth.socialCallback('google', code);
// Returns: { member: Member, token: string }
```

### Forms (폼) - Public

```typescript
// 폼 목록
const { data: forms } = await client.forms.list();
// Returns: ListResponse<Form>

// 폼 상세
const form = await client.forms.get('contact');
// Returns: Form (필드 정보 포함)

// 폼 제출 (로그인 불필요)
await client.forms.submit('contact', {
  name: '홍길동',
  email: 'user@example.com',
  message: '문의 내용',
});

// 내 제출 목록 (로그인 필요)
const { data: submissions } = await client.forms.mySubmissions();
// Returns: ListResponse<FormSubmission>
```

### Media (미디어) - Protected

```typescript
// 파일 업로드
const media = await client.media.upload(file); // File or Blob
// Returns: Media

// 여러 파일 업로드
const mediaList = await client.media.uploadMultiple([file1, file2]);
// Returns: Media[]

// 내 미디어 목록
const { data: mediaList, meta } = await client.media.list({
  page: 1,
  per_page: 20,
  type: 'image/jpeg', // optional
});
// Returns: ListResponse<Media>

// 미디어 삭제
await client.media.delete(mediaId);
```

### Entities (커스텀 엔티티) - AI가 생성한 동적 데이터

AI가 MCP를 통해 생성한 커스텀 데이터 구조에 접근합니다.

#### Public

```typescript
// 엔티티 목록 조회
const entities = await client.entities.list();
// Returns: CustomEntity[] (always an array)

// 엔티티 스키마 조회
const schema = await client.entities.getSchema('customer');
// Returns: EntitySchema

// 레코드 목록 조회
const { data: customers, meta } = await client.entities.listRecords('customer', {
  page: 1,
  per_page: 20,
  status: 'active',
});
// Returns: ListResponse<EntityRecord>

// 데이터 필드로 필터링
const { data: vipCustomers } = await client.entities.listRecords('customer', {
  'data.tier': 'vip',
});

// 단일 레코드 조회
const customer = await client.entities.getRecord('customer', 1);
// Returns: EntityRecord
console.log(customer.data.company); // 'ABC Corp'
```

#### Protected (로그인 필요)

```typescript
// 레코드 생성
const newCustomer = await client.entities.createRecord('customer', {
  data: {
    company: 'ABC Corp',
    email: 'contact@abc.com',
    tier: 'standard',
  },
  status: 'active',
});

// 레코드 수정
await client.entities.updateRecord('customer', 1, {
  data: { tier: 'vip' },
});

// 레코드 삭제
await client.entities.deleteRecord('customer', 1);
```

#### TypeScript 타입 지원

```typescript
// 타입이 지정된 엔티티 접근자
interface Customer {
  company: string;
  email: string;
  tier: 'standard' | 'vip';
}

const customers = client.entities.typed<Customer>('customer');

// 타입이 추론됨
const list = await customers.list();
list.data[0].data.company; // string

const record = await customers.get(1);
record.data.tier; // 'standard' | 'vip'

// 생성/수정도 타입 체크
await customers.create({
  company: 'New Corp',
  email: 'new@corp.com',
  tier: 'standard',
});
```

### Site Settings - Public

```typescript
// 테마 설정
const theme = await client.getTheme();
// Returns: { name, colors, fonts }

// 사이트 설정
const settings = await client.getSettings();
// Returns: Record<string, any>
```

## Types

### Common Types

```typescript
// Unified list response type
interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
```

### Resource Types

```typescript
interface Board {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface BoardPost {
  id: number;
  board_id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  views: number;
  is_notice: boolean;
  is_private: boolean;
  comment_count: number;
  attachments?: Media[];
  created_at: string;
}

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
  created_at: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  thumbnail?: string;
  images?: string[];
  status: 'draft' | 'active' | 'inactive';
  is_featured: boolean;
  in_stock?: boolean;
  discount_percent?: number;
  created_at: string;
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
  can_cancel: boolean;
  service: { id: number; name: string; duration: number; } | null;
  staff: { id: number; name: string; avatar: string | null; } | null;
  created_at: string;
}

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
  staffs: Array<{ id: number; name: string; avatar: string | null; }>;
}

interface ReservationSettings {
  timezone: string;
  slot_interval: number;
  min_notice_hours: number;
  max_advance_days: number;
  cancellation_hours: number;
  allow_online_payment: boolean;
  bookable_date_range: { start: string; end: string; };
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

interface CustomEntity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  schema: EntitySchema;
  is_active: boolean;
  created_at: string;
}

interface EntityRecord {
  id: number;
  entity_id: number;
  data: Record<string, any>;
  status: 'active' | 'archived' | 'draft';
  created_at: string;
  updated_at: string;
}
```

## Error Handling

```typescript
import { Promptly, PromptlyError } from '@back23/promptly-sdk';

try {
  await client.auth.login({ email: 'wrong@email.com', password: 'wrong' });
} catch (error) {
  if (error instanceof PromptlyError) {
    console.log(error.message);  // "Invalid credentials"
    console.log(error.status);   // 401
    console.log(error.errors);   // { email: ["Invalid email or password"] }
  }
}
```

## React Example

```tsx
import { useState, useEffect } from 'react';
import { Promptly } from '@back23/promptly-sdk';

const client = new Promptly({
  tenantId: 'demo',
  baseUrl: 'https://promptly.webbyon.com',
});

// 블로그 글 목록 (with pagination)
function BlogList() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    client.blog.list({ page, per_page: 10 })
      .then(({ data, meta }) => {
        setPosts(data);  // Always an array
        setMeta(meta);
      });
  }, [page]);

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}

      {meta && (
        <div>
          Page {meta.current_page} of {meta.last_page}
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= meta.last_page}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// 예약 폼
function ReservationForm() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [dates, setDates] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    client.reservation.listServices().then(setServices);
  }, []);

  useEffect(() => {
    if (selectedService) {
      client.reservation.getAvailableDates({
        service_id: selectedService,
      }).then(setDates);
    }
  }, [selectedService]);

  const handleDateSelect = async (date) => {
    const availableSlots = await client.reservation.getAvailableSlots({
      service_id: selectedService,
      date,
    });
    setSlots(availableSlots);
  };

  return (
    <div>
      <select onChange={e => setSelectedService(Number(e.target.value))}>
        <option>서비스 선택</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div>
        {dates.map(date => (
          <button key={date} onClick={() => handleDateSelect(date)}>
            {date}
          </button>
        ))}
      </div>

      <div>
        {slots.filter(s => s.available).map(slot => (
          <button key={slot.time}>{slot.time}</button>
        ))}
      </div>
    </div>
  );
}
```

## License

MIT
