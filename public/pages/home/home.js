import { loadLayout } from '../../../utils/layout.js';

// 게시글 목록 로드
async function loadPosts() {
  // TODO: API 호출로 게시글 목록 가져오기
  const postsList = document.getElementById('posts-list');

  // 임시 데이터
  const posts = [];

  if (posts.length === 0) {
    postsList.innerHTML = '<p class="empty-message">아직 게시글이 없습니다.</p>';
  } else {
    // 게시글 렌더링 로직 추가
    postsList.innerHTML = posts
      .map(
        post => `
      <div class="post-card">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
      </div>
    `
      )
      .join('');
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  loadPosts();
});
