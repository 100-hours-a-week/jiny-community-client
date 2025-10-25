import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
} from '../../../utils/validation.js';
import { showError, hideError } from '../../../utils/dom.js';

// 회원가입 폼 처리
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const nicknameInput = document.getElementById('nickname');
const submitButton = signupForm.querySelector('button[type="submit"]');

const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const passwordConfirmError = document.getElementById('passwordConfirmError');
const nicknameError = document.getElementById('nicknameError');

// 버튼 색상 변경
function changeButtonColor() {
  submitButton.style.backgroundColor = '#7F6AEE';
}

// 이메일 입력 필드 - blur 또는 Enter 키 입력 시 유효성 검사
emailInput.addEventListener('blur', () => {
  const email = emailInput.value.trim();
  const validation = validateEmail(email);

  if (!validation.valid) {
    showError(emailError, validation.message);
  } else {
    hideError(emailError);
  }
});

emailInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    emailInput.blur();
  }
});

// 비밀번호 입력 필드
passwordInput.addEventListener('blur', () => {
  const password = passwordInput.value;
  const validation = validatePassword(password);

  if (!validation.valid) {
    showError(passwordError, validation.message);
  } else {
    hideError(passwordError);
  }
});

passwordInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    passwordInput.blur();
  }
});

// 비밀번호 확인 입력 필드
passwordConfirmInput.addEventListener('blur', () => {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const validation = validatePasswordConfirm(password, passwordConfirm);

  if (!validation.valid) {
    showError(passwordConfirmError, validation.message);
  } else {
    hideError(passwordConfirmError);
  }
});

passwordConfirmInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    passwordConfirmInput.blur();
  }
});

// 닉네임 입력 필드
nicknameInput.addEventListener('blur', () => {
  const nickname = nicknameInput.value.trim();
  const validation = validateNickname(nickname);

  if (!validation.valid) {
    showError(nicknameError, validation.message);
  } else {
    hideError(nicknameError);
  }
});

nicknameInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    nicknameInput.blur();
  }
});

// 폼 제출 처리
signupForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value.trim();

  // 유효성 검사
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const passwordConfirmValidation = validatePasswordConfirm(
    password,
    passwordConfirm
  );
  const nicknameValidation = validateNickname(nickname);

  // 에러 표시
  if (!emailValidation.valid) {
    showError(emailError, emailValidation.message);
  } else {
    hideError(emailError);
  }

  if (!passwordValidation.valid) {
    showError(passwordError, passwordValidation.message);
  } else {
    hideError(passwordError);
  }

  if (!passwordConfirmValidation.valid) {
    showError(passwordConfirmError, passwordConfirmValidation.message);
  } else {
    hideError(passwordConfirmError);
  }

  if (!nicknameValidation.valid) {
    showError(nicknameError, nicknameValidation.message);
  } else {
    hideError(nicknameError);
  }

  // 유효성 검사 실패 시 중단
  if (
    !emailValidation.valid ||
    !passwordValidation.valid ||
    !passwordConfirmValidation.valid ||
    !nicknameValidation.valid
  ) {
    return;
  }

  // 버튼 비활성화 (중복 클릭 방지)
  submitButton.disabled = true;

  try {
    // TODO: API 호출
    console.log('회원가입 시도:', { email, nickname });

    // 임시: 회원가입 성공 시뮬레이션
    const signupSuccess = true; // TODO: 실제 API 응답으로 대체

    if (signupSuccess) {
      // 유효성 검사 통과 시 버튼 색상 변경
      changeButtonColor();

      // 1초 후 로그인 페이지로 이동
      setTimeout(() => {
        window.location.href = '/pages/login/login.html';
      }, 1000);
    } else {
      throw new Error('signup_failed');
    }
  } catch (error) {
    // 백엔드 에러 코드에 따라 적절한 필드에 메시지 표시
    const errorCode = error.code || error.message || '';

    switch (errorCode) {
      case 'email_already_exists':
        showError(emailError, '이미 존재하는 이메일입니다.');
        break;
      case 'nickname_already_exists':
        showError(nicknameError, '이미 사용 중인 닉네임입니다.');
        break;
      case 'invalid_request':
        showError(emailError, '입력 정보를 확인해주세요.');
        break;
      default:
        // 일반적인 에러
        showError(emailError, '회원가입에 실패했습니다. 다시 시도해주세요.');
    }

    // 버튼 다시 활성화
    submitButton.disabled = false;
  }
});
