/**
 * SDK v2.4.0 Test
 * Run: node test-sdk.mjs
 */

import { Promptly } from './dist/index.mjs';

const client = new Promptly({
  tenantId: 'demo',
  apiKey: 'pky_zX1JITGIZefP9Fm2oBF9qk7oekwNmlqJ7uRfBXznbRi3P9kAfq2CM6hiBX8B',
  baseUrl: 'https://promptly.webbyon.com',
});

console.log('🧪 SDK v2.4.0 Test\n');

// 1. Boards
try {
  const { data: boards } = await client.boards.list();
  console.log('✅ boards.list():', boards.length, 'boards');
  if (boards[0]) {
    console.log('   - Board:', boards[0].name, '| is_active:', boards[0].is_active);
  }
} catch (e) {
  console.log('❌ boards.list():', e.message);
}

// 2. Board Posts (목록에 author 포함 확인)
try {
  const { data: posts, meta } = await client.boards.listPosts('first', { per_page: 3 });
  console.log('✅ boards.listPosts():', posts.length, 'posts, total:', meta.total);
  if (posts[0]) {
    console.log('   - Post:', posts[0].title, '| author:', posts[0].author, '| views:', posts[0].views);
  }
} catch (e) {
  console.log('❌ boards.listPosts():', e.message);
}

// 3. Blog
try {
  const { data: posts } = await client.blog.list({ per_page: 3 });
  console.log('✅ blog.list():', posts.length, 'posts');
  if (posts[0]) {
    console.log('   - Blog:', posts[0].title, '| author:', posts[0].author, '| status:', posts[0].status);
  }
} catch (e) {
  console.log('❌ blog.list():', e.message);
}

// 4. 로그인 테스트
console.log('\n--- 로그인 테스트 ---');
try {
  const authResult = await client.auth.login({
    email: 'hong@test.com',
    password: 'password123'
  });
  console.log('✅ auth.login():', authResult.user.name, '| token:', authResult.token.substring(0, 20) + '...');
} catch (e) {
  console.log('❌ auth.login():', e.message);
}

// 5. 게시글 작성 (로그인 상태)
console.log('\n--- 게시글 작성 테스트 ---');
try {
  const newPost = await client.boards.createPost({
    board_id: 1,
    title: 'SDK v2.4.0 테스트 게시글',
    content: 'SDK에서 작성한 게시글입니다. author가 홍길동으로 표시되어야 합니다.'
  });
  console.log('✅ boards.createPost():', newPost.title, '| author:', newPost.author);
} catch (e) {
  console.log('❌ boards.createPost():', e.message);
}

// 6. 댓글 작성 (로그인 상태)
console.log('\n--- 댓글 작성 테스트 ---');
try {
  const { data: posts } = await client.boards.listPosts('first', { per_page: 1 });
  if (posts[0]) {
    const comment = await client.comments.createBoardPost(posts[0].id, {
      content: 'SDK v2.4.0에서 작성한 댓글입니다.'
    });
    console.log('✅ comments.createBoardPost():', comment.author.name, '| is_member:', comment.author.is_member);
  }
} catch (e) {
  console.log('❌ comments.createBoardPost():', e.message);
}

// 7. 댓글 목록 조회
try {
  const { data: posts } = await client.boards.listPosts('first', { per_page: 1 });
  if (posts[0]) {
    const comments = await client.boards.listComments(posts[0].id);
    console.log('✅ boards.listComments():', comments.length, 'comments');
    if (comments[0]) {
      console.log('   - Comment by:', comments[0].author.name, '| is_member:', comments[0].author.is_member);
    }
  }
} catch (e) {
  console.log('❌ boards.listComments():', e.message);
}

// 8. Products
try {
  const { data: products } = await client.shop.listProducts({ per_page: 3 });
  console.log('✅ shop.listProducts():', products.length, 'products');
} catch (e) {
  console.log('❌ shop.listProducts():', e.message);
}

console.log('\n✨ Done!');
