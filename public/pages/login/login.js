// 로그인 폼 처리
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const submitButton = loginForm.querySelector('button[type="submit"]');

// 이메일 유효성 검사
function validateEmail(email) {
  // 빈 값 체크
  if (!email) {
    return {
      valid: false,
      message: '이메일을 입력해주세요.',
    };
  }

  // 이메일 형식 체크 (정규식)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: '올바른 이메일 형식이 아닙니다.',
    };
  }

  return { valid: true };
}

// 비밀번호 유효성 검사: 8-20자, 대소문자/숫자/특수문자 각 1개 이상
function validatePassword(password) {
  // 빈 값 체크
  if (!password) {
    return {
      valid: false,
      message: '비밀번호를 입력해주세요.',
    };
  }

  // 길이 체크
  if (password.length < 8 || password.length > 20) {
    return {
      valid: false,
      message:
        '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
    };
  }

  // 문자 종류 체크
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      message:
        '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
    };
  }

  return { valid: true };
}

// 에러 메시지 표시
function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

// 에러 메시지 숨기기
function hideError(element) {
  element.textContent = '';
  element.classList.remove('show');
}

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
    emailInput.blur(); // blur 이벤트 트리거
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

// 폼 제출 처리
loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // 유효성 검사
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

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

  // 유효성 검사 실패 시 중단
  if (!emailValidation.valid || !passwordValidation.valid) {
    return;
  }

  // 버튼 비활성화 (중복 클릭 방지)
  submitButton.disabled = true;

  // TODO: API 호출
  console.log('로그인 시도:', { email, password });

  // 임시: 로그인 성공 시뮬레이션
  const loginSuccess = true; // TODO: 실제 API 응답으로 대체

  if (loginSuccess) {
    // 유효성 검사 통과 시 버튼 색상 변경
    changeButtonColor();

    // 3초 후 페이지 이동
    setTimeout(() => {
      // TODO: 백엔드 연동 후 post 목록 페이지로 이동
      window.location.href = '/pages/home/home.html';
    }, 3000);
  } else {
    // 로그인 실패 시
    showError(passwordError, '아이디 또는 비밀번호를 확인해주세요');
    submitButton.disabled = false;
  }
});
