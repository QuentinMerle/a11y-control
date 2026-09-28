/**
 * @file styles.js
 * Shadow DOM stylesheet and global style injection.
 *
 * Global classes applied to <html> by the component:
 *   .a11y-high-contrast   — black bg, white text, yellow links
 *   .a11y-grayscale       — grayscale filter
 *   .a11y-dyslexia        — OpenDyslexic font
 *   .a11y-reduce-motion   — disables animations/transitions
 *   .a11y-highlight-links — bold + outline on all <a>
 *
 * Global element injected into <body>:
 *   #a11y-reading-guide   — the reading guide bar
 */

// ── IDs for globally injected nodes (prevents double-injection) ────────────────
export const GLOBAL_CSS_ID   = 'a11y-global-styles';
export const DYSLEXIC_FONT_ID = 'a11y-dyslexic-font';

// ── Shadow DOM stylesheet (scoped, never leaks) ────────────────────────────────
export const SHADOW_CSS = `
  :host {
    --a11y-accent:        #005fcc;
    --a11y-accent-hover:  #0047a3;
    --a11y-bg:            #ffffff;
    --a11y-surface:       #f5f5f5;
    --a11y-border:        #d0d0d0;
    --a11y-text:          #1a1a1a;
    --a11y-text-muted:    #555555;
    --a11y-radius:        12px;
    --a11y-shadow:        0 8px 32px rgba(0,0,0,.18);
    --a11y-font:          system-ui, -apple-system, sans-serif;
    --a11y-transition:    0.22s cubic-bezier(.4,0,.2,1);
    --a11y-trigger-size:  52px;
    font-family: var(--a11y-font);
  }

  :host([data-a11y-theme="dark"]) {
    --a11y-bg:            #1a1a1a;
    --a11y-surface:       #2a2a2a;
    --a11y-border:        #3a3a3a;
    --a11y-text:          #f5f5f5;
    --a11y-text-muted:    #a0a0a0;
  }

  /* ── Floating trigger button ─────────────────────────────────────────────── */
  #trigger {
    position: fixed;
    z-index: 999998;
    width: var(--a11y-trigger-size, 52px);
    height: var(--a11y-trigger-size, 52px);
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--a11y-accent);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--a11y-shadow);
    transition: background var(--a11y-transition), transform var(--a11y-transition);
    padding: 0;
  }
  #trigger:hover          { background: var(--a11y-accent-hover); transform: scale(1.08); }
  #trigger:focus-visible  { outline: 3px solid var(--a11y-accent); outline-offset: 3px; }
  #trigger[aria-expanded="true"] {
    transform: scale(0.95);
    opacity: 0.9;
    box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.35);
  }
  #trigger svg            { width: 26px; height: 26px; pointer-events: none; }

  /* Position variants (controlled via the [position] attribute on the host) */
  :host([position="bottom-right"]) #trigger,
  :host(:not([position])) #trigger  { bottom: 24px; right: 24px; }
  :host([position="bottom-left"])  #trigger { bottom: 24px; left: 24px; }
  :host([position="top-right"])    #trigger { top: 24px; right: 24px; }
  :host([position="top-left"])     #trigger { top: 24px; left: 24px; }

  /* ── Click-outside backdrop ──────────────────────────────────────────────── */
  #overlay {
    position: fixed;
    inset: 0;
    z-index: 999998;
    background: rgba(0,0,0,.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--a11y-transition);
  }
  #overlay.open { opacity: 1; pointer-events: auto; }

  /* ── Slide-in panel ──────────────────────────────────────────────────────── */
  #panel {
    position: fixed;
    z-index: 999999;
    bottom: 90px;
    right: 24px;
    width: min(360px, calc(100vw - 32px));
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
    background: var(--a11y-bg);
    border-radius: var(--a11y-radius);
    box-shadow: var(--a11y-shadow);
    border: 1px solid var(--a11y-border);
    transform: translateY(16px) scale(.97);
    opacity: 0;
    pointer-events: none;
    transition: transform var(--a11y-transition), opacity var(--a11y-transition);
    overscroll-behavior: contain;
  }
  #panel::-webkit-scrollbar {
    width: 5px;
  }
  #panel::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 999px;
  }
  #panel::-webkit-scrollbar-track {
    background: transparent;
  }
  :host([position="bottom-left"]) #panel { right: auto; left: 24px; }
  :host([position="top-right"])   #panel { bottom: auto; top: 90px; }
  :host([position="top-left"])    #panel { bottom: auto; top: 90px; right: auto; left: 24px; }

  @media (max-width: 480px) {
    :host([position="bottom-right"]) #trigger,
    :host(:not([position])) #trigger  { bottom: 16px; right: 16px; }
    :host([position="bottom-left"])  #trigger { bottom: 16px; left: 16px; }
    :host([position="top-right"])    #trigger { top: 16px; right: 16px; }
    :host([position="top-left"])     #trigger { top: 16px; left: 16px; }

    #panel,
    :host([position="bottom-left"]) #panel,
    :host([position="top-right"]) #panel,
    :host([position="top-left"]) #panel {
      left: 12px;
      right: 12px;
      width: auto;
      max-width: calc(100vw - 24px);
      bottom: 76px;
      top: auto;
      max-height: calc(100vh - 92px);
    }
  }

  #panel.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    pointer-events: auto;
  }

  /* ── Sticky panel header ─────────────────────────────────────────────────── */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--a11y-border);
    position: sticky;
    top: 0;
    background: var(--a11y-bg);
    z-index: 1;
    border-radius: var(--a11y-radius) var(--a11y-radius) 0 0;
  }
  .panel-header h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--a11y-text);
    letter-spacing: .01em;
  }
  #close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--a11y-text-muted);
    border-radius: 8px;
    padding: 6px;
    display: flex;
    align-items: center;
    transition: background var(--a11y-transition), color var(--a11y-transition);
  }
  #close-btn:hover        { background: var(--a11y-surface); color: var(--a11y-text); }
  #close-btn:focus-visible { outline: 3px solid var(--a11y-accent); outline-offset: 2px; }
  #close-btn svg          { width: 18px; height: 18px; }

  /* ── Controls container ──────────────────────────────────────────────────── */
  .controls {
    padding: 8px 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  /* Small uppercase section dividers — semantic h3 styled */
  .section-label {
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--a11y-text-muted);
    padding: 8px 4px 2px;
    margin: 0;
  }

  /* ── Font size stepper row ───────────────────────────────────────────────── */
  .font-size-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    background: var(--a11y-surface);
    border-radius: 10px;
  }
  .font-size-row > span:first-child {
    flex: 1;
    font-size: .9rem;
    font-weight: 500;
    color: var(--a11y-text);
  }
  .scale-display {
    min-width: 40px;
    text-align: center;
    font-size: .82rem;
    font-weight: 700;
    color: var(--a11y-accent);
    flex: 0 0 auto;
  }
  .step-btn {
    background: var(--a11y-bg);
    border: 1.5px solid var(--a11y-border);
    color: var(--a11y-text);
    border-radius: 8px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--a11y-transition), border-color var(--a11y-transition), transform 0.1s ease;
    flex-shrink: 0;
    user-select: none;
  }
  .step-btn:hover:not([aria-disabled="true"])  { background: var(--a11y-surface); border-color: var(--a11y-accent); }
  .step-btn:active:not([aria-disabled="true"]) { transform: scale(0.94); }
  .step-btn:focus-visible { outline: 3px solid var(--a11y-accent); outline-offset: 2px; }
  .step-btn[aria-disabled="true"] { opacity: .38; cursor: default; }

  /* ── Toggle switch rows ──────────────────────────────────────────────────── */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background var(--a11y-transition);
    user-select: none;
  }
  .toggle-row:hover { background: var(--a11y-surface); }
  .toggle-sublabel {
    font-size: .75rem;
    color: var(--a11y-text-muted);
    padding: 0 10px 4px;
    margin-top: -4px;
    line-height: 1.35;
  }
  .toggle-row label {
    font-size: .88rem;
    font-weight: 500;
    color: var(--a11y-text);
    cursor: pointer;
    flex: 1;
    /* pointer-events must stay on so the for= link to the input works */
    display: flex;
    align-items: center;
  }

  /* Custom pill toggle (styled <input type="checkbox" role="switch">) */
  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  }
  .toggle-switch input {
    /* Invisible but covers the full visual toggle area so it's clickable */
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    margin: 0;
    z-index: 2;
  }
  .toggle-track {
    position: absolute;
    inset: 0;
    background: #e2e8f0;
    border: 1.5px solid #94a3b8;
    border-radius: 999px;
    transition: background var(--a11y-transition), border-color var(--a11y-transition);
    pointer-events: none;
    box-sizing: border-box;
  }
  :host([data-a11y-theme="dark"]) .toggle-track {
    background: #1e293b;
    border-color: #64748b;
  }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.1);
    transition: transform var(--a11y-transition), box-shadow var(--a11y-transition);
    pointer-events: none;
    transform: translateX(0);
  }
  .toggle-switch input:checked ~ .toggle-track {
    background: var(--a11y-accent);
    border-color: var(--a11y-accent);
  }
  .toggle-switch input:checked ~ .toggle-thumb {
    transform: translateX(20px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  }
  .toggle-switch input:focus-visible ~ .toggle-track {
    outline: 3px solid var(--a11y-accent);
    outline-offset: 2px;
  }

  /* ── Voice console controls ── */
  .voice-console {
    background: var(--a11y-surface);
    border-radius: 10px;
    padding: 10px 12px;
    margin: 4px 0 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid var(--a11y-border);
  }
  .voice-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .voice-field label {
    font-size: .75rem;
    font-weight: 700;
    color: var(--a11y-text-muted);
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .voice-select {
    width: 100%;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1.5px solid var(--a11y-border);
    background: var(--a11y-bg);
    color: var(--a11y-text);
    font-size: .82rem;
    font-family: inherit;
    cursor: pointer;
  }
  .voice-select:focus-visible {
    outline: 3px solid var(--a11y-accent);
    outline-offset: 2px;
  }
  .voice-rate-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .voice-rate-label {
    font-size: .75rem;
    font-weight: 700;
    color: var(--a11y-text-muted);
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  .rate-pills {
    display: flex;
    gap: 4px;
  }
  .rate-pill {
    background: var(--a11y-bg);
    border: 1.5px solid var(--a11y-border);
    color: var(--a11y-text);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: .75rem;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--a11y-transition), border-color var(--a11y-transition);
  }
  .rate-pill:hover {
    background: var(--a11y-surface);
  }
  .rate-pill.active {
    background: var(--a11y-accent);
    border-color: var(--a11y-accent);
    color: #ffffff;
  }
  .voice-test-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1.5px solid var(--a11y-accent);
    background: var(--a11y-bg);
    color: var(--a11y-accent);
    font-size: .78rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 2px;
    transition: background var(--a11y-transition), color var(--a11y-transition);
  }
  .voice-test-btn:hover {
    background: var(--a11y-accent);
    color: #ffffff;
  }

  /* ── Reset button ────────────────────────────────────────────────────────── */
  .reset-row  { margin: 8px 0 4px; }
  #reset-btn {
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: 1.5px solid var(--a11y-border);
    border-radius: 10px;
    color: var(--a11y-text-muted);
    font-size: .88rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--a11y-transition), border-color var(--a11y-transition), color var(--a11y-transition);
  }
  #reset-btn:hover        { background: var(--a11y-surface); border-color: #b00020; color: #b00020; }
  #reset-btn:focus-visible { outline: 3px solid var(--a11y-accent); outline-offset: 2px; }

  /* ── Custom scrollbar (Chromium) ─────────────────────────────────────────── */
  #panel::-webkit-scrollbar       { width: 6px; }
  #panel::-webkit-scrollbar-track { background: transparent; }
  #panel::-webkit-scrollbar-thumb { background: var(--a11y-border); border-radius: 99px; }
`;

// ── Global stylesheet injected once into <head> ────────────────────────────────
export const GLOBAL_CSS = `
  /* Accessibility Menu — classes applied to <html> */

  /* High Contrast — Clean targeted approach (no universal * selector) */
  html.a11y-high-contrast,
  html.a11y-high-contrast body,
  html.a11y-high-contrast main,
  html.a11y-high-contrast section,
  html.a11y-high-contrast header,
  html.a11y-high-contrast footer,
  html.a11y-high-contrast article,
  html.a11y-high-contrast div,
  html.a11y-high-contrast p,
  html.a11y-high-contrast h1,
  html.a11y-high-contrast h2,
  html.a11y-high-contrast h3,
  html.a11y-high-contrast h4,
  html.a11y-high-contrast span,
  html.a11y-high-contrast li {
    background-color: #000 !important;
    color: #fff !important;
    background-image: none !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  html.a11y-high-contrast a { 
    color: #ffff00 !important; 
    text-decoration: underline !important; 
    background-color: transparent !important;
  }
  
  html.a11y-high-contrast img,
  html.a11y-high-contrast video,
  html.a11y-high-contrast picture { 
    filter: brightness(.8) contrast(1.5) !important;
    border: 1px solid #fff !important;
  }

  html.a11y-high-contrast button,
  html.a11y-high-contrast input,
  html.a11y-high-contrast select,
  html.a11y-high-contrast textarea { 
    background-color: #000 !important; 
    color: #fff !important; 
    border: 2px solid #fff !important; 
    border-radius: 0 !important;
  }

  /* Ensure the component itself stays usable but follows high contrast */
  html.a11y-high-contrast accessibility-menu::part(panel) {
    border: 2px solid #fff !important;
  }

  html.a11y-grayscale { filter: grayscale(100%); }

  html.a11y-dyslexia,
  html.a11y-dyslexia * {
    font-family: 'OpenDyslexic', 'Comic Sans MS', 'Comic Sans', 'Lexend', 'Verdana', Arial, sans-serif !important;
    letter-spacing: .05em !important;
    word-spacing: .2em !important;
    line-height: 1.7 !important;
  }

  html.a11y-reduce-motion *,
  html.a11y-reduce-motion *::before,
  html.a11y-reduce-motion *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  html.a11y-highlight-links a {
    text-decoration: underline !important;
    font-weight: 700 !important;
    outline: 2px solid currentColor !important;
    outline-offset: 2px !important;
  }

  /* Dark mode - basic implementation that devs can override */
  html.a11y-dark-mode {
    background-color: #121212 !important;
    color: #e0e0e0 !important;
  }
  html.a11y-dark-mode body {
    background-color: #121212 !important;
    color: #e0e0e0 !important;
  }

  /* Text Spacing — WCAG 1.4.12 */
  html.a11y-text-spacing *,
  html.a11y-text-spacing *::before,
  html.a11y-text-spacing *::after {
    line-height: 1.6 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  html.a11y-text-spacing p {
    margin-bottom: 1.8em !important;
  }

  /* Align text left / un-justify — WCAG 1.4.8 */
  html.a11y-align-left,
  html.a11y-align-left * {
    text-align: left !important;
    hyphens: none !important;
  }

  /* Big high-contrast cursor (PNG 32x32 with white border, 100% universal browser support) */
  html.a11y-big-cursor,
  html.a11y-big-cursor * {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAc0lEQVR4nO3W4QoAEAyFUe//0uMHJY1Rdq+07wHslDRJSomZ1KiA5qACaIgeQEGMADhCA0ARMwAMsQJAEBbAHbEDcEXsAtwQJwAXxCngOsJ6hlrXhmsA+G7QBkIRs3UMQ6zuFYKwDqb/FwLxJII2PIqiL8ucPli29M/2VQAAAABJRU5ErkJggg==") 0 0, auto !important;
  }
  html.a11y-big-cursor a,
  html.a11y-big-cursor a *,
  html.a11y-big-cursor button,
  html.a11y-big-cursor button *,
  html.a11y-big-cursor [role="button"],
  html.a11y-big-cursor [role="button"] *,
  html.a11y-big-cursor input[type="submit"],
  html.a11y-big-cursor input[type="button"] {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeUlEQVR4nO3W0QnAIAxF0Wzahd3J9kNBJBoF856U3AHMAZEo+UuY5RIVIE/iISqAhmgBFEQPgCM0ABQxAsAQMwAEYQHcESsAV8QqwA2xA3BB7AKOI6xnqHVsuAaA7wZtIBQxWscwxOxeIQjrYPp/IRBXImjDoyj6ZS+vwtSEfr3UawAAAABJRU5ErkJggg==") 0 0, pointer !important;
  }

  /* Reading guide bar */
  #a11y-reading-guide {
    position: fixed;
    left: 0;
    width: 100%;
    height: 40px;
    background: rgba(255,255,0,.25);
    border-top: 2px solid rgba(180,140,0,.55);
    border-bottom: 2px solid rgba(180,140,0,.55);
    pointer-events: none;
    z-index: 999997;
    top: 0;
    transition: top .06s linear;
  }

  /* Reading mask overlay */
  #a11y-reading-mask {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 999996;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.65) 0%,
      rgba(0, 0, 0, 0.65) calc(var(--mask-y, 50vh) - 38px),
      transparent calc(var(--mask-y, 50vh) - 38px),
      transparent calc(var(--mask-y, 50vh) + 38px),
      rgba(0, 0, 0, 0.65) calc(var(--mask-y, 50vh) + 38px),
      rgba(0, 0, 0, 0.65) 100%
    );
    transition: background 0.04s ease-out;
  }
`;

/**
 * Injects the global stylesheet into <head> once.
 * Safe to call multiple times (idempotent).
 */
export function injectGlobalStyles() {
  if (document.getElementById(GLOBAL_CSS_ID)) return;
  const style = document.createElement('style');
  style.id = GLOBAL_CSS_ID;
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

let _customDyslexicFontUrl = null;

/**
 * Configure an optional self-hosted font stylesheet URL for OpenDyslexic.
 * By default, null: uses local/system font-stack (100% CSP safe and zero tracking).
 * @param {string|null} url
 */
export function setDyslexicFontUrl(url) {
  _customDyslexicFontUrl = url;
}

/**
 * Lazily loads the OpenDyslexic webfont only if a custom URL was provided.
 */
export function loadOpenDyslexicFont() {
  if (!_customDyslexicFontUrl || document.getElementById(DYSLEXIC_FONT_ID)) return;
  const link = document.createElement('link');
  link.id   = DYSLEXIC_FONT_ID;
  link.rel  = 'stylesheet';
  link.href = _customDyslexicFontUrl;
  document.head.appendChild(link);
}
