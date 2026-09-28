/**
 * @file constants.js
 * Application-wide constants: storage key, default preferences, i18n strings.
 */

export const STORAGE_KEY = 'a11y-prefs';

const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isHighContrast = typeof window !== 'undefined' && (
  window.matchMedia('(prefers-contrast: more)').matches ||
  window.matchMedia('(forced-colors: active)').matches
);

/**
 * Default state for all accessibility preferences.
 * @type {Record<string, boolean|number>}
 */
export const DEFAULT_PREFS = {
  fontScale: 1,
  highContrast: isHighContrast,
  grayscale: false,
  dyslexiaFont: false,
  textSpacing: false,
  alignLeft: false,
  bigCursor: false,
  readingGuide: false,
  readingMask: false,
  reduceMotion: isReducedMotion,
  highlightLinks: false,
  darkMode: isDark,
  speechSynthesis: false,
  speechVoice: '',
  speechRate: 1.0,
};

/**
 * UI translations.
 * Add a new key here to support additional languages or use registerLocale().
 */
export const I18N = {
  en: {
    triggerLabel: 'Accessibility settings',
    title: 'Accessibility',
    close: 'Close',
    fontSize: 'Font size',
    decrease: 'Decrease font size',
    increase: 'Increase font size',
    highContrast: 'High contrast',
    grayscale: 'Grayscale',
    dyslexiaFont: 'Dyslexia-friendly font',
    textSpacing: 'Text spacing',
    alignLeft: 'Align text left',
    bigCursor: 'High-contrast cursor',
    reduceMotion: 'Reduce animations',
    highlightLinks: 'Highlight links',
    readingGuide: 'Reading guide',
    readingMask: 'Reading mask',
    speechSynthesis: 'Text to speech',
    speechHint: 'Highlight any text to read aloud',
    speechListen: 'Listen',
    speechStop: 'Stop',
    speechActive: 'TTS Active',
    speechVoiceLabel: 'Voice',
    speechRateLabel: 'Reading speed',
    speechTestBtn: 'Test voice',
    speechTestPhrase: 'Hello, this is an accessibility voice test.',
    speechDefaultVoice: 'Default voice',
    speechVoiceRecommended: 'Recommended voices',
    speechVoiceOther: 'Other languages',
    resetAll: 'Reset all',
    sectionDisplay: 'Display',
    sectionReading: 'Reading & Focus',
    sectionTools: 'Voice & Tools',
    sectionTheme: 'Theme',
    darkMode: 'Dark mode',
  },
  fr: {
    triggerLabel: "Paramètres d'accessibilité",
    title: 'Accessibilité',
    close: 'Fermer',
    fontSize: 'Taille de police',
    decrease: 'Réduire la taille de police',
    increase: 'Augmenter la taille de police',
    highContrast: 'Contraste élevé',
    grayscale: 'Niveaux de gris',
    dyslexiaFont: 'Police dyslexie',
    textSpacing: 'Espacement du texte',
    alignLeft: 'Aligner à gauche',
    bigCursor: 'Grand curseur contrasté',
    reduceMotion: 'Réduire les animations',
    highlightLinks: 'Surligner les liens',
    readingGuide: 'Guide de lecture',
    readingMask: 'Masque de lecture',
    speechSynthesis: 'Synthèse vocale',
    speechHint: 'Surlignez du texte pour l\'écouter',
    speechListen: 'Écouter',
    speechStop: 'Arrêter',
    speechActive: 'TTS Actif',
    speechVoiceLabel: 'Voix',
    speechRateLabel: 'Vitesse de lecture',
    speechTestBtn: 'Tester la voix',
    speechTestPhrase: 'Bonjour, ceci est un test de voix pour l\'accessibilité.',
    speechDefaultVoice: 'Voix par défaut',
    speechVoiceRecommended: 'Voix recommandées',
    speechVoiceOther: 'Autres langues',
    resetAll: 'Tout réinitialiser',
    sectionDisplay: 'Affichage',
    sectionReading: 'Lecture & Focus',
    sectionTools: 'Voix & Outils',
    sectionTheme: 'Thème',
    darkMode: 'Mode sombre',
  },
};

/**
 * Registers or extends translations for a locale with fallback to English.
 * @param {string} lang - Language code (e.g. 'es', 'de')
 * @param {Partial<typeof I18N['en']>} dict - Dictionary of translations
 */
export function registerLocale(lang, dict) {
  if (!lang || !dict) return;
  I18N[lang] = {
    ...I18N.en,
    ...(I18N[lang] ?? {}),
    ...dict,
  };
}
