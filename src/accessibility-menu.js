/**
 * @file accessibility-menu.js
 * Entry point — imports the component class and registers the custom element.
 *
 * Usage (any HTML page):
 *   <script type="module" src="path/to/accessibility-menu.js"></script>
 *   <accessibility-menu lang="fr" position="bottom-right"></accessibility-menu>
 *
 * Attributes:
 *   lang      — "en" | "fr"                                  (default: "en")
 *   position  — "bottom-right" | "bottom-left"
 *               "top-right"    | "top-left"                   (default: "bottom-right")
 *
 * CSS custom properties (set on the <accessibility-menu> element to theme it):
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

import { AccessibilityMenu } from './AccessibilityMenu.js';

if (!customElements.get('accessibility-menu')) {
  customElements.define('accessibility-menu', AccessibilityMenu);
}
