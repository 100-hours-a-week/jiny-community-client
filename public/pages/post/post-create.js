import { openModal, closeModal } from '../../../utils/layout.js';
import { createPost } from '../../../api/post/postApi.js';
import { uploadImage } from '../../../api/image/imageApi.js';
import { getCurrentUser } from '../../../api/user/userApi.js';
import { renderPageLayout } from '../../../utils/layoutPage.js';

let selectedImage = null;

// 제목 유효성 검사
function validateTitle() {
  const titleInput = document.getElementById('post-title');
  const titleError = document.getElementById('title-error');
  const title = titleInput.value.trim();

  if (!title || title.length < 2) {
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

// 내용 유효성 검사
function validateContent() {
  const contentInput = document.getElementById('post-content');
  const contentError = document.getElementById('content-error');
  const content = contentInput.value.trim();

  if (!content || content.length < 2) {
    contentInput.classList.add('error');
    contentError.textContent = '내용은 2자 이상 입력해주세요.';
    return false;
  }

  contentInput.classList.remove('error');
  contentError.textContent = '';
  return true;
}

// 이미지 파일 선택 핸들러
function handleImageSelect(e) {
  const file = e.target.files[0];
  const fileLabel = document.querySelector('.file-label');
  const fileName = document.getElementById('file-name');
  const clearBtn = document.getElementById('clear-image-btn');
  const preview = document.getElementById('image-preview');
  const previewImage = document.getElementById('preview-image');

  if (file) {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 파일은 최대 10MB까지 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    selectedImage = file;
    fileName.textContent = file.name;
    fileLabel.classList.add('has-file');
    clearBtn.style.display = 'block';

    // 미리보기 표시
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  }
}

// 이미지 삭제 핸들러
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

// 폼 제출 핸들러
async function handleSubmit(e) {
  e.preventDefault();

  // 유효성 검사
  const isTitleValid = validateTitle();
  const isContentValid = validateContent();

  if (!isTitleValid || !isContentValid) {
    return;
  }

  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const submitBtn = document.getElementById('submit-btn');

  const postData = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
  };

  try {
    // 버튼 비활성화
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';

    if (selectedImage) {
      const uploadedImage = await uploadImage({
        file: selectedImage,
        type: 'POST_ORIGINAL',
      });

      if (uploadedImage?.imageId !== undefined) {
        postData.imageIds = [uploadedImage.imageId];
      }
    }

    const result = await createPost(postData);

    if (!result || result.id === undefined) {
      throw new Error('게시글 ID를 확인할 수 없습니다.');
    }

    alert('게시글이 성공적으로 등록되었습니다.');
    window.location.href = `/pages/post/post-detail.html?id=${result.id}`;
  } catch (error) {
    alert(error.message || '게시글 등록에 실패했습니다.');
    submitBtn.disabled = false;
    submitBtn.textContent = '등록';
  }
}

// 취소 핸들러
function handleCancel() {
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');

  // 입력된 내용이 있는지 확인
  if (titleInput.value.trim() || contentInput.value.trim() || selectedImage) {
    openModal(
      '작성 취소',
      '작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?',
      () => {
        closeModal();
        window.location.href = '/pages/home/home.html';
      },
      {
        confirmText: '확인',
        cancelText: '돌아가기',
      }
    );
  } else {
    window.location.href = '/pages/home/home.html';
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await renderPageLayout('layout-template');

  try {
    await getCurrentUser();
  } catch {
    alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
    window.location.href = '/pages/login/login.html';
    return;
  }

  // 이벤트 리스너 등록
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const imageInput = document.getElementById('post-image');
  const clearImageBtn = document.getElementById('clear-image-btn');
  const form = document.getElementById('post-form');
  const cancelBtn = document.getElementById('cancel-btn');

  // 제목 입력 이벤트
  titleInput.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('title-char-count').textContent = `${count}/26`;

    if (count > 0) {
      validateTitle();
    }
  });

  titleInput.addEventListener('blur', validateTitle);

  // 내용 입력 이벤트
  contentInput.addEventListener('blur', validateContent);

  // 이미지 선택 이벤트
  imageInput.addEventListener('change', handleImageSelect);

  // 이미지 삭제 이벤트
  clearImageBtn.addEventListener('click', handleClearImage);

  // 폼 제출 이벤트
  form.addEventListener('submit', handleSubmit);

  // 취소 버튼 이벤트
  cancelBtn.addEventListener('click', handleCancel);
});
