/**
 * @file icons.js
 * SVG icon strings used in the accessibility menu.
 * All icons are aria-hidden since their parent buttons carry accessible labels.
 */

const ICON_STYLE = 'width:18px;height:18px;vertical-align:middle;margin-right:8px;flex-shrink:0';

/** Accessibility figure icon — used on the floating trigger button */
export const ICON_A11Y = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="4" r="1" fill="currentColor" />
  <path d="M12 8v7" />
  <path d="M6 10c3-1 9-1 12 0" />
  <path d="m9 20 3-5 3 5" />
</svg>`;

/** ✕ icon — close button */
export const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;

/** Half-circle — high contrast toggle */
export const ICON_CONTRAST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 3v18M12 3a9 9 0 0 1 0 18"/>
</svg>`;

/** Circle with cross — grayscale toggle */
export const ICON_GRAYSCALE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <circle cx="12" cy="12" r="9"/>
  <path d="M9 12h6M12 9v6"/>
</svg>`;

/** Chain link — highlight links toggle */
export const ICON_LINK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>`;

/** T baseline — dyslexia font toggle */
export const ICON_DYSLEXIA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <polyline points="4 7 4 4 20 4 20 7"/>
  <line x1="9" y1="20" x2="15" y2="20"/>
  <line x1="12" y1="4" x2="12" y2="20"/>
</svg>`;

/** Three lines — reading guide toggle */
export const ICON_GUIDE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <line x1="3" y1="12" x2="21" y2="12"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <line x1="3" y1="18" x2="21" y2="18"/>
</svg>`;

/** Play triangle — reduce motion toggle */
export const ICON_MOTION = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="${ICON_STYLE}">
  <path d="M5 3l14 9-14 9V3z"/>
</svg>`;

/** Circular arrow — reset button */
export const ICON_RESET = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;vertical-align:middle;margin-right:6px" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
</svg>`;

/** Moon — dark mode toggle */
export const ICON_DARK_MODE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${ICON_STYLE}">
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
</svg>`;
