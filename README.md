# @webbyon/promptly-sdk

Promptly AI CMS SDK for JavaScript/TypeScript

## Installation

```bash
npm install @webbyon/promptly-sdk
```

## Quick Start

```typescript
import { Promptly } from '@webbyon/promptly-sdk';

const client = new Promptly({
  tenantId: 'demo',
  baseUrl: 'https://promptly.webbyon.com',
});
```

## API Overview

| Resource | Public (No Auth) | Protected (Auth Required) |
|----------|------------------|---------------------------|
| **Boards** | list, get | - |
| **Posts** | listPosts, getPost | createPost, updatePost, deletePost |
| **Comments** | listComments | createComment, updateComment, deleteComment |
| **Blog** | list, get | - |
| **Shop** | listProducts, getProduct, listCategories | getCart, addToCart, listOrders, createOrder |
| **Forms** | list, get, submit | mySubmissions |
| **Auth** | login, register | logout, me, updateProfile |
| **Media** | - | upload, list, delete |
| **Entities** | list, getSchema, listRecords, getRecord | createRecord, updateRecord, deleteRecord |

## API Reference

### Boards (게시판) - Public

```typescript
// 게시판 목록
const boards = await client.boards.list();
// Returns: Board[]

// 게시판 상세
const board = await client.boards.get('first'); // slug or id
// Returns: Board

// 게시판 글 목록
const posts = await client.boards.listPosts('first', {
  page: 1,
  per_page: 10,
  search: '검색어', // optional
});
// Returns: { data: BoardPost[], meta: { current_page, last_page, per_page, total } }

// 글 상세
const post = await client.boards.getPost(1);
// Returns: BoardPost

// 댓글 목록
const comments = await client.boards.listComments(1);
// Returns: BoardComment[]
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
const posts = await client.blog.list({
  page: 1,
  per_page: 10,
  category: 'news', // optional
  tag: 'featured',  // optional
  search: '검색어', // optional
});
// Returns: { data: BlogPost[], meta: {...} }

// 블로그 글 상세
const post = await client.blog.get('post-slug');
// Returns: BlogPost

// 추천 글
const featured = await client.blog.featured(5);
// Returns: BlogPost[]

// 카테고리별 조회
const newsPosts = await client.blog.byCategory('news');

// 태그별 조회
const taggedPosts = await client.blog.byTag('featured');
```

### Shop (쇼핑)

#### Public (로그인 불필요)

```typescript
// 상품 목록
const products = await client.shop.listProducts({
  page: 1,
  per_page: 10,
  category: 'electronics', // optional
  is_featured: true,       // optional
  search: '검색어',        // optional
});
// Returns: { data: Product[], meta: {...} }

// 상품 상세
const product = await client.shop.getProduct('product-slug');
// Returns: Product

// 추천 상품
const featured = await client.shop.featuredProducts(8);
// Returns: Product[]

// 카테고리 목록
const categories = await client.shop.listCategories();
// Returns: ProductCategory[]
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
const orders = await client.shop.listOrders();
// Returns: { data: Order[], meta: {...} }

// 주문 상세
const order = await client.shop.getOrder(orderId);
// Returns: Order

// 주문 취소
await client.shop.cancelOrder(orderId);

// 쿠폰 검증
const validation = await client.shop.validateCoupon('SAVE10', 50000);
// Returns: { valid: boolean, discount_amount: number, coupon: Coupon }
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
const forms = await client.forms.list();
// Returns: Form[]

// 폼 상세
const form = await client.forms.get('contact');
// Returns: Form (필드 정보 포함)

// 폼 제출 (로그인 불필요)
await client.forms.submit('contact', {
  name: '홍길동',
  email: 'user@example.com',
  message: '문의 내용',
});
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
const mediaList = await client.media.list({
  page: 1,
  per_page: 20,
  type: 'image/jpeg', // optional
});
// Returns: { data: Media[], meta: {...} }

// 미디어 삭제
await client.media.delete(mediaId);
```

### Entities (커스텀 엔티티) - AI가 생성한 동적 데이터

AI가 MCP를 통해 생성한 커스텀 데이터 구조에 접근합니다.

#### Public

```typescript
// 엔티티 목록 조회
const entities = await client.entities.list();
// Returns: CustomEntity[]

// 엔티티 스키마 조회
const schema = await client.entities.getSchema('customer');
// Returns: EntitySchema

// 레코드 목록 조회
const customers = await client.entities.listRecords('customer', {
  page: 1,
  per_page: 20,
  status: 'active',
});
// Returns: { data: EntityRecord[], meta: {...} }

// 데이터 필드로 필터링
const vipCustomers = await client.entities.listRecords('customer', {
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

interface BoardComment {
  id: number;
  post_id: number;
  member?: Member;
  parent_id?: number;
  content: string;
  replies?: BoardComment[];
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
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  description?: string;
  content?: string;
  price: number;
  compare_price?: number;
  thumbnail?: string;
  images?: string[];
  status: 'draft' | 'active' | 'inactive';
  is_featured: boolean;
  has_options: boolean;
  variants?: ProductVariant[];
  in_stock?: boolean;
  discount_percent?: number;
  created_at: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  total_quantity: number;
  item_count: number;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  items?: OrderItem[];
  created_at: string;
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

interface Form {
  id: number;
  slug: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  is_active: boolean;
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
}

interface EntitySchema {
  fields: EntityField[];
  display?: {
    title_field?: string;
    list_fields?: string;
  };
}

interface EntityField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect';
  required?: boolean;
  searchable?: boolean;
  default?: any;
  options?: Array<{ value: string; label: string }>;
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
import { Promptly, PromptlyError } from '@webbyon/promptly-sdk';

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
import { Promptly } from '@webbyon/promptly-sdk';

const client = new Promptly({
  tenantId: 'demo',
  baseUrl: 'https://promptly.webbyon.com',
});

// 게시판 글 목록
function BoardPosts({ boardSlug }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.boards.listPosts(boardSlug)
      .then(res => setPosts(res.data))
      .finally(() => setLoading(false));
  }, [boardSlug]);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>제목</th>
          <th>작성자</th>
          <th>조회수</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={post.id}>
            <td>{post.title}</td>
            <td>{post.author}</td>
            <td>{post.views}</td>
            <td>{new Date(post.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 로그인 폼
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.auth.login({ email, password });
      // 로그인 성공 - 리다이렉트 등
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="이메일"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="비밀번호"
      />
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">로그인</button>
    </form>
  );
}

// 상품 목록
function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    client.shop.listProducts({ is_featured: true })
      .then(res => setProducts(res.data));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(product => (
        <div key={product.id} className="border p-4">
          <img src={product.thumbnail} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.price.toLocaleString()}원</p>
          {product.compare_price && (
            <p className="line-through">{product.compare_price.toLocaleString()}원</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## License

MIT
