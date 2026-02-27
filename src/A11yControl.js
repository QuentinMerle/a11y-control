/**
 * @file A11yControl.js
 * The A11yControl Custom Element class.
 *
 * Responsibilities:
 *  - Manage user preferences (load/save via localStorage)
 *  - Render the Shadow DOM panel
 *  - Apply preference effects to the host document
 *  - Handle keyboard navigation and focus trap
 *  - Expose a clean, branded API
 */

import { STORAGE_KEY, DEFAULT_PREFS, I18N }   from './constants.js';
import { SHADOW_CSS, injectGlobalStyles, loadOpenDyslexicFont } from './styles.js';
import { createReadingGuide, destroyReadingGuide }               from './reading-guide.js';
import {
  ICON_A11Y, ICON_CLOSE,
  ICON_CONTRAST, ICON_GRAYSCALE, ICON_LINK,
  ICON_DYSLEXIA, ICON_GUIDE, ICON_MOTION, ICON_RESET, ICON_DARK_MODE
} from './icons.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** CSS selector that matches all keyboard-focusable elements. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Returns all focusable elements inside a given root (Shadow DOM or document). */
function getFocusable(root) {
  return [...root.querySelectorAll(FOCUSABLE_SELECTOR)];
}

// ── A11yControl ──────────────────────────────────────────────────────────

export class A11yControl extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'position'];
  }

  constructor() {
    super();
    /** @type {typeof DEFAULT_PREFS} */
    this._prefs = { ...DEFAULT_PREFS };
    this._isOpen = false;
    this._boundKeydown = this._onKeydown.bind(this);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  connectedCallback() {
    injectGlobalStyles();
    this._loadPrefs();
    this._applyAllPrefs();
    this._render(); // also calls _bindEvents() at the end — do NOT call it again here
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._boundKeydown);
    destroyReadingGuide();
  }

  /** Re-render when lang changes; position is purely CSS-driven via :host([position]). */
  attributeChangedCallback(name) {
    if (name === 'lang' && this.shadowRoot) {
      this._render();
    }
  }

  // ── Preferences ─────────────────────────────────────────────────────────────

  /** Reads saved preferences from localStorage and merges with defaults. */
  _loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        this._prefs = { ...DEFAULT_PREFS, ...saved };
      }
    } catch { /* Ignore parse errors (e.g. private browsing mode) */ }
  }

  /** Persists current preferences to localStorage. */
  _savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._prefs));
    } catch { /* Ignore storage errors */ }
  }

  /**
   * Updates a single preference, saves, and reflects changes in the DOM.
   * @param {keyof typeof DEFAULT_PREFS} key
   * @param {boolean|number} value
   */
  _setPref(key, value) {
    this._prefs[key] = value;
    this._savePrefs();
    this._applyAllPrefs();
    this._updateControls();
  }

  // ── DOM effects ─────────────────────────────────────────────────────────────

  /**
   * Reflects all preferences onto the host document.
   * Called on mount (to restore saved state) and after every change.
   */
  _applyAllPrefs() {
    const { fontScale, highContrast, grayscale, dyslexiaFont, reduceMotion, highlightLinks, readingGuide, darkMode } = this._prefs;
    const html = document.documentElement;

    // Font scale — sets root font-size (respects user's browser base size)
    html.style.fontSize = fontScale === 1 ? '' : `${fontScale * 100}%`;

    html.classList.toggle('a11y-high-contrast',   highContrast);
    html.classList.toggle('a11y-grayscale',        grayscale);
    html.classList.toggle('a11y-reduce-motion',    reduceMotion);
    html.classList.toggle('a11y-highlight-links',  highlightLinks);
    html.classList.toggle('a11y-dark-mode',        darkMode);

    // Apply theme to the component itself
    this.setAttribute('data-a11y-theme', darkMode ? 'dark' : 'light');

    if (dyslexiaFont) {
      loadOpenDyslexicFont();
      html.classList.add('a11y-dyslexia');
    } else {
      html.classList.remove('a11y-dyslexia');
    }

    if (readingGuide) createReadingGuide();
    else              destroyReadingGuide();
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  /** (Re-)renders the full Shadow DOM. Replaces innerHTML and re-binds events. */
  _render() {
    const t = I18N[this.getAttribute('lang')] ?? I18N.en;

    // Attach shadow root on first render
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    // Adopt the stylesheet (Constructable Stylesheets API)
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(SHADOW_CSS);
    this.shadowRoot.adoptedStyleSheets = [sheet];

    this.shadowRoot.innerHTML = this._buildHTML(t);
    this._bindEvents();
  }

  /**
   * Returns the full Shadow DOM HTML string.
   * @param {typeof I18N['en']} t - Translations object
   */
  _buildHTML(t) {
    const { fontScale } = this._prefs;

    return /* html */`
      <!-- Floating trigger button -->
      <button
        id="trigger"
        aria-label="${t.triggerLabel}"
        aria-expanded="false"
        aria-haspopup="dialog"
      >${ICON_A11Y}</button>

      <!-- Click-outside backdrop -->
      <div id="overlay" role="presentation"></div>

      <!-- Slide-in panel -->
      <div
        id="panel"
        role="dialog"
        aria-modal="true"
        aria-label="${t.title}"
        tabindex="-1"
      >
        <div class="panel-header">
          <h2>${t.title}</h2>
          <button id="close-btn" aria-label="${t.close}">${ICON_CLOSE}</button>
        </div>

        <div class="controls">

          <!-- Font size section -->
          <p class="section-label">${t.fontSize}</p>
          <div class="font-size-row">
            <span>${t.fontSize}</span>
            <button class="step-btn" id="font-decrease" aria-label="${t.decrease}">−</button>
            <span
              class="scale-display"
              id="font-display"
              aria-live="polite"
              aria-atomic="true"
            >${Math.round(fontScale * 100)}%</span>
            <button class="step-btn" id="font-increase" aria-label="${t.increase}">+</button>
          </div>

          <!-- Display section -->
          <p class="section-label">${t.sectionDisplay}</p>
          ${this._toggleRow('highContrast',   t.highContrast,   ICON_CONTRAST)}
          ${this._toggleRow('grayscale',      t.grayscale,      ICON_GRAYSCALE)}
          ${this._toggleRow('highlightLinks', t.highlightLinks, ICON_LINK)}

          <!-- Reading section -->
          <p class="section-label">${t.sectionReading}</p>
          ${this._toggleRow('dyslexiaFont',  t.dyslexiaFont,  ICON_DYSLEXIA)}
          ${this._toggleRow('readingGuide',  t.readingGuide,  ICON_GUIDE)}
          ${this._toggleRow('reduceMotion',  t.reduceMotion,  ICON_MOTION)}

          <!-- Theme section -->
          <p class="section-label">${t.sectionTheme}</p>
          ${this._toggleRow('darkMode', t.darkMode, ICON_DARK_MODE)}

          <!-- Reset -->
          <div class="reset-row">
            <button id="reset-btn">${ICON_RESET} ${t.resetAll}</button>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Builds the HTML for a single toggle row.
   * @param {string} key    - Preference key
   * @param {string} label  - Display label
   * @param {string} icon   - SVG string
   */
  _toggleRow(key, label, icon) {
    const isChecked = !!this._prefs[key];
    return /* html */`
      <div class="toggle-row">
        <label for="toggle-${key}">${icon}${label}</label>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="toggle-${key}"
            role="switch"
            aria-checked="${isChecked}"
            ${isChecked ? 'checked' : ''}
          />
          <div class="toggle-track" aria-hidden="true"></div>
          <div class="toggle-thumb" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  /** Binds all interactive elements after a render. */
  _bindEvents() {
    const sr = this.shadowRoot;

    // Panel open / close
    sr.getElementById('trigger')?.addEventListener('click',  () => this._togglePanel());
    sr.getElementById('close-btn')?.addEventListener('click', () => this._closePanel());
    sr.getElementById('overlay')?.addEventListener('click',   () => this._closePanel());

    // Font size stepper
    sr.getElementById('font-decrease')?.addEventListener('click', () => {
      const next = Math.max(0.8, Math.round((this._prefs.fontScale - 0.1) * 10) / 10);
      this._setPref('fontScale', next);
    });
    sr.getElementById('font-increase')?.addEventListener('click', () => {
      const next = Math.min(2, Math.round((this._prefs.fontScale + 0.1) * 10) / 10);
      this._setPref('fontScale', next);
    });

    // Toggle switches
    // Checkboxes react to Space natively but NOT Enter. We add Enter support
    // so keyboard users can activate toggles with either key (ARIA best practice
    // for role="switch": both Space and Enter should toggle the state).
    const toggleKeys = ['highContrast', 'grayscale', 'dyslexiaFont', 'reduceMotion', 'highlightLinks', 'readingGuide', 'darkMode'];
    for (const key of toggleKeys) {
      const el = sr.getElementById(`toggle-${key}`);
      el?.addEventListener('change', (e) => this._setPref(key, e.target.checked));
      el?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.click(); // triggers the 'change' event above
        }
      });
    }

    // Reset
    sr.getElementById('reset-btn')?.addEventListener('click', () => this._resetAll());

    // Global keyboard handler (focus trap + Escape)
    document.removeEventListener('keydown', this._boundKeydown);
    document.addEventListener('keydown', this._boundKeydown);
  }

  /**
   * Global keydown handler.
   * - Escape: closes the panel
   * - Tab / Shift+Tab: cycles focus within the panel (focus trap)
   */
  _onKeydown(e) {
    if (!this._isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this._closePanel();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = getFocusable(this.shadowRoot);
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && this.shadowRoot.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && this.shadowRoot.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ── Panel state ──────────────────────────────────────────────────────────────

  _togglePanel() {
    this._isOpen ? this._closePanel() : this._openPanel();
  }

  _openPanel() {
    this._isOpen = true;
    const sr = this.shadowRoot;
    sr.getElementById('trigger').setAttribute('aria-expanded', 'true');
    sr.getElementById('panel').classList.add('open');
    sr.getElementById('overlay').classList.add('open');

    // Move focus into the panel after the CSS transition starts
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sr.getElementById('panel').focus();
    }));
  }

  _closePanel() {
    this._isOpen = false;
    const sr = this.shadowRoot;
    sr.getElementById('trigger').setAttribute('aria-expanded', 'false');
    sr.getElementById('panel').classList.remove('open');
    sr.getElementById('overlay').classList.remove('open');
    sr.getElementById('trigger').focus(); // restore focus to trigger (WCAG 2.4.3)
  }

  // ── Partial DOM update (avoids full re-render on every change) ───────────────

  /**
   * Updates only the dynamic parts of the panel (font display, toggle states).
   * Much cheaper than a full _render() call.
   */
  _updateControls() {
    const sr = this.shadowRoot;
    if (!sr) return;

    // Font size display
    const display = sr.getElementById('font-display');
    if (display) display.textContent = `${Math.round(this._prefs.fontScale * 100)}%`;

    // Disable stepper buttons at their limits
    const dec = sr.getElementById('font-decrease');
    const inc = sr.getElementById('font-increase');
    if (dec) dec.disabled = this._prefs.fontScale <= 0.8;
    if (inc) inc.disabled = this._prefs.fontScale >= 2;

    // Sync checkbox state with preferences
    for (const key of ['highContrast', 'grayscale', 'dyslexiaFont', 'reduceMotion', 'highlightLinks', 'readingGuide', 'darkMode']) {
      const el = sr.getElementById(`toggle-${key}`);
      if (el) {
        el.checked = this._prefs[key];
        el.setAttribute('aria-checked', String(this._prefs[key]));
      }
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  _resetAll() {
    this._prefs = { ...DEFAULT_PREFS };
    this._savePrefs();
    this._applyAllPrefs();
    // Full re-render ensures checkboxes in the DOM match the reset state
    this._render();
  }
}
