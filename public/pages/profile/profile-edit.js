import { uploadImage } from '../../../api/image/imageApi.js';
import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from '../../../api/user/userApi.js';
import { renderPageLayout } from '../../../utils/layoutPage.js';

const state = {
  currentUser: null,
  newImageFile: null,
  removeImage: false,
  isSubmitting: false,
};

function validateNickname(nickname) {
  return typeof nickname === 'string' && nickname.length >= 2 && nickname.length <= 10;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 20;
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function hideError(element) {
  element.textContent = '';
  element.classList.remove('show');
}

function setProfilePreview(url) {
  const previewImage = document.getElementById('previewImage');
  previewImage.src = url || '/assets/icon/profile_default.jpg';
}

function bindImageInput() {
  const imageInput = document.getElementById('imageInput');
  const selectImageBtn = document.getElementById('selectImageBtn');
  const removeImageBtn = document.getElementById('removeImageBtn');

  selectImageBtn.addEventListener('click', () => imageInput.click());

  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 파일은 최대 10MB까지 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    state.newImageFile = file;
    state.removeImage = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  removeImageBtn.addEventListener('click', () => {
    state.newImageFile = null;
    state.removeImage = true;
    imageInput.value = '';
    setProfilePreview(null);
  });
}

async function loadInitialData() {
  try {
    state.currentUser = await getCurrentUser();
    if (!state.currentUser) {
      throw new Error('사용자 정보를 불러오지 못했습니다.');
    }

    document.getElementById('nickname').value =
      state.currentUser.nickname ?? '';
    setProfilePreview(state.currentUser.profileImageUrl);
  } catch (error) {
    if (error.status === 401) {
      window.location.href = '/pages/login/login.html';
      return;
    }

    alert(error.message || '사용자 정보를 불러오는 데 실패했습니다.');
    window.location.href = '/pages/profile/profile.html';
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.isSubmitting) return;

  const nicknameInput = document.getElementById('nickname');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');

  const nicknameError = document.getElementById('nicknameError');
  const currentPasswordError = document.getElementById('currentPasswordError');
  const newPasswordError = document.getElementById('newPasswordError');
  const newPasswordConfirmError = document.getElementById(
    'newPasswordConfirmError'
  );

  hideError(nicknameError);
  hideError(currentPasswordError);
  hideError(newPasswordError);
  hideError(newPasswordConfirmError);

  const nickname = nicknameInput.value.trim();
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const newPasswordConfirm = newPasswordConfirmInput.value;

  let isValid = true;

  if (!validateNickname(nickname)) {
    showError(nicknameError, '닉네임은 2자 이상 10자 이하로 입력해주세요.');
    isValid = false;
  }

  const wantsPasswordChange =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    newPasswordConfirm.length > 0;

  if (wantsPasswordChange) {
    if (!currentPassword) {
      showError(currentPasswordError, '현재 비밀번호를 입력해주세요.');
      isValid = false;
    }

    if (!validatePassword(newPassword)) {
      showError(
        newPasswordError,
        '새 비밀번호는 8~20자 영문, 숫자, 특수문자 조합을 권장합니다.'
      );
      isValid = false;
    }

    if (newPassword !== newPasswordConfirm) {
      showError(newPasswordConfirmError, '새 비밀번호가 일치하지 않습니다.');
      isValid = false;
    }
  }

  if (!isValid) {
    return;
  }

  const submitBtn = document.querySelector('#editForm button[type="submit"]');

  try {
    state.isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    const profilePayload = {};

    if (state.currentUser && state.currentUser.nickname !== nickname) {
      profilePayload.nickname = nickname;
    }

    if (state.newImageFile) {
      const uploadResult = await uploadImage({
        file: state.newImageFile,
        type: 'PROFILE',
      });

      if (uploadResult?.imageId !== undefined) {
        profilePayload.profileImageId = uploadResult.imageId;
      }
    } else if (state.removeImage) {
      profilePayload.profileImageId = null;
    }

    if (Object.keys(profilePayload).length > 0) {
      await updateProfile(profilePayload);
    }

    if (wantsPasswordChange) {
      await changePassword({
        currentPassword,
        newPassword,
      });
    }

    alert('프로필이 수정되었습니다.');
    window.location.href = '/pages/profile/profile.html';
  } catch (error) {
    if (error.errors) {
      if (error.errors.nickname) {
        showError(nicknameError, error.errors.nickname);
      }
      if (error.errors.currentPassword) {
        showError(currentPasswordError, error.errors.currentPassword);
      }
      if (error.errors.newPassword) {
        showError(newPasswordError, error.errors.newPassword);
      }
    } else {
      alert(error.message || '프로필 수정에 실패했습니다.');
    }
  } finally {
    state.isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '저장';
    }
  }
}

function initEventListeners() {
  document
    .getElementById('cancelBtn')
    .addEventListener('click', () => history.back());

  document
    .getElementById('editForm')
    .addEventListener('submit', handleSubmit);

  bindImageInput();
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderPageLayout('layout-template');
  await loadInitialData();
  initEventListeners();
});
