import { formatCount, formatDate, truncateText } from '../../../utils/format.js';

/**
 * 게시글 카드 생성 함수
 * @param {Object} postData - 게시글 데이터
 * @param {string|number} postData.id - 게시글 ID
 * @param {string} postData.title - 게시글 제목
 * @param {string|Date} postData.createdAt - 작성일
 * @param {number} [postData.likesCount] - 좋아요 수
 * @param {number} [postData.commentsCount] - 댓글 수
 * @param {number} [postData.viewsCount] - 조회수
 * @param {Object} [postData.author] - 작성자 정보
 * @param {string} [postData.author.nickname] - 작성자 닉네임
 * @param {string} [postData.author.profileImage] - 작성자 프로필 이미지
 * @returns {HTMLElement} 게시글 카드 엘리먼트
 */
export function createPostCard(postData) {
  const article = document.createElement('article');
  article.className = 'post-card';
  article.dataset.postId = postData.id;
  article.tabIndex = 0;

  // 클릭 시 상세 페이지로 이동
  article.style.cursor = 'pointer';
  article.addEventListener('click', () => {
    window.location.href = `/pages/post/post-detail.html?id=${postData.id}`;
  });
  article.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = `/pages/post/post-detail.html?id=${postData.id}`;
    }
  });

  // 헤더 (제목 + 날짜)
  const header = document.createElement('div');
  header.className = 'post-card__header';

  const title = document.createElement('h3');
  title.className = 'post-card__title';
  title.textContent = postData.title;

  const date = document.createElement('span');
  date.className = 'post-card__date';
  date.textContent = formatDate(postData.createdAt, true);

  header.appendChild(title);
  header.appendChild(date);

  // 미리보기 내용
  const excerptText = truncateText(postData.content ?? '', 140);
  const excerpt = document.createElement('p');
  excerpt.className = 'post-card__excerpt';
  excerpt.textContent = excerptText || '아직 소개글이 작성되지 않은 게시글입니다.';

  // 메타 정보 (좋아요, 댓글, 조회수)
  const stats = document.createElement('div');
  stats.className = 'post-card__stats';

  const statItems = [
    { label: '좋아요', value: formatCount(postData.likeCount ?? postData.likesCount ?? 0), icon: '❤️' },
    { label: '댓글', value: formatCount(postData.commentCount ?? postData.commentsCount ?? 0), icon: '💬' },
    { label: '조회', value: formatCount(postData.viewCount ?? postData.viewsCount ?? 0), icon: '👁️' },
  ];

  statItems.forEach(({ label, value, icon }) => {
    const stat = document.createElement('span');
    stat.className = 'post-card__stat';
    stat.innerHTML = `<span class="post-card__stat-icon" aria-hidden="true">${icon}</span>${label} <strong>${value}</strong>`;
    stats.appendChild(stat);
  });

  // 작성자 정보
  const author = document.createElement('div');
  author.className = 'post-card__author';

  const authorImage = document.createElement('img');
  authorImage.src =
    postData.author?.profileImage || '/assets/icon/profile_default.jpg';
  authorImage.alt = '작성자';

  const nickname = document.createElement('span');
  nickname.className = 'nickname';
  nickname.textContent = postData.author?.nickname || '익명';

  author.appendChild(authorImage);
  author.appendChild(nickname);

  // 모든 요소 조합
  article.appendChild(header);
  article.appendChild(excerpt);
  article.appendChild(author);
  article.appendChild(stats);

  return article;
}

/**
 * 게시글 카드 목록 렌더링 함수
 * @param {HTMLElement} container - 게시글 카드를 렌더링할 컨테이너
 * @param {Array} posts - 게시글 데이터 배열
 */
export function renderPostCards(container, posts) {
  if (!container) {
    console.error('Container element not found');
    return;
  }

  container.classList.add('posts-grid');

  container.innerHTML = '';

  if (!posts || posts.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'post-card post-card--empty';
    emptyMessage.innerHTML = '<span>🗒️</span> 아직 게시글이 없습니다. 첫 번째 이야기를 들려주세요!';
    container.appendChild(emptyMessage);
    return;
  }

  // 각 게시글 카드 생성 및 추가
  posts.forEach((post) => {
    const postCard = createPostCard(post);
    container.appendChild(postCard);
  });
}
