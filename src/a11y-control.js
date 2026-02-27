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

if (!customElements.get('a11y-control')) {
  customElements.define('a11y-control', A11yControl);
}
