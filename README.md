# `<accessibility-menu>`

> A plug-and-play accessibility menu, **WCAG 2.1 AA** compliant, built as a native Web Component.  
> Zero dependencies. Zero build. One single tag.

**[🌐 Live Demo](https://quentinmerle.github.io/accessibility-menu/demo/)**

---

## ⚖️ Legal Disclaimer

This component is an assistive tool designed to improve user experience, but please note:
- **Assistive Aid Only**: Using this menu does not automatically guarantee compliance with legal standards (like WCAG, ADA, or Section 508).
- **Not an Audit**: It is not a substitute for professional accessibility testing or certified audits.
- **Liability**: Website owners are responsible for their own site's legal compliance. This software is provided "as-is" without warranty of any kind.

---

## ⚡ Quick Start — 30 Seconds

```html
<!-- 1. Load the component -->
<script type="module" src="./src/accessibility-menu.js"></script>

<!-- 2. Add the tag (before </body>) -->
<accessibility-menu lang="en"></accessibility-menu>
```

That's it. The component handles the rest.

---

## Project Integration

### Vanilla HTML
```html
<script type="module" src="./src/accessibility-menu.js"></script>
<accessibility-menu lang="en"></accessibility-menu>
```

### React / Next.js
```jsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Dynamic import to ensure it only runs on the client
    import('./path/to/accessibility-menu.js');
  }, []);

  return (
    <>
      {/* your app */}
      <accessibility-menu lang="en" />
    </>
  );
}
```

### Vue
```vue
<template>
  <accessibility-menu lang="en" />
</template>

<script setup>
import './path/to/accessibility-menu.js';
</script>
```

### Via npm (local)
```js
import './node_modules/accessibility-controls/src/accessibility-menu.js';
```

---

## Attributes

| Attribute | Values | Default |
|---|---|---|
| `lang` | `"en"` \| `"fr"` | `"en"` |
| `position` | `"bottom-right"` \| `"bottom-left"` \| `"top-right"` \| `"top-left"` | `"bottom-right"` |

```html
<!-- Examples -->
<accessibility-menu lang="fr" position="bottom-left"></accessibility-menu>
<accessibility-menu lang="en" position="top-right"></accessibility-menu>
```

---

## Features

| Control | Effect | WCAG Success Criterion |
|---|---|---|
| 🔡 Font Size | 80% → 200% (10% increments) | 1.4.4 Resize Text |
| ◑ High Contrast | Black background, white text, yellow links | 1.4.6 Contrast Enhanced |
| ⬛ Grayscale | `filter: grayscale(100%)` on `<html>` | 1.4.11 Non-text Contrast |
| 🔗 Highlight Links | Bold + outline on all `<a>` tags | 1.4.1 Use of Color |
| T Dyslexia Font | OpenDyslexic loaded on demand | 1.4.8 Visual Presentation |
| — Reading Guide | Horizontal bar following the cursor | 1.4.8 Visual Presentation |
| ⏸ Reduce Motion | All transitions/animations set to 0ms | 2.3.3 Animation |
| 🌙 Dark/Light Mode | Toggles dark theme for the page and menu | 1.4.3 Contrast (Minimum) |

Preferences are **automatically saved** in `localStorage` and restored on every visit.

---

## Theming — CSS Custom Properties

Customize the appearance from your global stylesheet (variables are exposed via `:host`):

```css
accessibility-menu {
  --a11y-accent:       #005fcc;   /* Primary color (buttons, active toggles) */
  --a11y-accent-hover: #0047a3;
  --a11y-bg:           #ffffff;   /* Panel background */
  --a11y-surface:      #f5f5f5;   /* Row background on hover */
  --a11y-border:       #d0d0d0;
  --a11y-text:         #1a1a1a;
  --a11y-text-muted:   #555555;
  --a11y-radius:       12px;
  --a11y-shadow:       0 8px 32px rgba(0, 0, 0, 0.18);
}
```

---

## CSS Classes Applied to `<html>`

The component toggles these classes so **your own CSS** can also react:

| Class | Active when |
|---|---|
| `a11y-high-contrast` | High Contrast enabled |
| `a11y-grayscale` | Grayscale enabled |
| `a11y-dyslexia` | Dyslexia Font enabled |
| `a11y-reduce-motion` | Reduce Motion enabled |
| `a11y-highlight-links`| Highlight Links enabled |
| `a11y-dark-mode` | Dark Mode enabled |

```css
/* Example — adapt your design to High Contrast mode */
html.a11y-high-contrast .hero {
  border: 2px solid #fff;
}
```

---

## Keyboard & Accessibility

The component is fully keyboard-operable:

| Key | Action |
|---|---|
| `Tab` | Navigate between controls |
| `Shift + Tab` | Navigate backward |
| `Enter` / `Space` | Activate a button or toggle |
| `Escape` | Close the panel, return focus to trigger button |

**Built-in ARIA:** `role="dialog"`, `aria-modal`, `aria-expanded`, `aria-checked` (`role="switch"`), `aria-live` on the font size counter, focus trap, and focus restoration.

---

## Project Structure

```
src/
├── accessibility-menu.js    ← Entry point (import/script this)
├── AccessibilityMenu.js     ← Custom Element class
├── constants.js             ← Default preferences, i18n
├── icons.js                 ← SVG icons
├── styles.js                ← Shadow CSS + global styles
└── reading-guide.js         ← Reading guide feature
```

---

## Local Development

```bash
# Start a dev server
npm run dev
# → http://localhost:3000/demo/
```

---

## Browser Compatibility

All modern browsers supporting **Custom Elements v1 + Shadow DOM**:

| Chrome | Firefox | Safari | Edge |
|---|---|---|---|
| ✅ 67+ | ✅ 63+ | ✅ 12.1+ | ✅ 79+ |

---

## License

MIT — feel free to use, modify, and distribute.
