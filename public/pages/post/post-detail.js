import { openModal } from '../../../utils/layout.js';
import { renderPageLayout } from '../../../utils/layoutPage.js';
import { formatCount, formatDate, escapeHtml } from '../../../utils/format.js';
import { getPost, deletePost } from '../../../api/post/postApi.js';
import { addPostLike, removePostLike } from '../../../api/post/postLikeApi.js';
import {
  getComments,
  createComment,
  deleteComment,
  updateComment,
} from '../../../api/comment/commentApi.js';

let currentComments = [];
let isLiked = false;
let editingCommentId = null;

function getPostIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderPost(post) {
  isLiked = Boolean(post.isLiked);

  document.getElementById('post-title').textContent = post.title ?? '게시글';

  const authorImageElement = document.getElementById('author-image');
  const authorNameElement = document.getElementById('author-name');
  authorImageElement.src =
    post.author?.profileImageUrl || '/assets/icon/profile_default.jpg';
  authorNameElement.textContent = post.author?.nickname ?? '익명';

  document.getElementById('post-date').textContent = formatDate(
    post.createdAt,
    true
  );

  const imageContainer = document.getElementById('post-image-container');
  const imageElement = document.getElementById('post-image');
  const firstImageUrl = Array.isArray(post.contentImageUrls)
    ? post.contentImageUrls[0]
    : null;

  if (firstImageUrl) {
    imageElement.src = firstImageUrl;
    imageContainer.classList.add('show');
  } else {
    imageElement.src = '';
    imageContainer.classList.remove('show');
  }

  const contentElement = document.getElementById('post-content');
  contentElement.innerHTML = (post.content || '')
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

  document.getElementById('likes-count').textContent = formatCount(
    post.likeCount
  );
  document.getElementById('views-count').textContent = formatCount(
    post.viewCount
  );
  document.getElementById('comments-count').textContent = formatCount(
    post.commentCount
  );

  const likeBtn = document.getElementById('like-btn');
  likeBtn.classList.toggle('liked', isLiked);

  const actionsElement = document.getElementById('post-actions');
  actionsElement.style.display = post.isAuthor ? 'flex' : 'none';
}

function buildCommentHtml(comment) {
  const safeContent = comment.isDeleted
    ? '삭제된 댓글입니다.'
    : escapeHtml(comment.content ?? '');

  const authorNickname = comment.author?.nickname ?? '익명';
  const authorImage =
    comment.author?.profileImageUrl || '/assets/icon/profile_default.jpg';

  const actionButtons =
    comment.isAuthor && !comment.isDeleted
      ? `
        <button class="comment__action-btn comment__edit-btn" data-comment-id="${comment.id}">수정</button>
        <button class="comment__action-btn comment__delete-btn" data-comment-id="${comment.id}">삭제</button>
      `
      : '';

  return `
    <div class="comment" data-comment-id="${comment.id}">
      <img
        src="${authorImage}"
        alt="프로필 이미지"
        class="comment__author-image"
      />
      <div class="comment__content-wrapper">
        <div class="comment__header">
          <div class="comment__author-info">
            <span class="comment__author-name">${escapeHtml(
              authorNickname
            )}</span>
            <span class="comment__date">${formatDate(
              comment.createdAt,
              true
            )}</span>
          </div>
          <div class="comment__actions">
            ${actionButtons}
          </div>
        </div>
        <div class="comment__body" id="comment-content-${comment.id}">
          ${comment.isDeleted ? `<p class="comment__deleted">${safeContent}</p>` : `<p>${safeContent}</p>`}
        </div>
      </div>
    </div>
  `;
}

function renderComments(comments, totalCount) {
  currentComments = comments;
  const commentsList = document.getElementById('comments-list');
  const commentsEmpty = document.getElementById('comments-empty');
  const commentCountLabel = document.getElementById('comment-count-label');

  const count = totalCount ?? comments.length ?? 0;
  commentCountLabel.textContent = count;

  if (!comments.length) {
    commentsEmpty.classList.add('show');
    commentsList.innerHTML = '';
    return;
  }

  commentsEmpty.classList.remove('show');
  commentsList.innerHTML = comments.map(buildCommentHtml).join('');

  // 등록 버튼 이벤트 바인딩
  commentsList
    .querySelectorAll('.comment__edit-btn')
    .forEach((btn) => btn.addEventListener('click', handleEditComment));

  commentsList
    .querySelectorAll('.comment__delete-btn')
    .forEach((btn) => btn.addEventListener('click', handleDeleteComment));
}

async function refreshPost() {
  const postId = getPostIdFromUrl();
  if (!postId) return;

  try {
    const post = await getPost(postId);
    renderPost(post);
  } catch (error) {
    console.error('게시글 갱신 실패:', error);
  }
}

async function loadComments() {
  const postId = getPostIdFromUrl();
  if (!postId) return;

  try {
    const result = await getComments(postId, { limit: 20 });
    const comments = result?.comments ?? [];
    renderComments(comments, result?.count);
    document.getElementById('comments-count').textContent = formatCount(
      result?.count ?? comments.length
    );
  } catch (error) {
    console.error('댓글 목록 로드 에러:', error);
    renderComments([], 0);
  }
}

async function handleSubmitComment(event) {
  event.preventDefault();
  const textarea = document.getElementById('comment-textarea');
  const contents = textarea.value.trim();

  if (!contents) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  const postId = getPostIdFromUrl();
  if (!postId) return;

  try {
    await createComment(postId, { contents });
    textarea.value = '';
    const charCount = document.getElementById('char-count');
    if (charCount) {
      charCount.textContent = '0/1000';
    }
    await Promise.all([loadComments(), refreshPost()]);
  } catch (error) {
    alert(error.message || '댓글 작성에 실패했습니다.');
  }
}

function resetEditingComment(commentId, originalContent) {
  const contentElement = document.getElementById(`comment-content-${commentId}`);
  if (contentElement) {
    contentElement.innerHTML = `<p>${escapeHtml(originalContent)}</p>`;
  }
  editingCommentId = null;
}

async function handleEditComment(event) {
  const commentId = event.target.dataset.commentId;
  const comment = currentComments.find((item) => String(item.id) === commentId);

  if (!comment || comment.isDeleted) return;

  if (editingCommentId && editingCommentId !== commentId) {
    const previous = currentComments.find(
      (item) => String(item.id) === editingCommentId
    );
    if (previous) {
      resetEditingComment(editingCommentId, previous.content ?? '');
    }
  }

  const contentElement = document.getElementById(`comment-content-${commentId}`);
  const originalContent = comment.content ?? '';

  contentElement.innerHTML = `
    <textarea class="comment-form__textarea" id="edit-textarea-${commentId}" rows="3" maxlength="1000">${escapeHtml(
      originalContent
    )}</textarea>
    <div class="comment-form__footer">
      <button class="btn btn--outline" id="cancel-edit-${commentId}">취소</button>
      <button class="btn btn--primary" id="save-edit-${commentId}">저장</button>
    </div>
  `;

  editingCommentId = commentId;

  document
    .getElementById(`cancel-edit-${commentId}`)
    .addEventListener('click', () => {
      resetEditingComment(commentId, originalContent);
    });

  document
    .getElementById(`save-edit-${commentId}`)
    .addEventListener('click', async () => {
      const newContent = document
        .getElementById(`edit-textarea-${commentId}`)
        .value.trim();

      if (!newContent) {
        alert('댓글 내용을 입력해주세요.');
        return;
      }

      try {
        await updateComment(commentId, { contents: newContent });
        editingCommentId = null;
        await loadComments();
      } catch (error) {
        alert(error.message || '댓글 수정에 실패했습니다.');
      }
    });
}

function handleDeleteComment(event) {
  const commentId = event.target.dataset.commentId;

  openModal(
    '댓글 삭제',
    '정말로 이 댓글을 삭제하시겠습니까?',
    async () => {
      try {
        await deleteComment(commentId);
        await Promise.all([loadComments(), refreshPost()]);
      } catch (error) {
        alert(error.message || '댓글 삭제에 실패했습니다.');
      }
    },
    {
      confirmText: '삭제',
      cancelText: '취소',
      confirmColor: 'var(--color-danger)',
    }
  );
}

async function handleTogglePostLike() {
  const postId = getPostIdFromUrl();
  if (!postId) return;

  const wasLiked = isLiked;

  try {
    let result;
    if (wasLiked) {
      result = await removePostLike(postId);
    } else {
      result = await addPostLike(postId);
    }

    // 좋아요 API 응답 데이터로 UI 업데이트 (조회수 증가 방지)
    if (result && result.postId !== undefined) {
      // API 응답에 데이터가 있는 경우 (좋아요 추가)
      isLiked = Boolean(result.isLiked);

      const likeCountElement = document.getElementById('likes-count');
      if (likeCountElement && result.likeCount !== undefined) {
        likeCountElement.textContent = formatCount(result.likeCount);
      }

      const likeBtn = document.getElementById('like-btn');
      if (likeBtn) {
        likeBtn.classList.toggle('liked', isLiked);
      }
    } else if (result === null && wasLiked) {
      // 좋아요 제거 시 응답이 null인 경우 수동 업데이트
      isLiked = false;

      const likeCountElement = document.getElementById('likes-count');
      if (likeCountElement) {
        const currentCount = parseInt(likeCountElement.textContent.replace(/,/g, '')) || 0;
        const newCount = Math.max(0, currentCount - 1);
        likeCountElement.textContent = formatCount(newCount);
      }

      const likeBtn = document.getElementById('like-btn');
      if (likeBtn) {
        likeBtn.classList.remove('liked');
      }
    }
  } catch (error) {
    console.error('게시글 좋아요 토글 에러:', error);
    alert(error.message || '좋아요 처리에 실패했습니다.');
  }
}

function handleEditPost() {
  const postId = getPostIdFromUrl();
  if (!postId) return;
  window.location.href = `/pages/post/post-edit.html?id=${postId}`;
}

function handleDeletePost() {
  const postId = getPostIdFromUrl();
  if (!postId) return;

  openModal(
    '게시글 삭제',
    '정말로 이 게시글을 삭제하시겠습니까?',
    async () => {
      try {
        await deletePost(postId);
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/pages/home/home.html';
      } catch (error) {
        alert(error.message || '게시글 삭제에 실패했습니다.');
      }
    },
    {
      confirmText: '삭제',
      cancelText: '취소',
      confirmColor: 'var(--color-danger)',
    }
  );
}

async function loadPost() {
  const postId = getPostIdFromUrl();

  if (!postId) {
    alert('잘못된 접근입니다.');
    window.location.href = '/pages/home/home.html';
    return;
  }

  try {
    const post = await getPost(postId);
    renderPost(post);
    await loadComments();
  } catch (error) {
    console.error('게시글 로드 에러:', error);

    if (error.status === 404) {
      alert('존재하지 않는 게시글입니다.');
    } else if (error.status === 401) {
      alert('로그인이 필요합니다.');
    } else {
      alert(error.message || '게시글을 불러오는데 실패했습니다.');
    }

    window.location.href = '/pages/home/home.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderPageLayout('layout-template');
  await loadPost();

  document
    .getElementById('like-btn')
    .addEventListener('click', handleTogglePostLike);
  document
    .getElementById('edit-post-btn')
    .addEventListener('click', handleEditPost);
  document
    .getElementById('delete-post-btn')
    .addEventListener('click', handleDeletePost);
  document
    .getElementById('comment-form')
    .addEventListener('submit', handleSubmitComment);

  const commentTextarea = document.getElementById('comment-textarea');
  commentTextarea.addEventListener('input', (event) => {
    const count = event.target.value.length;
    const charCount = document.getElementById('char-count');
    if (charCount) {
      charCount.textContent = `${count}/1000`;
    }
  });
});
