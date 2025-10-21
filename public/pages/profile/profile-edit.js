import { loadLayout } from '../../../utils/layout.js';

// 유효성 검사 함수
function validateNickname(nickname) {
  return nickname.length >= 2 && nickname.length <= 20;
}

function validatePassword(password) {
  return password.length >= 8;
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function hideError(element) {
  element.textContent = '';
  element.classList.remove('show');
}

// 이벤트 리스너 및 초기화
function initEventListeners() {
  // DOM 요소
  const editForm = document.getElementById('editForm');
  const imageInput = document.getElementById('imageInput');
  const previewImage = document.getElementById('previewImage');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const nicknameInput = document.getElementById('nickname');
  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const newPasswordConfirmInput = document.getElementById('newPasswordConfirm');

  const nicknameError = document.getElementById('nicknameError');
  const currentPasswordError = document.getElementById('currentPasswordError');
  const newPasswordError = document.getElementById('newPasswordError');
  const newPasswordConfirmError = document.getElementById('newPasswordConfirmError');

  // 취소 버튼
  cancelBtn.addEventListener('click', () => {
    history.back();
  });

  // 이미지 미리보기
  imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      // TODO: 이미지 파일 타입 검증 추가 필요
      // - 허용 타입: image/jpeg, image/png, image/gif, image/webp 등
      // - 비이미지 파일(PDF, 실행 파일 등) 업로드 방지
      // - 파일 크기 제한 추가 (예: 5MB)
      // 예시: if (!file.type.startsWith('image/')) { showError(...); return; }

      const reader = new FileReader();
      reader.onload = e => {
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // 이미지 제거
  removeImageBtn.addEventListener('click', () => {
    previewImage.src = '/assets/icon/profile_default.jpg';
    imageInput.value = '';
  });

  // 폼 제출
  editForm.addEventListener('submit', async e => {
    e.preventDefault();

    // 에러 메시지 초기화
    hideError(nicknameError);
    hideError(currentPasswordError);
    hideError(newPasswordError);
    hideError(newPasswordConfirmError);

    const nickname = nicknameInput.value.trim();
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const newPasswordConfirm = newPasswordConfirmInput.value;

    let isValid = true;

    // 닉네임 검증
    if (!nickname) {
      showError(nicknameError, '닉네임을 입력해주세요.');
      isValid = false;
    } else if (!validateNickname(nickname)) {
      showError(nicknameError, '닉네임은 2자 이상 20자 이하여야 합니다.');
      isValid = false;
    }

    // 비밀번호 변경하는 경우에만 검증
    if (currentPassword || newPassword || newPasswordConfirm) {
      if (!currentPassword) {
        showError(currentPasswordError, '현재 비밀번호를 입력해주세요.');
        isValid = false;
      }

      if (!newPassword) {
        showError(newPasswordError, '새 비밀번호를 입력해주세요.');
        isValid = false;
      } else if (!validatePassword(newPassword)) {
        showError(newPasswordError, '비밀번호는 8자 이상이어야 합니다.');
        isValid = false;
      }

      if (!newPasswordConfirm) {
        showError(newPasswordConfirmError, '새 비밀번호 확인을 입력해주세요.');
        isValid = false;
      } else if (newPassword !== newPasswordConfirm) {
        showError(newPasswordConfirmError, '비밀번호가 일치하지 않습니다.');
        isValid = false;
      }
    }

    if (!isValid) return;

    // TODO: 프로필 이미지 API 구현 후 추가 필요
    // 현재는 닉네임과 비밀번호만 전송
    //
    // 이미지 업로드 구현 시 주의사항:
    // 1. FormData 사용하여 파일 전송
    //    예: const formData = new FormData();
    //        formData.append('nickname', nickname);
    //        formData.append('profileImage', imageInput.files[0]);
    //
    // 2. Content-Type을 'multipart/form-data'로 설정 (fetch 사용 시 자동)
    //
    // 3. 이미지 파일 포함 여부 확인
    //    예: if (imageInput.files[0]) { formData.append('profileImage', imageInput.files[0]); }

    const updateData = {
      nickname,
    };

    if (currentPassword && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    console.log('프로필 수정 데이터:', updateData);

    // 임시: 수정 완료 후 프로필 페이지로 이동
    alert('프로필 수정 기능은 백엔드 연동 후 구현됩니다.');
    // window.location.href = '/pages/profile/profile.html';
  });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  initEventListeners();
  // TODO: 현재 사용자 정보 로드하여 폼에 채우기
});
