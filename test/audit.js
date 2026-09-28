/**
 * Automated test suite for <a11y-control>
 * Verifies JavaScript module exports, preference defaults, and syntax.
 */

import { DEFAULT_PREFS, I18N, STORAGE_KEY } from '../src/constants.js';
import { A11yControl, initA11yControl } from '../src/a11y-control.js';
import { SHADOW_CSS, GLOBAL_CSS } from '../src/styles.js';
import * as Icons from '../src/icons.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n🔍 Running <a11y-control> Core Test Suite...\n');

// 1. Constants verification
assert(STORAGE_KEY === 'a11y-prefs', 'Storage key matches "a11y-prefs"');
assert(typeof DEFAULT_PREFS.fontScale === 'number', 'DEFAULT_PREFS.fontScale is a number');
assert(typeof DEFAULT_PREFS.highContrast === 'boolean', 'DEFAULT_PREFS.highContrast is boolean');
assert(typeof DEFAULT_PREFS.reduceMotion === 'boolean', 'DEFAULT_PREFS.reduceMotion is boolean');
assert(typeof DEFAULT_PREFS.speechSynthesis === 'boolean', 'DEFAULT_PREFS.speechSynthesis is boolean');
assert(typeof I18N.en === 'object' && typeof I18N.fr === 'object', 'I18N contains "en" and "fr" dictionaries');

// 2. Icons verification
assert(Object.keys(Icons).length >= 12, `Icons module contains all ${Object.keys(Icons).length} required SVG icons`);

// 3. Stylesheets verification
assert(SHADOW_CSS.includes(':host'), 'SHADOW_CSS includes :host styling');
assert(SHADOW_CSS.includes('--a11y-trigger-size'), 'SHADOW_CSS includes --a11y-trigger-size variable');
assert(GLOBAL_CSS.includes('.a11y-high-contrast'), 'GLOBAL_CSS includes high-contrast rules');
assert(GLOBAL_CSS.includes('.a11y-text-spacing'), 'GLOBAL_CSS includes text-spacing rules');
assert(GLOBAL_CSS.includes('.a11y-dyslexia'), 'GLOBAL_CSS includes dyslexia font stack');

// 4. Class & helpers verification
assert(typeof A11yControl === 'function', 'A11yControl is an exported class');
assert(Array.isArray(A11yControl.observedAttributes), 'A11yControl declares observedAttributes');
assert(A11yControl.observedAttributes.includes('lang'), 'observedAttributes includes "lang"');
assert(A11yControl.observedAttributes.includes('features'), 'observedAttributes includes "features"');
assert(A11yControl.observedAttributes.includes('exclude'), 'observedAttributes includes "exclude"');
assert(typeof initA11yControl === 'function', 'initA11yControl helper is exported');

// 5. Audit method presence
assert(typeof A11yControl.prototype.audit === 'function', 'A11yControl exposes .audit() method');
assert(typeof A11yControl.prototype.open === 'function', 'A11yControl exposes .open() method');
assert(typeof A11yControl.prototype.close === 'function', 'A11yControl exposes .close() method');
assert(typeof A11yControl.prototype.setPref === 'function', 'A11yControl exposes .setPref() method');

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All core tests passed successfully!\n');
}
