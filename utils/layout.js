/**
 * 전역 레이아웃 로더
 * Header, Footer, Modal 컴포넌트를 동적으로 로드
 */

/**
 * Header 컴포넌트 로드
 */
export async function loadHeader() {
  try {
    const container = document.getElementById('header-container');
    if (!container) return;

    const response = await fetch('/component/header/header.html');
    if (!response.ok) throw new Error('Failed to load header');

    const html = await response.text();
    container.innerHTML = html;

    // 헤더 이벤트 리스너 초기화
    const { initHeaderEvents } = await import(
      '/component/header/header.js'
    );
    initHeaderEvents();
  } catch (error) {
    console.error('Failed to load header:', error);
  }
}

/**
 * Footer 컴포넌트 로드
 */
export async function loadFooter() {
  try {
    const container = document.getElementById('footer-container');
    if (!container) return;

    const response = await fetch('/component/footer/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load footer:', error);
  }
}

/**
 * Modal 컴포넌트 로드
 */
export async function loadModal() {
  try {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const response = await fetch('/component/modal/modal.html');
    if (!response.ok) throw new Error('Failed to load modal');

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load modal:', error);
  }
}

/**
 * 모든 레이아웃 컴포넌트 로드
 */
export async function loadLayout() {
  await Promise.all([loadHeader(), loadFooter(), loadModal()]);
}

/**
 * 모달 열기 유틸리티
 * @param {string} title - 모달 제목
 * @param {string} description - 모달 설명 (HTML 지원)
 * @param {Function} onConfirm - 확인 버튼 클릭 시 콜백
 * @param {Object} options - 추가 옵션
 */
export function openModal(title, description, onConfirm, options = {}) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');

  if (!modalOverlay || !modalTitle || !modalDesc || !confirmBtn || !cancelBtn) {
    console.error('Modal elements not found');
    return;
  }

  modalTitle.textContent = title;
  modalDesc.innerHTML = description;

  // 옵션 적용
  if (options.confirmText) {
    confirmBtn.textContent = options.confirmText;
  } else {
    confirmBtn.textContent = '확인';
  }

  if (options.confirmColor) {
    confirmBtn.style.background = options.confirmColor;
  } else {
    confirmBtn.style.background = '';
  }

  if (options.titleClass) {
    modalTitle.className = `modal__title ${options.titleClass}`;
  } else {
    modalTitle.className = 'modal__title';
  }

  if (options.descClass) {
    modalDesc.className = `modal__desc ${options.descClass}`;
  } else {
    modalDesc.className = 'modal__desc';
  }

  modalOverlay.removeAttribute('hidden');

  // 기존 이벤트 리스너 제거를 위해 복제
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  // 새 이벤트 리스너 등록
  newConfirmBtn.addEventListener('click', () => {
    if (onConfirm) onConfirm();
    closeModal();
  });

  newCancelBtn.addEventListener('click', closeModal);

  // 모달 배경 클릭 시 닫기
  const handleOverlayClick = e => {
    if (e.target.id === 'modal-overlay') {
      closeModal();
      modalOverlay.removeEventListener('click', handleOverlayClick);
    }
  };

  modalOverlay.addEventListener('click', handleOverlayClick);
}

/**
 * 모달 닫기 유틸리티
 */
export function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.setAttribute('hidden', '');
  }
}
