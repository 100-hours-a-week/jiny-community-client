import API_CONFIG from '../api-config.js';

/**
 * 회원 탈퇴 API
 * @returns {Promise<Object>} 탈퇴 결과
 */
export async function deleteAccount() {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('회원 탈퇴 API 에러:', error);
    throw error;
  }
}

/**
 * 사용자 정보 조회 API
 * @returns {Promise<Object>} 사용자 정보
 */
export async function getUserInfo() {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '사용자 정보 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('사용자 정보 조회 API 에러:', error);
    throw error;
  }
}
