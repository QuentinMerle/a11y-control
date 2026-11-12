/**
 * @file reading-guide.js
 * Reading guide feature: a horizontal highlight bar that follows the cursor.
 * The guide helps users with tracking issues (e.g. dyslexia) stay on a line.
 *
 * The bar is rendered in the main document (not inside Shadow DOM) so it
 * overlays all page content, including images, iframes, etc.
 */

/** @type {HTMLElement|null} */
let guideEl = null;
let ticking = false;

/** @param {MouseEvent|TouchEvent} e */
function updatePosition(e) {
  if (!ticking) {
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    requestAnimationFrame(() => {
      if (guideEl) {
        guideEl.style.transform = `translate3d(0, ${y - 20}px, 0)`;
      }
      ticking = false;
    });
    ticking = true;
  }
}

/**
 * Creates the reading guide bar and attaches mouse/touch listeners.
 * Idempotent — safe to call multiple times.
 */
export function createReadingGuide() {
  if (guideEl) return;

  guideEl = document.createElement('div');
  guideEl.id = 'a11y-reading-guide';
  guideEl.setAttribute('aria-hidden', 'true'); // decorative, not announced
  document.body.appendChild(guideEl);

  document.addEventListener('mousemove', updatePosition, { passive: true });
  document.addEventListener('touchmove', updatePosition, { passive: true });
}

/**
 * Removes the reading guide bar and cleans up event listeners.
 * Idempotent — safe to call when the guide isn't active.
 */
export function destroyReadingGuide() {
  if (!guideEl) return;

  document.removeEventListener('mousemove', updatePosition);
  document.removeEventListener('touchmove', updatePosition);

  guideEl.remove();
  guideEl = null;
  ticking = false;
}
