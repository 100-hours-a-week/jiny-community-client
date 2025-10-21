import { deleteAccount, getUserInfo } from '../../../api/user/userApi.js';
import { loadLayout, openModal } from '../../../utils/layout.js';

// 프로필 정보 로드
async function loadProfile() {
  // TODO: API 호출로 실제 사용자 정보 가져오기
  const userInfo = {
    email: 'user@example.com',
    nickname: '사용자 닉네임',
    joinDate: '2025-01-15',
    profileImage: '/assets/icon/profile_default.jpg',
  };

  document.getElementById('userEmail').textContent = userInfo.email;
  document.getElementById('userNickname').textContent = userInfo.nickname;
  document.getElementById('joinDate').textContent = userInfo.joinDate;
  document.getElementById('profileImage').src = userInfo.profileImage;
}

// 회원 탈퇴 처리
async function handleDeleteAccount() {
  try {
    await deleteAccount();

    alert('회원 탈퇴가 완료되었습니다.');

    // 로컬 스토리지 정리
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 로그인 페이지로 리다이렉트
    window.location.href = '/pages/login/login.html';
  } catch (error) {
    alert(error.message || '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
  }
}

// 이벤트 리스너 등록
function initEventListeners() {
  // 이미지 변경 버튼
  document.getElementById('imageChangeBtn').addEventListener('click', () => {
    // TODO: 이미지 업로드 기능 구현
    alert('이미지 변경 기능은 추후 구현 예정입니다.');
  });

  // 로그아웃 버튼
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      // TODO: 로그아웃 API 호출
      localStorage.removeItem('token');
      window.location.href = '/pages/login/login.html';
    }
  });

  // 회원 탈퇴 버튼
  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    const warningMessage = `
      정말로 탈퇴하시겠습니까?<br>작성한 게시물과 댓글은 삭제됩니다.
    `;

    openModal('회원 탈퇴', warningMessage, handleDeleteAccount, {
      confirmText: '확인',
    });
  });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  loadProfile();
  initEventListeners();
});
