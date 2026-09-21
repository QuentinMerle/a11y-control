/**
 * @file A11yControl.js
 * The A11yControl Custom Element class.
 *
 * Responsibilities:
 *  - Manage user preferences (load/save via localStorage & OS defaults)
 *  - Render the Shadow DOM panel with dynamic feature gating (features/exclude)
 *  - Apply preference effects to the host document (classes, inline styles, data-state)
 *  - Handle keyboard navigation and strict modal focus trap
 *  - Provide Public JS API (open, close, toggle, getPref, setPref, reset, audit)
 *  - Dispatch CustomEvents (a11y-change, a11y-open, a11y-close, a11y-reset)
 *  - Expose runtime window.a11y for AI agents & host integrations
 */

import { STORAGE_KEY, DEFAULT_PREFS, I18N, registerLocale } from './constants.js';
import { SHADOW_CSS, injectGlobalStyles, loadOpenDyslexicFont } from './styles.js';
import { createReadingGuide, destroyReadingGuide } from './reading-guide.js';
import { createReadingMask, destroyReadingMask } from './reading-mask.js';
import {
  ICON_A11Y, ICON_CLOSE,
  ICON_CONTRAST, ICON_GRAYSCALE, ICON_LINK,
  ICON_DYSLEXIA, ICON_GUIDE, ICON_MOTION, ICON_RESET, ICON_DARK_MODE,
  ICON_TEXT_SPACING, ICON_ALIGN_LEFT, ICON_BIG_CURSOR, ICON_MASK, ICON_SPEECH
} from './icons.js';

// ── Lazy-loaded Speech Module (keeps initial bundle < 10kb gzipped) ─────────
let _speechModule = null;
async function getSpeechModule() {
  if (!_speechModule) {
    _speechModule = await import('./speech.js');
  }
  return _speechModule;
}

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
    return ['lang', 'position', 'features', 'exclude'];
  }

  /**
   * Registers or extends translations for a locale.
   * @param {string} lang - Language code (e.g. 'es', 'de')
   * @param {Partial<typeof I18N['en']>} dict - Dictionary of translations
   */
  static registerLocale(lang, dict) {
    registerLocale(lang, dict);
  }

  constructor() {
    super();
    /** @type {typeof DEFAULT_PREFS} */
    this._prefs = { ...DEFAULT_PREFS };
    this._isOpen = false;
    this._boundKeydown = this._onKeydown.bind(this);
  }

  /**
   * Resolves the current language with the following cascade:
   * 1. Element's lang attribute: <a11y-control lang="...">
   * 2. Closest ancestor with lang attribute (e.g. <body lang="..."> or <html lang="...">)
   * 3. Browser language: navigator.language (e.g. "fr-FR" -> "fr")
   * 4. Default: "en"
   * @returns {string}
   */
  _getLang() {
    const attr = this.getAttribute('lang');
    if (attr) return attr.toLowerCase().slice(0, 2);

    const ancestorLang = this.closest?.('[lang]')?.getAttribute('lang') ||
      (typeof document !== 'undefined' && document.documentElement?.getAttribute('lang'));
    if (ancestorLang) return ancestorLang.toLowerCase().slice(0, 2);

    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().slice(0, 2);
    }

    return 'en';
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  connectedCallback() {
    injectGlobalStyles();
    this._loadPrefs();
    this._applyAllPrefs();
    this._render();

    // Expose runtime instance on window for external scripts and AI agents
    if (typeof window !== 'undefined') {
      window.a11y = this;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          if (_speechModule) this._updateVoiceSelect();
        });
      }
    }
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._boundKeydown);
    destroyReadingGuide();
    destroyReadingMask();
    _speechModule?.disableSpeech();

    if (typeof window !== 'undefined' && window.a11y === this) {
      delete window.a11y;
    }
  }

  /** Re-render when lang, features, or exclude change; position is purely CSS-driven. */
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && ['lang', 'features', 'exclude'].includes(name) && this.shadowRoot) {
      this._render();
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Opens the accessibility panel. */
  open() {
    if (!this._isOpen) this._openPanel();
  }

  /** Closes the accessibility panel. */
  close() {
    if (this._isOpen) this._closePanel();
  }

  /** Toggles the accessibility panel open/close state. */
  toggle() {
    this._togglePanel();
  }

  /**
   * Gets a specific preference value.
   * @param {keyof typeof DEFAULT_PREFS} key
   */
  getPref(key) {
    return this._prefs[key];
  }

  /**
   * Updates a preference value programmatically.
   * @param {keyof typeof DEFAULT_PREFS} key
   * @param {boolean|number} value
   */
  setPref(key, value) {
    this._setPref(key, value);
  }

  /** Returns a clone of all current preferences. */
  getPrefs() {
    return { ...this._prefs };
  }

  /** Resets all preferences to defaults. */
  reset() {
    this._resetAll();
  }

  /**
   * Performs a lightweight DOM accessibility audit on the host document.
   * Useful for developers and AI coding agents to diagnose common issues.
   * @returns {{ issuesCount: number, missingAlt: number, unlabeledInputs: number, emptyButtons: number, details: string[] }}
   */
  audit() {
    const details = [];
    const images = document.querySelectorAll('img:not([alt])');
    const missingAlt = images.length;
    if (missingAlt > 0) details.push(`Found ${missingAlt} image(s) missing the 'alt' attribute.`);

    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
    let unlabeledInputs = 0;
    inputs.forEach((input) => {
      const id = input.id;
      if (!id || !document.querySelector(`label[for="${id}"]`)) {
        unlabeledInputs++;
      }
    });
    if (unlabeledInputs > 0) details.push(`Found ${unlabeledInputs} form input(s) without an associated label.`);

    const buttons = document.querySelectorAll('button');
    let emptyButtons = 0;
    buttons.forEach((btn) => {
      if (!btn.closest('a11y-control') && !btn.innerText.trim() && !btn.getAttribute('aria-label')) {
        emptyButtons++;
      }
    });
    if (emptyButtons > 0) details.push(`Found ${emptyButtons} button(s) with no text or aria-label.`);

    return {
      issuesCount: missingAlt + unlabeledInputs + emptyButtons,
      missingAlt,
      unlabeledInputs,
      emptyButtons,
      details,
    };
  }

  // ── Feature Gating (Modular Controls) ───────────────────────────────────────

  /**
   * Checks whether a feature is allowed by `features` (whitelist) and `exclude` (blacklist).
   * @param {string} key
   * @returns {boolean}
   */
  _isFeatureEnabled(key) {
    const excludeAttr = this.getAttribute('exclude');
    if (excludeAttr) {
      const excluded = excludeAttr.split(',').map((s) => s.trim());
      if (excluded.includes(key)) return false;
    }

    const featuresAttr = this.getAttribute('features');
    if (featuresAttr) {
      const allowed = featuresAttr.split(',').map((s) => s.trim());
      return allowed.includes(key);
    }

    return true;
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
   * Updates a single preference, saves, applies DOM changes, and emits custom event.
   * @param {keyof typeof DEFAULT_PREFS} key
   * @param {boolean|number} value
   */
  _setPref(key, value) {
    this._prefs[key] = value;
    this._savePrefs();
    this._applyAllPrefs();
    this._updateControls();

    // Dispatch a11y-change event
    this.dispatchEvent(new CustomEvent('a11y-change', {
      detail: { key, value, prefs: { ...this._prefs } },
      bubbles: true,
      composed: true,
    }));
  }

  // ── DOM effects ─────────────────────────────────────────────────────────────

  /**
   * Reflects all preferences onto the host document.
   * Called on mount and after every preference change.
   */
  _applyAllPrefs() {
    const {
      fontScale, highContrast, grayscale, dyslexiaFont, textSpacing,
      alignLeft, bigCursor, reduceMotion, highlightLinks,
      readingGuide, readingMask, darkMode, speechSynthesis
    } = this._prefs;
    const html = document.documentElement;

    // Font scale
    html.style.fontSize = fontScale === 1 ? '' : `${fontScale * 100}%`;

    // Global toggle classes
    html.classList.toggle('a11y-high-contrast',   highContrast);
    html.classList.toggle('a11y-grayscale',        grayscale);
    html.classList.toggle('a11y-reduce-motion',    reduceMotion);
    html.classList.toggle('a11y-highlight-links',  highlightLinks);
    html.classList.toggle('a11y-dark-mode',        darkMode);
    html.classList.toggle('a11y-text-spacing',     textSpacing);
    html.classList.toggle('a11y-align-left',       alignLeft);
    html.classList.toggle('a11y-big-cursor',       bigCursor);

    // Machine-readable data state for AI agents
    html.setAttribute('data-a11y-state', JSON.stringify(this._prefs));

    // Internal component theme
    this.setAttribute('data-a11y-theme', darkMode ? 'dark' : 'light');

    // Dyslexia font
    if (dyslexiaFont) {
      loadOpenDyslexicFont();
      html.classList.add('a11y-dyslexia');
    } else {
      html.classList.remove('a11y-dyslexia');
    }

    // Reading guide
    if (readingGuide) createReadingGuide();
    else              destroyReadingGuide();

    // Reading mask
    if (readingMask) createReadingMask();
    else             destroyReadingMask();

    // Text to speech (dynamically loaded on demand)
    if (speechSynthesis) {
      getSpeechModule().then((m) => {
        m.enableSpeech(this._getLang(), this._prefs.speechVoice, this._prefs.speechRate);
        this._updateVoiceSelect();
      });
    } else {
      _speechModule?.disableSpeech();
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  /** (Re-)renders the full Shadow DOM. */
  _render() {
    const lang = this._getLang();
    const t = I18N[lang] ?? I18N.en;

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

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

    // Build controls conditionally
    const showFontSize = this._isFeatureEnabled('fontSize') || this._isFeatureEnabled('fontScale');
    const showContrast = this._isFeatureEnabled('highContrast');
    const showGrayscale = this._isFeatureEnabled('grayscale');
    const showLinks = this._isFeatureEnabled('highlightLinks');
    const showBigCursor = this._isFeatureEnabled('bigCursor');

    const showDyslexia = this._isFeatureEnabled('dyslexiaFont');
    const showTextSpacing = this._isFeatureEnabled('textSpacing');
    const showAlignLeft = this._isFeatureEnabled('alignLeft');
    const showReadingGuide = this._isFeatureEnabled('readingGuide');
    const showReadingMask = this._isFeatureEnabled('readingMask');
    const showReduceMotion = this._isFeatureEnabled('reduceMotion');

    const showSpeech = this._isFeatureEnabled('speechSynthesis') || this._isFeatureEnabled('speech');
    const showDarkMode = this._isFeatureEnabled('darkMode');

    const hasDisplaySection = showContrast || showGrayscale || showLinks || showBigCursor;
    const hasReadingSection = showDyslexia || showTextSpacing || showAlignLeft || showReadingGuide || showReadingMask || showReduceMotion;
    const hasToolsSection = showSpeech;
    const hasThemeSection = showDarkMode;

    return /* html */`
      <!-- Floating trigger button -->
      <button
        id="trigger"
        part="trigger"
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

          ${showFontSize ? /* html */`
            <!-- Font size section -->
            <h3 class="section-label">${t.fontSize}</h3>
            <div class="font-size-row">
              <span>${t.fontSize}</span>
              <button class="step-btn" id="font-decrease" aria-label="${t.decrease}" aria-disabled="${fontScale <= 0.8 ? 'true' : 'false'}">−</button>
              <span
                class="scale-display"
                id="font-display"
                aria-live="polite"
                aria-atomic="true"
              >${Math.round(fontScale * 100)}%</span>
              <button class="step-btn" id="font-increase" aria-label="${t.increase}" aria-disabled="${fontScale >= 2 ? 'true' : 'false'}">+</button>
            </div>
          ` : ''}

          ${hasDisplaySection ? /* html */`
            <!-- Display section -->
            <h3 class="section-label">${t.sectionDisplay}</h3>
            ${showContrast ? this._toggleRow('highContrast', t.highContrast, ICON_CONTRAST) : ''}
            ${showGrayscale ? this._toggleRow('grayscale', t.grayscale, ICON_GRAYSCALE) : ''}
            ${showLinks ? this._toggleRow('highlightLinks', t.highlightLinks, ICON_LINK) : ''}
            ${showBigCursor ? this._toggleRow('bigCursor', t.bigCursor, ICON_BIG_CURSOR) : ''}
          ` : ''}

          ${hasReadingSection ? /* html */`
            <!-- Reading section -->
            <h3 class="section-label">${t.sectionReading}</h3>
            ${showDyslexia ? this._toggleRow('dyslexiaFont', t.dyslexiaFont, ICON_DYSLEXIA) : ''}
            ${showTextSpacing ? this._toggleRow('textSpacing', t.textSpacing, ICON_TEXT_SPACING) : ''}
            ${showAlignLeft ? this._toggleRow('alignLeft', t.alignLeft, ICON_ALIGN_LEFT) : ''}
            ${showReadingGuide ? this._toggleRow('readingGuide', t.readingGuide, ICON_GUIDE) : ''}
            ${showReadingMask ? this._toggleRow('readingMask', t.readingMask, ICON_MASK) : ''}
            ${showReduceMotion ? this._toggleRow('reduceMotion', t.reduceMotion, ICON_MOTION) : ''}
          ` : ''}

          ${hasToolsSection ? /* html */`
            <!-- Voice & Tools section -->
            <h3 class="section-label">${t.sectionTools}</h3>
            ${showSpeech ? `
              ${this._toggleRow('speechSynthesis', t.speechSynthesis, ICON_SPEECH)}
              <div class="toggle-sublabel">${t.speechHint || 'Highlight any text to read aloud'}</div>
              <div class="voice-console" id="voice-console" style="${this._prefs.speechSynthesis ? '' : 'display:none;'}">
                <div class="voice-field">
                  <label for="speech-voice-select">${t.speechVoiceLabel || 'Voice'}</label>
                  <select class="voice-select" id="speech-voice-select" aria-label="${t.speechVoiceLabel || 'Voice'}">
                    ${this._buildVoiceOptions(t)}
                  </select>
                </div>
                <div class="voice-rate-row">
                  <span class="voice-rate-label">${t.speechRateLabel || 'Speed'}</span>
                  <div class="rate-pills" id="rate-pills" role="radiogroup" aria-label="${t.speechRateLabel || 'Speed'}">
                    ${[0.8, 1.0, 1.2, 1.5].map((r) => `
                      <button type="button" class="rate-pill ${Number(this._prefs.speechRate || 1.0) === r ? 'active' : ''}" data-rate="${r}" role="radio" aria-checked="${Number(this._prefs.speechRate || 1.0) === r}">${r}x</button>
                    `).join('')}
                  </div>
                </div>
                <button type="button" class="voice-test-btn" id="speech-test-btn">▶ ${t.speechTestBtn || 'Test voice'}</button>
              </div>
            ` : ''}
          ` : ''}

          ${hasThemeSection ? /* html */`
            <!-- Theme section -->
            <h3 class="section-label">${t.sectionTheme}</h3>
            ${showDarkMode ? this._toggleRow('darkMode', t.darkMode, ICON_DARK_MODE) : ''}
          ` : ''}

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
   * @param {string} key - Preference key
   * @param {string} label - Display label
   * @param {string} icon - SVG string
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

  /**
   * Generates HTML option tags for the voice select dropdown.
   * Groups recommended matching language voices first.
   * @param {typeof I18N['en']} t
   * @param {object} [m] - Optional speech module
   */
  _buildVoiceOptions(t, m) {
    const speechMod = m || _speechModule;
    let html = `<option value="">${t.speechDefaultVoice || 'System default'}</option>`;
    if (!speechMod) return html;

    const lang = this._getLang();
    const { matching, others } = speechMod.getAvailableVoices(lang);

    if (matching.length > 0) {
      const langName = lang.toUpperCase();
      const groupLabel = `${t.speechVoiceRecommended || 'Recommended'} (${langName})`;
      html += `<optgroup label="${groupLabel}">`;
      matching.forEach((v) => {
        const selected = (this._prefs.speechVoice === v.voiceURI || this._prefs.speechVoice === v.name) ? 'selected' : '';
        html += `<option value="${v.voiceURI || v.name}" ${selected}>${v.name}</option>`;
      });
      html += `</optgroup>`;
    }

    if (others.length > 0) {
      const groupLabel = t.speechVoiceOther || 'Other languages';
      html += `<optgroup label="${groupLabel}">`;
      others.slice(0, 50).forEach((v) => {
        const selected = (this._prefs.speechVoice === v.voiceURI || this._prefs.speechVoice === v.name) ? 'selected' : '';
        html += `<option value="${v.voiceURI || v.name}" ${selected}>${v.name} (${v.lang})</option>`;
      });
      html += `</optgroup>`;
    }

    return html;
  }

  /** Dynamically re-populates the voice select when voices finish loading. */
  async _updateVoiceSelect() {
    const sr = this.shadowRoot;
    if (!sr) return;
    const select = sr.getElementById('speech-voice-select');
    if (select) {
      const m = await getSpeechModule();
      const lang = this._getLang();
      const t = I18N[lang] ?? I18N.en;
      select.innerHTML = this._buildVoiceOptions(t, m);
      select.value = this._prefs.speechVoice || '';
    }
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  /** Binds all interactive elements after a render. */
  _bindEvents() {
    const sr = this.shadowRoot;

    // Panel open / close
    sr.getElementById('trigger')?.addEventListener('click', () => this._togglePanel());
    sr.getElementById('close-btn')?.addEventListener('click', () => this._closePanel());
    sr.getElementById('overlay')?.addEventListener('click', () => this._closePanel());

    // Font size stepper
    sr.getElementById('font-decrease')?.addEventListener('click', () => {
      if (this._prefs.fontScale <= 0.8) return;
      const next = Math.max(0.8, Math.round((this._prefs.fontScale - 0.1) * 10) / 10);
      this._setPref('fontScale', next);
    });
    sr.getElementById('font-increase')?.addEventListener('click', () => {
      if (this._prefs.fontScale >= 2) return;
      const next = Math.min(2, Math.round((this._prefs.fontScale + 0.1) * 10) / 10);
      this._setPref('fontScale', next);
    });

    // Toggle switches (Space and Enter support for accessibility)
    const toggleKeys = [
      'highContrast', 'grayscale', 'highlightLinks', 'bigCursor',
      'dyslexiaFont', 'textSpacing', 'alignLeft', 'readingGuide', 'readingMask', 'reduceMotion',
      'speechSynthesis', 'darkMode'
    ];

    for (const key of toggleKeys) {
      const el = sr.getElementById(`toggle-${key}`);
      el?.addEventListener('change', (e) => this._setPref(key, e.target.checked));
      el?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.click();
        }
      });
    }

    // Voice console controls (lazy-loaded speech module)
    sr.getElementById('speech-voice-select')?.addEventListener('change', async (e) => {
      this._setPref('speechVoice', e.target.value);
      const m = await getSpeechModule();
      m.setVoice(e.target.value);
    });

    sr.querySelectorAll('.rate-pill').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const rate = Number(e.currentTarget.dataset.rate);
        this._setPref('speechRate', rate);
        const m = await getSpeechModule();
        m.setRate(rate);
      });
    });

    sr.getElementById('speech-test-btn')?.addEventListener('click', async () => {
      const m = await getSpeechModule();
      m.testVoice();
    });

    // Reset
    sr.getElementById('reset-btn')?.addEventListener('click', () => this._resetAll());

    // Global keyboard handler (focus trap + Escape)
    document.removeEventListener('keydown', this._boundKeydown);
    document.addEventListener('keydown', this._boundKeydown);
  }

  /**
   * Global keydown handler.
   * - Escape: closes the panel & stops speech
   * - Tab / Shift+Tab: cycles focus within the panel strictly (focus trap)
   */
  _onKeydown(e) {
    if (!this._isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      _speechModule?.stopSpeech();
      this._closePanel();
      return;
    }

    if (e.key === 'Tab') {
      const panel = this.shadowRoot.getElementById('panel');
      if (!panel) return;
      const focusable = getFocusable(panel);
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && (this.shadowRoot.activeElement === first || this.shadowRoot.activeElement === panel)) {
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

    this.dispatchEvent(new CustomEvent('a11y-open', { bubbles: true, composed: true }));

    // Move focus into the panel — land on close button per W3C APG modal pattern
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const closeBtn = sr.getElementById('close-btn');
      if (closeBtn) closeBtn.focus();
      else sr.getElementById('panel')?.focus();
    }));
  }

  _closePanel() {
    this._isOpen = false;
    const sr = this.shadowRoot;
    sr.getElementById('trigger').setAttribute('aria-expanded', 'false');
    sr.getElementById('panel').classList.remove('open');
    sr.getElementById('overlay').classList.remove('open');
    sr.getElementById('trigger').focus();

    this.dispatchEvent(new CustomEvent('a11y-close', { bubbles: true, composed: true }));
  }

  // ── Partial DOM update ───────────────────────────────────────────────────────

  /** Updates only the dynamic parts of the panel without re-rendering. */
  _updateControls() {
    const sr = this.shadowRoot;
    if (!sr) return;

    // Font size display
    const display = sr.getElementById('font-display');
    if (display) display.textContent = `${Math.round(this._prefs.fontScale * 100)}%`;

    // Disable stepper buttons at limits via aria-disabled
    const dec = sr.getElementById('font-decrease');
    const inc = sr.getElementById('font-increase');
    if (dec) dec.setAttribute('aria-disabled', this._prefs.fontScale <= 0.8 ? 'true' : 'false');
    if (inc) inc.setAttribute('aria-disabled', this._prefs.fontScale >= 2 ? 'true' : 'false');

    // Sync checkbox state with preferences
    const toggleKeys = [
      'highContrast', 'grayscale', 'highlightLinks', 'bigCursor',
      'dyslexiaFont', 'textSpacing', 'alignLeft', 'readingGuide', 'readingMask', 'reduceMotion',
      'speechSynthesis', 'darkMode'
    ];

    for (const key of toggleKeys) {
      const el = sr.getElementById(`toggle-${key}`);
      if (el) {
        el.checked = !!this._prefs[key];
        el.setAttribute('aria-checked', String(!!this._prefs[key]));
      }
    }

    // Sync voice console visibility & values
    const consoleEl = sr.getElementById('voice-console');
    if (consoleEl) {
      consoleEl.style.display = this._prefs.speechSynthesis ? 'flex' : 'none';
      if (this._prefs.speechSynthesis) {
        this._updateVoiceSelect();
      }
    }

    sr.querySelectorAll('.rate-pill').forEach((btn) => {
      const isActive = Number(btn.dataset.rate) === Number(this._prefs.speechRate || 1.0);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });

    const selectEl = sr.getElementById('speech-voice-select');
    if (selectEl && this._prefs.speechVoice) {
      selectEl.value = this._prefs.speechVoice;
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  _resetAll() {
    _speechModule?.stopSpeech();
    _speechModule?.disableSpeech();
    this._prefs = { ...DEFAULT_PREFS };
    this._savePrefs();
    this._applyAllPrefs();
    this._updateControls();

    this.dispatchEvent(new CustomEvent('a11y-reset', {
      detail: { prefs: { ...this._prefs } },
      bubbles: true,
      composed: true,
    }));
  }
}
