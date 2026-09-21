/**
 * @file reading-mask.js
 * Reading mask (focus screen) feature: dims the viewport except for a clear
 * horizontal focal slit that tracks the cursor/touch position.
 * Helpful for users with ADHD, autism, or cognitive fatigue to eliminate visual clutter.
 */

/** @type {HTMLElement|null} */
let maskEl = null;

/** @param {MouseEvent|TouchEvent} e */
function updateMaskPosition(e) {
  if (!maskEl) return;
  const y = e.clientY ?? e.touches?.[0]?.clientY ?? window.innerHeight / 2;
  maskEl.style.setProperty('--mask-y', `${y}px`);
}

/**
 * Creates the reading mask and binds mouse/touch listeners.
 * Idempotent — safe to call multiple times.
 */
export function createReadingMask() {
  if (maskEl) return;

  maskEl = document.createElement('div');
  maskEl.id = 'a11y-reading-mask';
  maskEl.setAttribute('aria-hidden', 'true'); // decorative overlay
  maskEl.style.setProperty('--mask-y', `${window.innerHeight / 2}px`);
  document.body.appendChild(maskEl);

  document.addEventListener('mousemove', updateMaskPosition);
  document.addEventListener('touchmove', updateMaskPosition, { passive: true });
}

/**
 * Removes the reading mask and cleans up listeners.
 * Idempotent.
 */
export function destroyReadingMask() {
  if (!maskEl) return;

  document.removeEventListener('mousemove', updateMaskPosition);
  document.removeEventListener('touchmove', updateMaskPosition);

  maskEl.remove();
  maskEl = null;
}
