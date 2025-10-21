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
      let errorMessage = '회원 탈퇴에 실패했습니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    localStorage.removeItem('token');
    return result;
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
      let errorMessage = '사용자 정보 조회에 실패했습니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('사용자 정보 조회 API 에러:', error);
    throw error;
  }
}
