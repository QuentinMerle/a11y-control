# `<a11y-control>` (A11yControl)

[![npm version](https://img.shields.io/npm/v/a11y-control.svg?color=0284c7&style=flat-square)](https://www.npmjs.com/package/a11y-control)
[![npm downloads](https://img.shields.io/npm/dw/a11y-control.svg?color=10b981&style=flat-square)](https://www.npmjs.com/package/a11y-control)
[![bundle size](https://img.shields.io/bundlephobia/minzip/a11y-control?color=8b5cf6&style=flat-square)](https://bundlephobia.com/package/a11y-control)
[![WCAG 2.1 AAA](https://img.shields.io/badge/WCAG%202.1-AAA%20Ready-059669?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)
[![EAA 2025](https://img.shields.io/badge/EAA%202025-Compliant%20Companion-6366f1?style=flat-square)](https://commission.europa.eu/business-economy-euro/doing-business-eu/accessibility_en)
[![CI](https://github.com/QuentinMerle/a11y-control/actions/workflows/ci.yml/badge.svg)](https://github.com/QuentinMerle/a11y-control/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](https://opensource.org/licenses/MIT)

> A plug-and-play accessibility toolbar and assistive companion for the web, **WCAG 2.1 AA/AAA** and **European Accessibility Act (EAA 2025)** compliant, built as a native Web Component.  
> Zero dependencies. Zero build required. Ultra-lightweight (< 10 kB initial load). 100% GDPR & privacy-first (0 cookies, 0 telemetry). **Agent-Ready**.

**[🌐 Live Demo & Documentation](https://quentinmerle.github.io/a11y-control/demo/)**

---

## 🧭 Why `<a11y-control>`? (Market Landscape)

In modern web development, teams looking to improve accessibility often find themselves stuck between three extremes:

| Solution Type | Examples | Strengths | Trade-offs | Where `<a11y-control>` Fits |
|---|---|---|---|---|
| **Headless Primitives** | React Aria, Radix UI, Base UI, Ark UI | Maximum design freedom | ⚠️ React-only, no out-of-the-box UI, requires writing hundreds of lines of styling & state | `<a11y-control>` provides a **turnkey, pre-styled assistive suite** in 1 line of HTML, framework-agnostic. |
| **Component Libraries** | shadcn/ui, HeroUI, Web Awesome | Complete UI kits (buttons, inputs) | ⚠️ Heavy dependency, designed to build apps, not to provide an end-user assistive toolbar | `<a11y-control>` focuses purely on **document-level assistive reading instruments** (< 10 kB). |
| **Commercial Overlays** | UserWay, accessiBe | 1-line script tag | ❌ 400–800 kB footprint, trackers, $490+/yr, high litigation risk for deceptive "instant waiver" claims | `<a11y-control>` is **100% Open Source (MIT)**, privacy-first, lightweight, and legally ethical. |

---

## ⚖️ Legal Context & Ethical Compliance

`<a11y-control>` is designed as an **Assistive Reading Companion**:
* **Assistive Aid, Not an Overlay Waiver**: Using `<a11y-control>` directly satisfies mandatory user-personalization criteria under the **European Accessibility Act (EAA 2025)**, **RGAA 4.1**, **ADA Title III**, and **Section 508** (such as text resize, visual presentation, un-justified text, and text spacing).
* **Ethical Compliance**: Unlike commercial overlay widgets that face severe legal sanctions for claiming "automatic legal indemnity", `<a11y-control>` empowers users with genuine client-side assistive instruments without altering semantic underlying HTML maliciously.
* **Liability**: Website owners remain responsible for ensuring their core markup is accessible. Use `window.a11y.audit()` or professional audits to certify host document compliance.

---

## ⚡ Quick Start — 30 Seconds

### Method 1: Zero-Code Auto-Mount (Shopify, WordPress, Webflow, Squarespace, GTM)
Add a single script tag with `data-auto-mount` to your site's `<head>` or footer. The element automatically instantiates and mounts to `document.body`:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/a11y-control"
  data-auto-mount
  data-lang="en"
  data-position="bottom-right"
></script>
```

### Method 2: Standard CDN (Zero Install)
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control"></script>
<a11y-control lang="en" position="bottom-right"></a11y-control>
```

### Method 3: Via NPM (Modern Web Apps)
```bash
npm install a11y-control
```

```javascript
import 'a11y-control';
```

```html
<a11y-control lang="en" position="bottom-right"></a11y-control>
```

---

## 🚀 Framework Integration Recipes

`<a11y-control>` is **100% SSR-safe** and framework-agnostic.

### React & Next.js (App Router & Pages Router)
```tsx
'use client';
import { useEffect } from 'react';

export default function AccessibilityWidget() {
  useEffect(() => {
    import('a11y-control');
  }, []);

  return <a11y-control lang="en" position="bottom-right" />;
}
```

### Astro
```astro
---
// In your BaseLayout.astro
---
<a11y-control lang="en" position="bottom-right"></a11y-control>

<script>
  import 'a11y-control';
</script>
```

### Vue 3 & Nuxt
```vue
<template>
  <ClientOnly>
    <a11y-control lang="fr" position="bottom-right" />
  </ClientOnly>
</template>

<script setup>
import 'a11y-control';
</script>
```

### Shopify (`theme.liquid`)
Paste right before `</body>` in your `theme.liquid`:
```liquid
<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control" data-auto-mount data-lang="{{ request.locale.iso_code }}"></script>
```

### WordPress (`footer.php` or Functions.php)
```php
function add_a11y_control_script() {
    echo '<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control" data-auto-mount></script>';
}
add_action('wp_footer', 'add_a11y_control_script');
```

### ⚡ Zero-FOUC Anti-Flicker Snippet (Recommended for Production)
Because ES modules are deferred by modern browsers, a user with Dark Mode or Text Scaling enabled may see a momentary flash of unstyled content before the component hydrates. 

Paste this tiny 2-line inline script into your `<head>` to restore saved preferences **instantly before the first paint**:
```html
<script>
  (function(){try{
    var p=JSON.parse(localStorage.getItem('a11y-prefs')||'{}');
    if(p.darkMode)document.documentElement.classList.add('a11y-dark-mode');
    if(p.highContrast)document.documentElement.classList.add('a11y-high-contrast');
    if(p.fontScale&&p.fontScale!==1)document.documentElement.style.fontSize=(p.fontScale*100)+'%';
  }catch(e){}})();
</script>
```

---

## ⚙️ Attributes & Modular Feature Gating

`<a11y-control>` is **100% modular**. You don't have to impose all 13 assistive tools on your users if some don't fit your website architecture or if you already provide your own features (e.g. an existing dark mode theme toggle).

### Attributes Reference

| Attribute | Values | Default | Description |
|---|---|---|---|
| `lang` | `"en"` \| `"fr"` \| custom | `"en"` | Interface language (auto-detects from `<html>` or `navigator.language`) |
| `position` | `"bottom-right"` \| `"bottom-left"` \| `"top-right"` \| `"top-left"` | `"bottom-right"` | Screen corner for the floating trigger button |
| `features` | Comma-separated keys | `undefined` (all) | **Whitelist mode**: display *only* the listed tools |
| `exclude` | Comma-separated keys | `undefined` (none) | **Blacklist mode**: display all tools *except* the listed ones |

### Available Feature Keys for `features` / `exclude`

| Key | Section | Description |
|---|---|---|
| `fontSize` (or `fontScale`) | Typography | Stepper from 80% to 200% with live screen reader readouts |
| `highContrast` | Display | High contrast black background, white text, yellow links |
| `grayscale` | Display | Monochrome grayscale filter |
| `highlightLinks` | Display | High-visibility underlines and outline halos on interactive links |
| `bigCursor` | Display | High-contrast enlarged cursor |
| `dyslexiaFont` | Reading & Focus | OpenDyslexic specialized typeface |
| `textSpacing` | Reading & Focus | WCAG 1.4.12 letter, word, and line spacing override |
| `alignLeft` | Reading & Focus | Eliminates text justification and hyphenation |
| `readingGuide` | Reading & Focus | Horizontal reading ruler tracking pointer position |
| `readingMask` | Reading & Focus | Dimmed screen overlay with clear focal slit for ADHD & focus |
| `reduceMotion` | Reading & Focus | Disables transitions and animations (0.001ms) |
| `speechSynthesis` (or `speech`) | Voice & Tools | Web Speech API audio reader with karaoke streaming dock |
| `darkMode` | Theme | Deep dark theme |

### Practical Configuration Scenarios

#### 1. Blacklist: "My site already has its own Dark Mode toggle"
Avoid duplicate theme switchers by simply excluding `darkMode`:
```html
<a11y-control exclude="darkMode"></a11y-control>
```

#### 2. Blacklist: Exclude several tools
```html
<a11y-control exclude="darkMode, grayscale, readingMask"></a11y-control>
```

#### 3. Whitelist: "I only want reading & dyslexia tools for a blog / news site"
Display only text scaling, dyslexia font, text spacing, and the reading guide:
```html
<a11y-control features="fontSize, dyslexiaFont, textSpacing, readingGuide"></a11y-control>
```

#### 4. Whitelist: "Voice-only assistive reader"
Provide an on-demand Text-to-Speech tool without extra visual toggles:
```html
<a11y-control features="speechSynthesis"></a11y-control>
```

#### 5. Dynamic Reactivity (Change features on the fly via JavaScript)
Because `features` and `exclude` are observed attributes (`observedAttributes`), `<a11y-control>` automatically and instantly re-renders its panel whenever you update them in JavaScript — zero reload required:
```javascript
const a11y = document.querySelector('a11y-control');

// Dynamically hide dark mode
a11y.setAttribute('exclude', 'darkMode');

// Or switch to a minimal whitelist
a11y.setAttribute('features', 'fontSize, highContrast');

// Clear filters to restore all 13 tools
a11y.removeAttribute('exclude');
a11y.removeAttribute('features');
```

---

## 🎛️ 13 Assistive Features & Standards Alignment

To maintain technical integrity, `<a11y-control>` strictly separates **genuine assistive presentation overrides** from **ergonomic comfort and simulation tools**:

### 1. Assistive Presentation Overrides (WCAG 2.1 & 2.2 Criteria)

| Control | Effect on Document | Addressed Criterion | Level |
|---|---|---|---|
| 🔡 **Font Size** | Scales root typography (80% → 200%) via `rem` baseline with `aria-live` announcements | **1.4.4 Resize Text** | AA |
| 📐 **Text Spacing** | Sets line-height: 1.6, letter-spacing: 0.12em, word-spacing: 0.16em | **1.4.12 Text Spacing** | AA |
| 📏 **Align Left** | Eliminates text justification and hyphens to remove distracting white rivers | **1.4.8 Visual Presentation** | AAA |
| ⏸ **Reduce Motion** | Sets transitions/animations to 0.001ms, pauses HTML5 videos and Web Animations | **2.3.3 Animation from Interactions** | AAA |
| ◑ **High Contrast** | Forces high-contrast palette (black background, white text, yellow links) | **1.4.6 Contrast Enhanced** | AAA |
| 🔗 **Highlight Links** | Applies bold underlines and contrasting outline halos to interactive links | **1.4.1 Use of Color** | A |
| 🎙️ **Text to Speech** | Web Speech API audio selection with voice selector and synchronized karaoke dock | **1.2.1 Audio-only / Cognitive** | A |

> [!NOTE]
> **Typography Scaling vs Native Browser Zoom**: The font scaler adjusts the document's root font size (`html { font-size: X% }`), which scales typography across designs built with relative units (`rem`, `em`). Users who prefer full-page raster/layout zoom can continue using their browser's native zoom (`Cmd/Ctrl + +/-`), which is fully supported and unhindered.

### 2. Ergonomic Comfort & Simulation Aids

| Feature | Category | Purpose |
|---|---|---|
| ⬛ **Monochrome / Grayscale** | Simulation & Visual Aid | Desaturates document (`filter: grayscale(100%)`). Useful for developers to test information hierarchy without color (WCAG 1.4.1 verification) and for users with severe photophobia. *Note: Grayscale does not substitute for 1.4.11 non-text contrast ratios.* |
| T **Dyslexia-Friendly Font** | Cognitive Comfort | Applies a resilient dyslexia-optimized font stack (`'OpenDyslexic', 'Comic Sans MS', 'Lexend', Arial, sans-serif`). Zero external network requests by default (100% CSP safe). |
| — **Reading Guide** | Focal Tracking | Ruler guide bar smoothly tracking pointer Y position for cognitive tracking (ADHD). |
| 🔲 **Reading Mask** | Focal Concentration | Dimmed screen overlay with a 76px clear focal slit to isolate reading lines. |
| 🎯 **Big Cursor** | Motor & Low Vision | Universal 32x32px high-visibility cursor with crisp white border (encoded as base64 PNG for universal browser security). |
| 🌙 **Dark/Light Mode** | Photophobia Comfort | Deep obsidian theme preserving photography & media contrast. Devs can override via `html.a11y-dark-mode`. |

Preferences are **automatically saved** in `localStorage` and respect OS preferences (`prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast: more`, and `forced-colors: active`) on first visit.

> [!TIP]
> **Performance Architecture (< 10 kB Initial Load)**:
> To preserve maximum speed for all users, the complete SpeechSynthesis engine ([src/speech.js](src/speech.js)) and its styles are **dynamically lazy-loaded on demand** (`import('./speech.js')`) only when the user turns on Text-to-Speech (or if restored from `localStorage`). The initial core bundle is **under 10 kB after minification** (Brotli/Gzip). Source files are shipped unminified — minify with your own bundler or `npx terser src/a11y-control.js ... -o dist/a11y-control.min.js`.

---

## ♿ Accessibility & W3C WAI-ARIA Conformance

`<a11y-control>` is designed to achieve **100% WCAG AAA** conformance:

* **W3C APG Modal Dialog Pattern**: Declares `role="dialog"`, `aria-modal="true"`, `aria-label`, and `aria-expanded` on the trigger.
* **Strict Focus Trap & Restoration**: Focus automatically lands on `#close-btn` upon opening. Pressing `Tab` / `Shift+Tab` cycles strictly inside the dialog. Closing restores focus to the trigger button.
* **Emergency Escape**: Pressing `Escape` closes the panel, halts any active speech synthesis, and returns focus.
* **Semantic Heading Navigation (WCAG 1.3.1)**: Section dividers use semantic `<h3>` headings so screen reader users can jump directly from group to group using the **H** key.
* **Enhanced Switch Contrast (WCAG 1.4.11)**: Switches feature a `1.5px` border with > 3:1 contrast ratio against the background, even when turned off.
* **Accessible Inputs**: All toggles use native `<input type="checkbox" role="switch">` linked to `<label>` elements, operable via both `Space` and `Enter`.

---

## 💻 Public JavaScript API

`<a11y-control>` registers its active instance on `window.a11y`:

```javascript
const a11y = document.querySelector('a11y-control') || window.a11y;

// Programmatic panel control
a11y.open();
a11y.close();
a11y.toggle();

// Get & Set preferences
a11y.setPref('textSpacing', true);
a11y.setPref('fontScale', 1.3);
const prefs = a11y.getPrefs();

// Reset all preferences
a11y.reset();

// Automated DOM Accessibility Audit
const report = a11y.audit();
console.log(report);
// { issuesCount: 2, missingAlt: 1, unlabeledInputs: 1, emptyButtons: 0, details: [...] }

// Extend with custom translations
import { A11yControl } from 'a11y-control';
A11yControl.registerLocale('es', {
  triggerLabel: 'Ajustes de accesibilidad',
  title: 'Accesibilidad',
  close: 'Cerrar',
  // ...
});
```

---

## 📡 Custom Events

Events bubble and cross the Shadow DOM barrier (`composed: true`):

```javascript
// React to any setting change (ideal for analytics & app stores)
window.addEventListener('a11y-change', (e) => {
  console.log('Modified key:', e.detail.key);
  console.log('New value:', e.detail.value);
  console.log('Full preferences:', e.detail.prefs);
});

// Panel visibility events
window.addEventListener('a11y-open', () => console.log('Panel opened'));
window.addEventListener('a11y-close', () => console.log('Panel closed'));
window.addEventListener('a11y-reset', (e) => console.log('Reset:', e.detail.prefs));
```

---

## 🎨 Theming & Customization

### CSS Custom Properties

All visual tokens are exposed as CSS custom properties on the `<a11y-control>` element:

```css
a11y-control {
  --a11y-accent:       #005fcc;   /* Primary accent (buttons, focus rings) */
  --a11y-accent-hover: #0047a3;
  --a11y-bg:           #ffffff;   /* Panel background */
  --a11y-surface:      #f5f5f5;   /* Surface / hover background */
  --a11y-border:       #d0d0d0;
  --a11y-text:         #1a1a1a;
  --a11y-text-muted:   #555555;
  --a11y-radius:       12px;
  --a11y-shadow:       0 8px 32px rgba(0, 0, 0, 0.18);
  --a11y-transition:   0.18s ease;
}
```

### Custom Classes on the Host Element

You can use any CSS class or attribute selector on `<a11y-control>` to change its appearance without touching the source — the custom properties cascade into the Shadow DOM automatically:

```html
<a11y-control class="my-brand" lang="en"></a11y-control>
```

```css
/* Override accent and background for your brand */
a11y-control.my-brand {
  --a11y-accent:  #e63946;
  --a11y-bg:      #1a1a2e;
  --a11y-text:    #eaeaea;
}

/* Reposition or resize the floating trigger button */
a11y-control.my-brand {
  --a11y-trigger-size: 56px;  /* Default: 52px */
}
```

### Exposed `::part()` (trigger button)

The floating trigger button exposes a CSS Part for fine-grained external styling without needing Shadow DOM piercing:

```css
/* Style the floating accessibility button */
a11y-control::part(trigger) {
  background: #e63946;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(230, 57, 70, 0.4);
}
```

> [!NOTE]
> **Big Cursor implementation**: The high-visibility cursor is encoded as a base64 PNG (`data:image/png;base64,...`) instead of SVG. This is intentional — SVG data URIs for `cursor` are blocked by most browsers for security reasons. The PNG approach guarantees universal compatibility across Chrome, Firefox, Safari, and Edge.

### Classes applied to `<html>`

These classes are toggled directly on the root element, so your own CSS can react to them freely:

```css
/* Example: apply your own dark palette when the user enables dark mode */
html.a11y-dark-mode .hero { background: #0d1117; }
html.a11y-text-spacing article { max-width: 65ch; } /* Give breathing room */
```

| Class | Triggered by |
|---|---|
| `html.a11y-high-contrast` | High Contrast toggle |
| `html.a11y-grayscale` | Grayscale toggle |
| `html.a11y-dyslexia` | Dyslexia Font toggle |
| `html.a11y-text-spacing` | Text Spacing toggle |
| `html.a11y-align-left` | Align Left toggle |
| `html.a11y-big-cursor` | Big Cursor toggle |
| `html.a11y-reduce-motion` | Reduce Motion toggle |
| `html.a11y-highlight-links` | Highlight Links toggle |
| `html.a11y-dark-mode` | Dark Mode toggle |

---

## 🤖 Agent-Ready & AI Support

`<a11y-control>` is designed for modern autonomous development environments:

1. **`_agent/skills/accessibility-integration`**: Pre-packaged Agent Skill for Cursor, Antigravity, Claude Code, and Windsurf instructing AI assistants how to integrate and maintain compatibility.
2. **`llms.txt`**: Machine-readable context manifest located at the root for instant LLM ingestion.
3. **Machine-Readable DOM State**: Root element carries `data-a11y-state` attribute with serialized JSON preferences.
4. **Tool Calling Ready**: JSON schema provided in `llms.txt` for chatbot/voice assistant integrations.
5. **TypeScript Definitions**: Complete `.d.ts` definitions included in `src/a11y-control.d.ts`.

---

## 🏢 Enterprise & Regulatory Compliance (B2B Procurement)

`<a11y-control>` is engineered to satisfy enterprise procurement and compliance audits:

| Audit Dimension | Evaluation | Technical Guarantee |
|---|---|---|
| **European Accessibility Act (EAA 2025/2026)** | ✅ Meets Personalization Criteria | Provides mandatory text resizing (1.4.4), un-justification (1.4.8), spacing (1.4.12), and contrast (1.4.6). |
| **RGAA 4.1 & BITV 2.0** | ✅ Opposable Conformance | Directly implements client presentation adjustments required by French and German administrative criteria. |
| **ADA Title III & Section 508** | ✅ Safe Assistive Companion | No false "automatic compliance waivers". Pure client-side assistive instrument companion. |
| **GDPR / ePrivacy Directive** | 🛡️ 100% Compliant | **Zero cookies, zero telemetry, zero analytics**. User preferences reside strictly in local `localStorage`. |
| **Content Security Policy (CSP)** | ⚡ Strict CSP Safe | Zero dynamic external script execution. Air-gapped and intranet environment ready. |
| **Core Web Vitals Impact** | 🚀 Zero Regression | Initial core transfer < 10 kB. Text-to-Speech audio engine is lazy-loaded on demand. |

---

## ❓ Frequently Asked Questions & Technical Concepts (LLM / GEO Reference)

### What is `<a11y-control>`?
`<a11y-control>` is an open-source, framework-agnostic native Web Component that injects a high-performance, WCAG 2.1 AA/AAA compliant accessibility toolbar into any web page with zero dependencies.

### How does `<a11y-control>` differ from React Aria, Radix UI, or Base UI?
React Aria and Radix UI are **headless primitive building blocks** reserved exclusively for React applications: they provide unstyled logic (hooks/primitives) that require developers to design, code, and test their own UI from scratch. In contrast, `<a11y-control>` is a **drop-in assistive companion toolbar** with a turnkey, fully-styled Shadow DOM interface that works across any tech stack (React, Vue, Astro, Shopify, WordPress, or Vanilla HTML).

### Is `<a11y-control>` an open-source alternative to UserWay or accessiBe?
Yes. Unlike commercial overlay widgets that inject 500 kB+ of proprietary trackers, charge expensive annual subscriptions, and face legal lawsuits for claiming "automated ADA compliance", `<a11y-control>` is 100% free and open source (MIT), lightweight (< 10 kB), strictly respects user privacy (0 cookies), and provides authentic user-driven accessibility enhancements without deceptive legal promises.

### Does `<a11y-control>` support Next.js App Router and Server-Side Rendering (SSR)?
Yes. `<a11y-control>` is built with SSR-safe checks (`typeof HTMLElement !== 'undefined'`). In Next.js (App Router or Pages Router), simply load it within a client component or via dynamic import, without any server-side hydration mismatches.

### How can I integrate `<a11y-control>` without writing any JavaScript?
Simply add a single `<script>` tag with the `data-auto-mount` attribute to your HTML document:
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control" data-auto-mount></script>
```
The component automatically mounts to `document.body` on page load.

---

## License

MIT — feel free to use, modify, and distribute.
