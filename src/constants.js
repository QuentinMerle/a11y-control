/**
 * @file constants.js
 * Application-wide constants: storage key, default preferences, i18n strings.
 */

export const STORAGE_KEY = 'a11y-prefs';

/**
 * Default state for all accessibility preferences.
 * @type {Record<string, boolean|number>}
 */
export const DEFAULT_PREFS = {
  fontScale: 1,
  highContrast: false,
  grayscale: false,
  dyslexiaFont: false,
  reduceMotion: false,
  highlightLinks: false,
  readingGuide: false,
  darkMode: false,
};

/**
 * UI translations.
 * Add a new key here to support additional languages.
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
    reduceMotion: 'Reduce animations',
    highlightLinks: 'Highlight links',
    readingGuide: 'Reading guide',
    resetAll: 'Reset all',
    sectionDisplay: 'Display',
    sectionReading: 'Reading',
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
    reduceMotion: 'Réduire les animations',
    highlightLinks: 'Surligner les liens',
    readingGuide: 'Guide de lecture',
    resetAll: 'Tout réinitialiser',
    sectionDisplay: 'Affichage',
    sectionReading: 'Lecture',
    sectionTheme: 'Thème',
    darkMode: 'Mode sombre',
  },
};
