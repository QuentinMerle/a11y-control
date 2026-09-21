---
name: Integrate A11yControl
description: How to integrate, configure, and maintain accessibility with the <a11y-control> web component in any project.
---

# Integrate A11yControl

Use this skill to quickly add and maintain a production-ready, WCAG 2.1 AA/AAA compliant accessibility toolbar in any web project.

## 📋 Prerequisites
The host project must support ES Modules (modern browser or bundler like Vite, Next.js, Nuxt, Astro, Webpack).

---

## 🛠️ Integration Steps

### 1. Load the Component

**Via NPM (recommended):**
```bash
npm install a11y-control
```
```javascript
import 'a11y-control';
// Or import the class:
import { A11yControl } from 'a11y-control';
```

**Via CDN (zero-install):**
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control/src/a11y-control.js"></script>
```

### 2. Insert the Tag
Add `<a11y-control>` in your root HTML template (e.g. before closing `</body>`) or root layout component.

```html
<a11y-control lang="en" position="bottom-right"></a11y-control>
```

### 3. Attributes & Modular Features
| Attribute | Description | Options | Default |
|---|---|---|---|
| `lang` | UI Language | `en`, `fr` | `en` |
| `position` | Button position | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` |
| `features` | Whitelist of controls | e.g. `fontSize,highContrast,textSpacing` | All |
| `exclude` | Blacklist of controls | e.g. `darkMode,grayscale` | None |

---

## 🎛️ Controlling via JavaScript API

The component automatically registers itself on `window.a11y` upon mounting:

```javascript
// Programmatic panel control (e.g. from your own navbar button)
window.a11y.open();
window.a11y.close();
window.a11y.toggle();

// Get & Set preferences
window.a11y.setPref('textSpacing', true);
window.a11y.setPref('fontScale', 1.3);
const prefs = window.a11y.getPrefs();

// Reset to system defaults
window.a11y.reset();
```

### Listening to Custom Events
```javascript
window.addEventListener('a11y-change', (e) => {
  console.log('Preference updated:', e.detail.key, '->', e.detail.value);
  console.log('Complete state:', e.detail.prefs);
});
```

---

## 🎨 Developing Compatible Components

When building **new components** or pages in this project, ensure they adhere to these 5 accessibility principles:

### 1. Font Sizes (Inheritance)
**NEVER** use hardcoded `px` for typography. Always use `rem`, `em`, or percentage.
* *Why:* The menu sets `html { font-size: X% }`. Using relative units ensures typography scales smoothly from 80% to 200%.

### 2. Text Spacing (WCAG 1.4.12)
Avoid fixed element heights (`height: 40px` on text containers) that might clip text when `html.a11y-text-spacing` expands line-height and word-spacing. Use `min-height` instead.

### 3. High Contrast & Dark Mode Overrides
Use CSS variables and react to the host classes:
```css
.my-card {
  background: var(--bg-surface, #fff);
  color: var(--text-primary, #111);
}

html.a11y-high-contrast .my-card {
  background: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}
```

### 4. Reduced Motion
Kill transitions and animations if requested:
```css
html.a11y-reduce-motion *,
html.a11y-reduce-motion *::before,
html.a11y-reduce-motion *::after {
  animation-duration: 0.001ms !important;
  transition-duration: 0.001ms !important;
}
```

### 5. Focus Visible
Ensure all buttons and links have distinct focus outlines:
```css
button:focus-visible, a:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

---

## 🤖 Agent Automated Verification & Repair Loop

When an AI agent finishes generating or editing a page, run this diagnostic in the browser console or test suite:

```javascript
const report = window.a11y.audit();
console.log(report);
// Returns: { issuesCount, missingAlt, unlabeledInputs, emptyButtons, details }
```

If `report.issuesCount > 0`:
1. Add missing `alt="..."` to flagged `<img>` elements.
2. Ensure every `<input>` has a matching `<label for="...">` or `aria-label`.
3. Ensure every `<button>` has visible text or an `aria-label`.
