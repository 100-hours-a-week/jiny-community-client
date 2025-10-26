import { logout } from '../../../api/auth/authApi.js';
import {
  deleteCurrentUser,
  getCurrentUser,
} from '../../../api/user/userApi.js';
import { formatDate } from '../../../utils/format.js';
import { openModal } from '../../../utils/layout.js';
import { renderPageLayout } from '../../../utils/layoutPage.js';

let currentUser = null;

async function loadProfile() {
  try {
    currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error('사용자 정보를 불러오지 못했습니다.');
    }

    document.getElementById('userEmail').textContent =
      currentUser.email ?? '';
    document.getElementById('userNickname').textContent =
      currentUser.nickname ?? '';

    const joinedAt =
      currentUser.joinedAt || currentUser.createdAt || currentUser.updatedAt;
    document.getElementById('joinDate').textContent = joinedAt
      ? formatDate(joinedAt, true)
      : '-';

    document.getElementById('profileImage').src =
      currentUser.profileImageUrl || '/assets/icon/profile_default.jpg';
  } catch (error) {
    console.error('프로필 정보를 불러오지 못했습니다.', error);

    if (error.status === 401) {
      window.location.href = '/pages/login/login.html';
      return;
    }

    alert(error.message || '사용자 정보를 불러오는 데 실패했습니다.');
  }
}

async function handleDeleteAccount() {
  try {
    await deleteCurrentUser();
    await logout();
    alert('회원 탈퇴가 완료되었습니다.');
    window.location.href = '/pages/login/login.html';
  } catch (error) {
    alert(error.message || '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    console.error('로그아웃 실패:', error);
  } finally {
    window.location.href = '/pages/login/login.html';
  }
}

function initEventListeners() {
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    window.location.href = '/pages/profile/profile-edit.html';
  });

  document.getElementById('imageChangeBtn').addEventListener('click', () => {
    window.location.href = '/pages/profile/profile-edit.html';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    openModal(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      handleLogout,
      { confirmText: '로그아웃' }
    );
  });

  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    openModal(
      '회원 탈퇴',
      '정말로 탈퇴하시겠습니까?\n작성한 게시물과 댓글은 삭제됩니다.',
      handleDeleteAccount,
      {
        confirmText: '탈퇴',
        confirmColor: 'var(--color-danger)',
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderPageLayout('layout-template');
  await loadProfile();
  initEventListeners();
});
