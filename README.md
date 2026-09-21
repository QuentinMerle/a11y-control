# `<a11y-control>` (A11yControl)

> A plug-and-play accessibility toolbar and assistive aid for the web, **WCAG 2.1 AA/AAA** compliant, built as a native Web Component.  
> Zero dependencies. Zero build required. High performance (< 10 kB initial load). 100% GDPR & privacy compliant (no cookies, no tracking). **Agent-Ready**.

**[🌐 Live Demo & Documentation](https://quentinmerle.github.io/a11y-control/demo/)**

---

## ⚖️ Legal Disclaimer

This component is an assistive aid designed to improve user experience:
- **Assistive Aid Only**: Using this toolbar does not automatically guarantee full legal compliance with accessibility mandates (such as WCAG, ADA, Section 508, or the European Accessibility Act).
- **Not an Audit**: It is not a substitute for professional manual accessibility audits or certified testing.
- **Liability**: Website owners remain responsible for their own site's legal compliance. Provided "as-is" under MIT license.

---

## ⚡ Quick Start — 30 Seconds

### Via CDN (Zero Install)
```html
<!-- Load the component directly -->
<script type="module" src="https://cdn.jsdelivr.net/npm/a11y-control/src/a11y-control.js"></script>

<!-- Add the tag -->
<a11y-control lang="en"></a11y-control>
```

### Via NPM (Recommended for modern web apps)
```bash
npm install a11y-control
```

```javascript
// ES Module import
import 'a11y-control';
// Or import the class directly:
import { A11yControl } from 'a11y-control';
```

```html
<a11y-control lang="en" position="bottom-right"></a11y-control>
```

---

## Project Integration

### Vanilla HTML
```html
<script type="module" src="./node_modules/a11y-control/src/a11y-control.js"></script>
<a11y-control lang="fr"></a11y-control>
```

### React / Next.js
```jsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Dynamic import to execute only on the client
    import('a11y-control');
  }, []);

  return <a11y-control lang="en" />;
}
```

### Vue 3
```vue
<template>
  <a11y-control lang="fr" />
</template>

<script setup>
import 'a11y-control';
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

## 🎛️ 13 Assistive Features & WCAG Mapping

| Control | Effect | WCAG Success Criterion |
|---|---|---|
| 🔡 **Font Size** | 80% → 200% in 10% increments (`aria-live` readout) | 1.4.4 Resize Text (AA) |
| ◑ **High Contrast** | Black background, white text, yellow links | 1.4.6 Contrast Enhanced (AAA) |
| ⬛ **Grayscale** | Desaturates document (`filter: grayscale(100%)`) | 1.4.11 Non-text Contrast (AA) |
| 🔗 **Highlight Links** | Bold underline + outline on all `<a>` tags | 1.4.1 Use of Color (A) |
| 🎯 **Big Cursor** | Universal 32x32px high-visibility cursor with white border | Low Vision & Motor aid |
| T **Dyslexia Font** | Loads and applies OpenDyslexic on demand | 1.4.8 Visual Presentation (AAA) |
| 📐 **Text Spacing** | Line-height 1.6, letter-spacing 0.12em, word-spacing 0.16em | **1.4.12 Text Spacing (AA)** |
| 📏 **Align Left** | Eliminates justification and hyphens (`text-align: left`) | **1.4.8 Visual Presentation (AAA)** |
| — **Reading Guide** | Ruler guide bar smoothly tracking pointer Y position | 1.4.8 Visual Presentation (AAA) |
| 🔲 **Reading Mask** | Dimmed screen overlay with a 76px clear focal slit | ADHD, Autism & Cognitive Focus |
| ⏸ **Reduce Motion** | Sets all CSS transitions/animations to 0.001ms | 2.3.3 Animation from Interactions (AAA) |
| 🎙️ **Text to Speech** | Voice selector, speed pills, test audio & word-by-word streaming karaoke | 1.2.1 Audio-only / Cognitive |
| 🌙 **Dark/Light Mode** | Deep obsidian theme preserving photography & media | 1.4.3 Contrast Minimum (AA) |

Preferences are **automatically saved** in `localStorage` and respect OS preferences (`prefers-color-scheme`, `prefers-reduced-motion`) on first visit.

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

## License

MIT — feel free to use, modify, and distribute.
