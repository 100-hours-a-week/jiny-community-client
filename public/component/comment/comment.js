/**
 * 댓글 컴포넌트 생성 함수
 * @param {Object} commentData - 댓글 데이터 객체
 * @param {string} commentData.id - 댓글 ID
 * @param {string} commentData.author - 작성자 닉네임
 * @param {string} commentData.profileImage - 프로필 이미지 경로 (선택적, 기본값: /assets/icon/profile_default.jpg)
 * @param {string} commentData.content - 댓글 내용
 * @param {string} commentData.createdAt - 작성 시간 (ISO 형식 또는 표시 형식)
 * @param {boolean} commentData.isAuthor - 현재 사용자가 작성자인지 여부 (수정/삭제 버튼 표시)
 * @param {Function} commentData.onEdit - 수정 버튼 클릭 핸들러 (선택적)
 * @param {Function} commentData.onDelete - 삭제 버튼 클릭 핸들러 (선택적)
 * @returns {HTMLElement} 생성된 댓글 DOM 엘리먼트
 */
export function createComment(commentData) {
  const {
    id,
    author,
    profileImage = '/assets/icon/profile_default.jpg',
    content,
    createdAt,
    isAuthor = false,
    onEdit = null,
    onDelete = null,
  } = commentData;

  // 댓글 컨테이너 생성
  const commentEl = document.createElement('div');
  commentEl.className = 'comment';
  commentEl.dataset.commentId = id;

  // 작성자 정보 섹션
  const authorEl = document.createElement('div');
  authorEl.className = 'comment__author';

  const profileImg = document.createElement('img');
  profileImg.src = profileImage;
  profileImg.alt = `${author} 프로필`;

  const metaEl = document.createElement('div');
  metaEl.className = 'comment__meta';

  const nicknameEl = document.createElement('span');
  nicknameEl.className = 'nickname';
  nicknameEl.textContent = author;

  const dateEl = document.createElement('span');
  dateEl.className = 'date';
  dateEl.textContent = formatDate(createdAt);

  metaEl.appendChild(nicknameEl);
  metaEl.appendChild(dateEl);

  authorEl.appendChild(profileImg);
  authorEl.appendChild(metaEl);

  // 댓글 내용
  const contentEl = document.createElement('p');
  contentEl.className = 'comment__content';
  contentEl.textContent = content;

  // 컨테이너에 추가
  commentEl.appendChild(authorEl);
  commentEl.appendChild(contentEl);

  // 작성자인 경우에만 수정/삭제 버튼 표시
  if (isAuthor) {
    const actionsEl = document.createElement('div');
    actionsEl.className = 'comment__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--outline';
    editBtn.textContent = '수정';
    if (onEdit) {
      editBtn.addEventListener('click', () => onEdit(id, content));
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--outline btn--danger';
    deleteBtn.textContent = '삭제';
    if (onDelete) {
      deleteBtn.addEventListener('click', () => onDelete(id));
    }

    actionsEl.appendChild(editBtn);
    actionsEl.appendChild(deleteBtn);

    commentEl.appendChild(actionsEl);
  }

  return commentEl;
}

/**
 * 날짜 포맷팅 함수
 * @param {string|Date} date - 날짜 객체 또는 ISO 문자열
 * @returns {string} 포맷팅된 날짜 문자열 (YYYY-MM-DD HH:mm:ss)
 */
function formatDate(date) {
  // 이미 포맷팅된 문자열이면 그대로 반환
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    return date;
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 댓글 목록 렌더링 함수
 * @param {HTMLElement} container - 댓글을 렌더링할 컨테이너 엘리먼트
 * @param {Array<Object>} comments - 댓글 데이터 배열
 */
export function renderComments(container, comments) {
  // 기존 댓글 제거
  container.innerHTML = '';

  // 댓글이 없는 경우
  if (!comments || comments.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = '첫 댓글을 작성해보세요!';
    container.appendChild(emptyMessage);
    return;
  }

  // 각 댓글 렌더링
  comments.forEach((comment) => {
    const commentEl = createComment(comment);
    container.appendChild(commentEl);
  });
}
