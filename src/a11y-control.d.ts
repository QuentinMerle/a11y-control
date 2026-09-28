/**
 * Type definitions for a11y-control
 */

export interface A11yPreferences {
  fontScale: number;
  highContrast: boolean;
  grayscale: boolean;
  dyslexiaFont: boolean;
  textSpacing: boolean;
  alignLeft: boolean;
  bigCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  reduceMotion: boolean;
  highlightLinks: boolean;
  darkMode: boolean;
  speechSynthesis: boolean;
}

export interface A11yChangeEventDetail {
  key: keyof A11yPreferences;
  value: boolean | number;
  prefs: A11yPreferences;
}

export interface A11yResetEventDetail {
  prefs: A11yPreferences;
}

export interface A11yAuditReport {
  issuesCount: number;
  missingAlt: number;
  unlabeledInputs: number;
  emptyButtons: number;
  details: string[];
}

export interface A11yI18nDictionary {
  triggerLabel?: string;
  title?: string;
  close?: string;
  fontSize?: string;
  decrease?: string;
  increase?: string;
  highContrast?: string;
  grayscale?: string;
  dyslexiaFont?: string;
  textSpacing?: string;
  alignLeft?: string;
  bigCursor?: string;
  reduceMotion?: string;
  highlightLinks?: string;
  readingGuide?: string;
  readingMask?: string;
  speechSynthesis?: string;
  speechListen?: string;
  speechStop?: string;
  resetAll?: string;
  sectionDisplay?: string;
  sectionReading?: string;
  sectionTools?: string;
  sectionTheme?: string;
  darkMode?: string;
}

export class A11yControl extends HTMLElement {
  static observedAttributes: string[];
  static registerLocale(lang: string, dict: A11yI18nDictionary): void;

  open(): void;
  close(): void;
  toggle(): void;
  getPref<K extends keyof A11yPreferences>(key: K): A11yPreferences[K];
  setPref<K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]): void;
  getPrefs(): A11yPreferences;
  reset(): void;
  audit(): A11yAuditReport;
}

export interface InitA11yOptions {
  lang?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  features?: string;
  exclude?: string;
}

export function initA11yControl(options?: InitA11yOptions): A11yControl | null;

declare global {
  interface Window {
    a11y?: A11yControl;
  }

  interface HTMLElementTagNameMap {
    'a11y-control': A11yControl;
  }

  interface GlobalEventHandlersEventMap {
    'a11y-change': CustomEvent<A11yChangeEventDetail>;
    'a11y-open': CustomEvent<void>;
    'a11y-close': CustomEvent<void>;
    'a11y-reset': CustomEvent<A11yResetEventDetail>;
  }

  namespace JSX {
    interface IntrinsicElements {
      'a11y-control': {
        lang?: 'en' | 'fr' | string;
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
        features?: string;
        exclude?: string;
        class?: string;
        className?: string;
        style?: string | Record<string, string>;
        ref?: any;
        key?: any;
      };
    }
  }
}

export default A11yControl;
