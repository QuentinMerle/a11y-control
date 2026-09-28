/**
 * @file a11y-control.js
 * Entry point — imports the component class and registers the custom element.
 *
 * Usage (any HTML page):
 *   <script type="module" src="path/to/a11y-control.js"></script>
 *   <a11y-control lang="fr" position="bottom-right"></a11y-control>
 *
 * Attributes:
 *   lang      — "en" | "fr"                                  (default: "en")
 *   position  — "bottom-right" | "bottom-left"
 *               "top-right"    | "top-left"                   (default: "bottom-right")
 *
 * CSS custom properties (set on the <a11y-control> element to theme it):
 *   --a11y-accent        #005fcc
 *   --a11y-accent-hover  #0047a3
 *   --a11y-bg            #ffffff
 *   --a11y-surface       #f5f5f5
 *   --a11y-border        #d0d0d0
 *   --a11y-text          #1a1a1a
 *   --a11y-text-muted    #555555
 *   --a11y-radius        12px
 *   --a11y-shadow        0 8px 32px rgba(0,0,0,.18)
 */

import { A11yControl } from './A11yControl.js';

// ── SSR-Safe Custom Element Registration ───────────────────────────────────
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  if (!customElements.get('a11y-control')) {
    customElements.define('a11y-control', A11yControl);
  }
}

/**
 * Automatically mounts <a11y-control> if data-auto-mount is present on the script tag.
 * Enables 1-line zero-code installation on Shopify, WordPress, Webflow, GTM, etc.:
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control" data-auto-mount></script>
 */
function autoMountIfRequested() {
  if (typeof document === 'undefined') return;

  const script = document.currentScript || document.querySelector('script[data-auto-mount]');
  if (!script || !script.hasAttribute('data-auto-mount')) return;

  const mount = () => {
    if (document.querySelector('a11y-control')) return;
    const el = document.createElement('a11y-control');
    const lang = script.getAttribute('data-lang');
    const pos = script.getAttribute('data-position');
    const features = script.getAttribute('data-features');
    const exclude = script.getAttribute('data-exclude');
    if (lang) el.setAttribute('lang', lang);
    if (pos) el.setAttribute('position', pos);
    if (features) el.setAttribute('features', features);
    if (exclude) el.setAttribute('exclude', exclude);
    document.body.appendChild(el);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}

autoMountIfRequested();

/**
 * Programmatic helper to mount <a11y-control> into the DOM.
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} [options.position]
 * @param {string} [options.features]
 * @param {string} [options.exclude]
 * @returns {A11yControl|null}
 */
export function initA11yControl(options = {}) {
  if (typeof document === 'undefined') return null;
  let el = document.querySelector('a11y-control');
  if (!el) {
    el = document.createElement('a11y-control');
    if (options.lang) el.setAttribute('lang', options.lang);
    if (options.position) el.setAttribute('position', options.position);
    if (options.features) el.setAttribute('features', options.features);
    if (options.exclude) el.setAttribute('exclude', options.exclude);
    document.body.appendChild(el);
  }
  return el;
}

export { A11yControl };
export default A11yControl;
