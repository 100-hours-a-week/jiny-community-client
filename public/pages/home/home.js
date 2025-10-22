import { loadLayout } from '../../../utils/layout.js';

// 게시글 목록 로드
async function loadPosts() {
  // TODO: API 호출로 게시글 목록 가져오기
  const postsList = document.getElementById('posts-list');
  if (!postsList) return;

  // 임시 데이터
  const posts = [];

  if (posts.length === 0) {
    postsList.innerHTML =
      '<p class="empty-message">아직 게시글이 없습니다.</p>';
  } else {
    // 게시글 렌더링 로직 추가
    postsList.innerHTML = posts
      .map(
        post => `
      <div class="post-card">
        <h3 class="post-title"></h3>
        <p class="post-content"></p>
      </div>
    `
      )
      .join('');

    const postCards = postsList.querySelectorAll('.post-card');
    posts.forEach((post, index) => {
      postCards[index].querySelector('.post-title').textContent = post.title;
      postCards[index].querySelector('.post-content').textContent =
        post.content;
    });
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  loadPosts();
});
