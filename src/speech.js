/**
 * @file speech.js
 * Text-to-Speech (TTS) engine leveraging native Web Speech API (SpeechSynthesis).
 * Features:
 *  - Async voice loading, selection console, and language matching
 *  - Persistent bottom dock when active to guide the user ("Highlight any text to read aloud")
 *  - Non-intrusive floating "Listen" trigger button upon text selection
 *  - Live word boundary karaoke tracking (utterance.onboundary)
 *  - Safe lifecycle cleanup on Escape, click-away, and disable
 */

import { I18N } from './constants.js';

/** @type {SpeechSynthesisVoice[]} */
let voices = [];
let isEnabled = false;
let currentUtterance = null;
let currentLang = 'en';
let selectedVoiceURI = '';
let selectedRate = 1.0;

// Speaking state and karaoke synchronization
let isSpeaking = false;
let isStarting = false;
let karaokeTimer = null;
let currentWords = [];
let currentWordIndex = -1;
let receivedBoundaryEvents = false;

/** @type {HTMLElement|null} */
let bubbleEl = null;

/** @type {HTMLElement|null} */
let dockEl = null;

/** Loads available system voices and caches them. */
function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
}

/**
 * Initializes the speech engine lazily.
 * Guarantees zero contact with window.speechSynthesis until explicitly called.
 */
export function initSpeechEngine() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!voices.length) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
      if (typeof window !== 'undefined' && window.a11y?._updateVoiceSelect) {
        window.a11y._updateVoiceSelect();
      }
    };
  }
}

/**
 * Resolves the effective language from argument, currentLang, html[lang], navigator, or fallback.
 * @param {string} [customLang]
 * @returns {string}
 */
export function resolveEffectiveLang(customLang) {
  if (customLang) return customLang.toLowerCase().slice(0, 2);
  if (currentLang) return currentLang.toLowerCase().slice(0, 2);
  if (typeof document !== 'undefined' && document.documentElement?.getAttribute('lang')) {
    return document.documentElement.getAttribute('lang').toLowerCase().slice(0, 2);
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().slice(0, 2);
  }
  return 'en';
}

/**
 * Returns available voices categorized by current language.
 * @param {string} [targetLang]
 * @returns {{ matching: SpeechSynthesisVoice[], others: SpeechSynthesisVoice[], all: SpeechSynthesisVoice[] }}
 */
export function getAvailableVoices(targetLang) {
  if (!voices.length) loadVoices();
  const lang = resolveEffectiveLang(targetLang);
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  const others = voices.filter((v) => !v.lang.toLowerCase().startsWith(lang));
  return { matching, others, all: voices };
}

/**
 * Sets the active voice by URI or Name.
 * @param {string} voiceURI
 */
export function setVoice(voiceURI) {
  selectedVoiceURI = voiceURI || '';
}

/**
 * Sets the speech playback rate (e.g. 0.8, 1.0, 1.2, 1.5).
 * @param {number} rate
 */
export function setRate(rate) {
  selectedRate = Number(rate) || 1.0;
}

/**
 * Finds the best voice to use (explicit user choice, or linguistic fallback).
 * @param {string} [preferredLang]
 * @returns {SpeechSynthesisVoice|null}
 */
function getVoiceToUse(preferredLang) {
  if (!voices.length) loadVoices();

  if (selectedVoiceURI) {
    const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI || v.name === selectedVoiceURI);
    if (chosen) return chosen;
  }

  const target = resolveEffectiveLang(preferredLang);

  return (
    voices.find((v) => v.lang.toLowerCase() === target) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(target)) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
}

/** Gets current translations */
function getT(langOverride) {
  const lang = resolveEffectiveLang(langOverride);
  return I18N[lang] ?? I18N.en;
}


/**
 * Splits text into words with character offset ranges for accurate karaoke tracking.
 * @param {string} text
 * @returns {{ text: string, start: number, end: number }[]}
 */
function extractWords(text) {
  const regex = /\S+/g;
  const list = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    list.push({ text: m[0], start: m.index, end: regex.lastIndex });
  }
  return list;
}

/** Removes the floating action bubble from the DOM. */
function removeBubble() {
  if (bubbleEl) {
    bubbleEl.remove();
    bubbleEl = null;
  }
}

/** Creates or updates the persistent bottom notification dock */
function updateDock(statusText = '', isReading = false, words = []) {
  if (!isEnabled) return;
  const t = getT();

  if (!dockEl) {
    dockEl = document.createElement('div');
    dockEl.id = 'a11y-speech-dock';
    dockEl.setAttribute('role', 'status');
    dockEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(dockEl);
  }

  const badgeText = isReading ? '🔊 READING' : (t.speechActive || 'TTS ACTIVE');
  const badgeClass = isReading ? 'a11y-speech-dock-badge reading' : 'a11y-speech-dock-badge';

  if (isReading && words.length > 0) {
    const wordSpans = words.map((w, i) =>
      `<span class="a11y-word-pill ${i === currentWordIndex ? 'active' : (i < currentWordIndex ? 'spoken' : '')}" data-idx="${i}">${w.text}</span>`
    ).join('');

    dockEl.innerHTML = `
      <span class="${badgeClass}">${badgeText}</span>
      <div class="a11y-karaoke-stream" id="a11y-karaoke-stream">${wordSpans}</div>
      <button type="button" class="a11y-speech-dock-btn" id="a11y-dock-stop-btn">
        ✕ ${t.speechStop || 'Stop'}
      </button>
    `;
  } else {
    const message = statusText || (t.speechHint || 'Highlight text on page to listen');
    dockEl.innerHTML = `
      <span class="${badgeClass}">${badgeText}</span>
      <span class="a11y-speech-dock-text">${message}</span>
      ${isReading ? `
        <button type="button" class="a11y-speech-dock-btn" id="a11y-dock-stop-btn">
          ✕ ${t.speechStop || 'Stop'}
        </button>
      ` : ''}
    `;
  }

  dockEl.querySelector('#a11y-dock-stop-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    stopSpeech();
  });
}

/**
 * Highlights a specific word in both the floating bubble and the bottom dock.
 * @param {number} idx
 */
function highlightWordIndex(idx) {
  if (idx < 0 || idx >= currentWords.length) return;
  currentWordIndex = idx;
  const wordObj = currentWords[idx];

  // Update floating bubble
  if (bubbleEl) {
    const wordSpan = bubbleEl.querySelector('.a11y-speech-word');
    if (wordSpan) wordSpan.textContent = wordObj.text;
  }

  // Update bottom dock karaoke pills
  if (dockEl) {
    const stream = dockEl.querySelector('#a11y-karaoke-stream');
    if (stream) {
      const pills = stream.querySelectorAll('.a11y-word-pill');
      pills.forEach((pill, i) => {
        if (i === idx) {
          pill.classList.add('active');
          pill.classList.remove('spoken');
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else if (i < idx) {
          pill.classList.remove('active');
          pill.classList.add('spoken');
        } else {
          pill.classList.remove('active', 'spoken');
        }
      });
    }
  }
}

/**
 * Timer-based pacing fallback for browsers/voices that do not emit `onboundary` (e.g. macOS native voices in Chrome).
 */
function startKaraokePacer() {
  clearTimeout(karaokeTimer);

  function step() {
    if (!isSpeaking || receivedBoundaryEvents) return;
    if (currentWordIndex >= currentWords.length - 1) return;

    const curWord = currentWords[currentWordIndex]?.text || '';
    const rate = selectedRate || 1.0;
    let duration = 380 / rate;

    // Weight duration by word length and punctuation
    if (curWord.length > 6) duration += 70 / rate;
    if (/[.,!?;:]$/.test(curWord)) duration += 160 / rate;

    karaokeTimer = setTimeout(() => {
      if (!isSpeaking || receivedBoundaryEvents) return;
      highlightWordIndex(currentWordIndex + 1);
      step();
    }, Math.max(100, duration));
  }

  step();
}

/** Removes the persistent dock */
function removeDock() {
  if (dockEl) {
    dockEl.remove();
    dockEl = null;
  }
}

/**
 * Shows the floating "Listen" action bubble near the active selection.
 * @param {Selection} selection
 */
function showBubbleForSelection(selection) {
  if (!isEnabled) return;
  const t = getT();
  const text = selection.toString().trim();
  if (!text || text.length < 2) {
    if (!isSpeaking && !isStarting && !window.speechSynthesis?.speaking) {
      removeBubble();
      updateDock();
    }
    return;
  }

  // Avoid creating a bubble inside our own components
  const anchorNode = selection.anchorNode;
  const parentElement = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
  if (parentElement?.closest?.('a11y-control')) {
    return;
  }

  // Detect language of selected snippet if marked with lang attribute
  const elementLang = parentElement?.closest?.('[lang]')?.getAttribute('lang');

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return;

  if (!bubbleEl) {
    bubbleEl = document.createElement('div');
    bubbleEl.id = 'a11y-speech-bubble';
    bubbleEl.setAttribute('role', 'toolbar');
    bubbleEl.setAttribute('aria-label', t.speechSynthesis || 'Text to speech');
    document.body.appendChild(bubbleEl);
  }

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const top = rect.top + scrollY - 44;
  const left = rect.left + scrollX + rect.width / 2;

  bubbleEl.style.top = `${Math.max(10, top)}px`;
  bubbleEl.style.left = `${left}px`;
  bubbleEl.innerHTML = `
    <button id="a11y-speech-play-btn" type="button" aria-label="${t.speechListen || 'Listen'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
      <span>${t.speechListen || 'Listen'}</span>
    </button>
  `;

  bubbleEl.querySelector('#a11y-speech-play-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, elementLang);
  });

  updateDock(`"${text.slice(0, 30)}..." prêt à être lu`);
}

/**
 * Speaks text using the SpeechSynthesis API with real-time karaoke tracking.
 * @param {string} text
 * @param {string} [textLang]
 */
export function speak(text, textLang) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  stopSpeech();

  isStarting = true;
  isSpeaking = true;
  receivedBoundaryEvents = false;
  currentWords = extractWords(text);
  currentWordIndex = 0;

  const effectiveLang = resolveEffectiveLang(textLang);
  const t = getT(effectiveLang);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = effectiveLang;

  const voice = getVoiceToUse(effectiveLang);
  if (voice) utterance.voice = voice;

  utterance.rate = selectedRate || 1.0;
  utterance.pitch = 1.0;

  updateDock('', true, currentWords);

  if (bubbleEl) {
    bubbleEl.innerHTML = `
      <div class="a11y-speech-live" aria-live="polite">
        <span class="a11y-speech-wave" aria-hidden="true">🔊</span>
        <span class="a11y-speech-word">${currentWords[0]?.text || t.speechListen || 'Reading...'}</span>
        <button id="a11y-speech-stop-btn" type="button" aria-label="${t.speechStop || 'Stop'}">✕</button>
      </div>
    `;
    bubbleEl.querySelector('#a11y-speech-stop-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      stopSpeech();
    });
  }

  utterance.onstart = () => {
    isStarting = false;
    isSpeaking = true;
    highlightWordIndex(0);

    // Fallback pacer if no boundary event received within 350ms (macOS Chromium bug)
    setTimeout(() => {
      if (isSpeaking && !receivedBoundaryEvents && currentWords.length > 1) {
        startKaraokePacer();
      }
    }, 350);
  };

  // Word boundary karaoke tracking (for browsers/voices supporting it natively)
  utterance.onboundary = (e) => {
    if (e.name === 'word' || !e.name) {
      receivedBoundaryEvents = true;
      clearTimeout(karaokeTimer);

      const charIdx = e.charIndex;
      let foundIdx = currentWords.findIndex((w) => charIdx >= w.start && charIdx < w.end);
      if (foundIdx === -1) {
        foundIdx = currentWords.findIndex((w) => w.start >= charIdx);
      }
      if (foundIdx !== -1) {
        highlightWordIndex(foundIdx);
      }
    }
  };

  utterance.onend = () => {
    isSpeaking = false;
    isStarting = false;
    clearTimeout(karaokeTimer);
    currentUtterance = null;
    removeBubble();
    updateDock();
  };

  utterance.onerror = () => {
    isSpeaking = false;
    isStarting = false;
    clearTimeout(karaokeTimer);
    currentUtterance = null;
    removeBubble();
    updateDock();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/** Plays a short test phrase with the currently configured voice and rate. */
export function testVoice(phrase) {
  const lang = resolveEffectiveLang();
  const t = getT(lang);
  speak(phrase || t.speechTestPhrase || 'Bonjour, ceci est un test de voix.', lang);
}

/** Stops any ongoing speech synthesis. */
export function stopSpeech() {
  isSpeaking = false;
  isStarting = false;
  clearTimeout(karaokeTimer);
  currentWords = [];
  currentWordIndex = -1;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
  removeBubble();
  if (isEnabled) updateDock();
}

/** Handles mouseup/keyup selection detection */
function onSelectionChange() {
  if (!isEnabled) return;
  // If actively speaking or initializing, DO NOT interrupt or destroy bubble
  if (isSpeaking || isStarting || window.speechSynthesis?.speaking) {
    return;
  }
  setTimeout(() => {
    if (isSpeaking || isStarting || window.speechSynthesis?.speaking) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length >= 2) {
      showBubbleForSelection(selection);
    } else {
      removeBubble();
      updateDock();
    }
  }, 50);
}

/** Global keydown handler to stop speech on Escape */
function onKeydown(e) {
  if (e.key === 'Escape') {
    stopSpeech();
  }
}

const SPEECH_CSS_ID = 'a11y-speech-styles';

const SPEECH_CSS = `
  /* Floating speech bubble & karaoke */
  #a11y-speech-bubble {
    position: absolute;
    z-index: 999997;
    transform: translateX(-50%);
    background: #1e293b;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    pointer-events: auto;
    animation: a11yFadeIn 0.15s ease-out;
  }

  @keyframes a11yFadeIn {
    from { opacity: 0; transform: translate(-50%, 6px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  #a11y-speech-play-btn {
    background: none;
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }
  #a11y-speech-play-btn:hover {
    background: rgba(255,255,255,0.15);
  }

  .a11y-speech-live {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 6px;
  }
  .a11y-speech-word {
    color: #38bdf8;
    font-weight: 700;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #a11y-speech-stop-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
  #a11y-speech-stop-btn:hover {
    background: #ef4444;
  }

  /* Persistent bottom speech dock when TTS is active */
  #a11y-speech-dock {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999995;
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid #334155;
    border-radius: 999px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.45);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    pointer-events: auto;
    max-width: min(92vw, 760px);
    animation: a11yDockIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes a11yDockIn {
    from { opacity: 0; transform: translate(-50%, 16px) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
  }

  @media (max-width: 480px) {
    #a11y-speech-dock {
      bottom: 76px;
      max-width: calc(100vw - 24px);
      padding: 6px 12px;
      gap: 8px;
      font-size: 12px;
    }
    .a11y-speech-dock-text {
      max-width: 100px;
    }
    .a11y-karaoke-stream {
      max-width: 150px;
    }
  }

  .a11y-speech-dock-badge {
    background: #0284c7;
    color: #fff;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .a11y-speech-dock-badge.reading {
    background: #059669;
    animation: a11yPulse 1.5s infinite;
  }
  @keyframes a11yPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.75; }
  }

  .a11y-speech-dock-text {
    color: #cbd5e1;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .a11y-karaoke-stream {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    max-width: 520px;
    padding: 2px 4px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .a11y-karaoke-stream::-webkit-scrollbar {
    display: none;
  }

  .a11y-word-pill {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 6px;
    color: #94a3b8;
    font-size: 13px;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .a11y-word-pill.spoken {
    color: #e2e8f0;
    opacity: 0.75;
  }
  .a11y-word-pill.active {
    background: #facc15;
    color: #020617;
    font-weight: 800;
    transform: scale(1.08);
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
  }

  .a11y-speech-dock-btn {
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid #475569;
    padding: 4px 12px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .a11y-speech-dock-btn:hover {
    background: #ef4444;
    border-color: #f87171;
    color: #fff;
  }
  .a11y-speech-dock-btn.active {
    background: #0284c7;
    border-color: #38bdf8;
    color: #fff;
  }
`;

function injectSpeechStyles() {
  if (typeof document === 'undefined' || document.getElementById(SPEECH_CSS_ID)) return;
  const style = document.createElement('style');
  style.id = SPEECH_CSS_ID;
  style.textContent = SPEECH_CSS;
  document.head.appendChild(style);
}

/**
 * Enables Text-to-Speech support and shows the bottom active dock.
 * @param {string} [lang='en']
 * @param {string} [voiceURI='']
 * @param {number} [rate=1.0]
 */
export function enableSpeech(lang = 'en', voiceURI = '', rate = 1.0) {
  initSpeechEngine();
  currentLang = lang;
  if (voiceURI) selectedVoiceURI = voiceURI;
  if (rate) selectedRate = rate;

  injectSpeechStyles();

  if (isEnabled) return;
  isEnabled = true;

  document.addEventListener('mouseup', onSelectionChange);
  document.addEventListener('keyup', onSelectionChange);
  document.addEventListener('keydown', onKeydown);

  updateDock();
}

/** Disables Text-to-Speech support and cleans up listeners and UI. */
export function disableSpeech() {
  isEnabled = false;
  stopSpeech();
  removeBubble();
  removeDock();

  document.removeEventListener('mouseup', onSelectionChange);
  document.removeEventListener('keyup', onSelectionChange);
  document.removeEventListener('keydown', onKeydown);
}
