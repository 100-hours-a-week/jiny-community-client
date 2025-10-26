import { uploadImage } from '../../../api/image/imageApi.js';
import { updatePost, getPost } from '../../../api/post/postApi.js';
import { openModal } from '../../../utils/layout.js';
import { renderPageLayout } from '../../../utils/layoutPage.js';

let selectedImage = null;
let currentPost = null;
let removeCurrentImage = false;

function getPostIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function validateTitle() {
  const titleInput = document.getElementById('post-title');
  const titleError = document.getElementById('title-error');
  const title = titleInput.value.trim();

  if (title.length < 2) {
    titleInput.classList.add('error');
    titleError.textContent = '제목은 2자 이상 입력해주세요.';
    return false;
  }

  if (title.length > 26) {
    titleInput.classList.add('error');
    titleError.textContent = '제목은 최대 26자까지 입력할 수 있습니다.';
    return false;
  }

  titleInput.classList.remove('error');
  titleError.textContent = '';
  return true;
}

function validateContent() {
  const contentInput = document.getElementById('post-content');
  const contentError = document.getElementById('content-error');
  const content = contentInput.value.trim();

  if (content.length < 2) {
    contentInput.classList.add('error');
    contentError.textContent = '내용은 2자 이상 입력해주세요.';
    return false;
  }

  if (content.length > 10000) {
    contentInput.classList.add('error');
    contentError.textContent = '내용은 최대 10000자까지 입력할 수 있습니다.';
    return false;
  }

  contentInput.classList.remove('error');
  contentError.textContent = '';
  return true;
}

function showCurrentImage(url) {
  const currentImageGroup = document.getElementById('current-image-group');
  const currentImage = document.getElementById('current-image');

  if (url) {
    currentImage.src = url;
    currentImageGroup.style.display = 'block';
  } else {
    currentImageGroup.style.display = 'none';
  }
}

async function loadPostData() {
  const postId = getPostIdFromUrl();

  if (!postId) {
    alert('잘못된 접근입니다.');
    window.location.href = '/pages/home/home.html';
    return;
  }

  try {
    const post = await getPost(postId);
    if (!post) {
      throw new Error('게시글 정보를 불러오지 못했습니다.');
    }

    if (!post.isAuthor) {
      alert('본인이 작성한 게시글만 수정할 수 있습니다.');
      window.location.href = `/pages/post/post-detail.html?id=${postId}`;
      return;
    }

    currentPost = post;

    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');

    titleInput.value = post.title ?? '';
    contentInput.value = post.content ?? '';

    document.getElementById('title-char-count').textContent = `${
      (post.title ?? '').length
    }/26`;

    const firstImageUrl = Array.isArray(post.contentImageUrls)
      ? post.contentImageUrls[0]
      : null;

    showCurrentImage(firstImageUrl);
  } catch (error) {
    console.error('게시글 로드 에러:', error);

    if (error.status === 404) {
      alert('존재하지 않는 게시글입니다.');
      window.location.href = '/pages/home/home.html';
      return;
    }

    alert(error.message || '게시글을 불러오는데 실패했습니다.');
    window.location.href = '/pages/home/home.html';
  }
}

function handleRemoveCurrentImage() {
  removeCurrentImage = true;
  selectedImage = null;
  showCurrentImage(null);
}

function handleImageSelect(e) {
  const file = e.target.files[0];
  const fileLabel = document.querySelector('.file-label');
  const fileName = document.getElementById('file-name');
  const clearBtn = document.getElementById('clear-image-btn');
  const preview = document.getElementById('image-preview');
  const previewImage = document.getElementById('preview-image');

  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 파일은 최대 10MB까지 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    selectedImage = file;
    removeCurrentImage = false;
    fileName.textContent = file.name;
    fileLabel.classList.add('has-file');
    clearBtn.style.display = 'block';

    const reader = new FileReader();
    reader.onload = (event) => {
      previewImage.src = event.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  }
}

function handleClearImage() {
  const fileInput = document.getElementById('post-image');
  const fileLabel = document.querySelector('.file-label');
  const fileName = document.getElementById('file-name');
  const clearBtn = document.getElementById('clear-image-btn');
  const preview = document.getElementById('image-preview');

  fileInput.value = '';
  selectedImage = null;
  fileName.textContent = '이미지를 선택하세요';
  fileLabel.classList.remove('has-file');
  clearBtn.style.display = 'none';
  preview.classList.remove('show');
}

async function handleSubmit(e) {
  e.preventDefault();

  const isTitleValid = validateTitle();
  const isContentValid = validateContent();

  if (!isTitleValid || !isContentValid) {
    return;
  }

  const postId = getPostIdFromUrl();
  if (!postId) {
    alert('잘못된 접근입니다.');
    return;
  }

  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const submitBtn = document.getElementById('submit-btn');

  const payload = {};

  const trimmedTitle = titleInput.value.trim();
  const trimmedContent = contentInput.value.trim();

  if (!currentPost || trimmedTitle !== (currentPost.title ?? '').trim()) {
    payload.title = trimmedTitle;
  }

  if (!currentPost || trimmedContent !== (currentPost.content ?? '').trim()) {
    payload.content = trimmedContent;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = '수정 중...';

    if (selectedImage) {
      const uploadedImage = await uploadImage({
        file: selectedImage,
        type: 'POST_ORIGINAL',
      });

      if (uploadedImage?.imageId !== undefined) {
        payload.imageIds = [uploadedImage.imageId];
      }
    } else if (removeCurrentImage) {
      payload.imageIds = [];
    }

    if (Object.keys(payload).length === 0) {
      alert('변경된 내용이 없습니다.');
      submitBtn.disabled = false;
      submitBtn.textContent = '수정';
      return;
    }

    await updatePost(postId, payload);

    alert('게시글이 성공적으로 수정되었습니다.');
    window.location.href = `/pages/post/post-detail.html?id=${postId}`;
  } catch (error) {
    alert(error.message || '게시글 수정에 실패했습니다.');
    submitBtn.disabled = false;
    submitBtn.textContent = '수정';
  }
}

function handleCancel() {
  const postId = getPostIdFromUrl();
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');

  const isChanged =
    (currentPost && titleInput.value.trim() !== (currentPost.title ?? '').trim()) ||
    (currentPost && contentInput.value.trim() !== (currentPost.content ?? '').trim()) ||
    selectedImage ||
    removeCurrentImage;

  const redirectToDetail = () => {
    window.location.href = `/pages/post/post-detail.html?id=${postId}`;
  };

  if (isChanged) {
    openModal(
      '수정 취소',
      '수정 중인 내용이 있습니다. 정말로 취소하시겠습니까?',
      () => {
        redirectToDetail();
      },
      {
        confirmText: '확인',
        cancelText: '돌아가기',
      }
    );
  } else {
    redirectToDetail();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderPageLayout('layout-template');
  await loadPostData();

  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const imageInput = document.getElementById('post-image');
  const clearImageBtn = document.getElementById('clear-image-btn');
  const removeCurrentImageBtn = document.getElementById(
    'remove-current-image-btn'
  );
  const form = document.getElementById('post-form');
  const cancelBtn = document.getElementById('cancel-btn');

  titleInput.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('title-char-count').textContent = `${count}/26`;

    if (count > 0) {
      validateTitle();
    }
  });

  titleInput.addEventListener('blur', validateTitle);
  contentInput.addEventListener('blur', validateContent);

  imageInput.addEventListener('change', handleImageSelect);
  clearImageBtn.addEventListener('click', handleClearImage);

  if (removeCurrentImageBtn) {
    removeCurrentImageBtn.addEventListener('click', handleRemoveCurrentImage);
  }

  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', handleCancel);
});
