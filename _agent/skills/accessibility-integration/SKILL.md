---
name: Integrate Accessibility Menu
description: How to integrate the <accessibility-menu> web component into a web project (Vanilla, React, Vue, etc.)
---

# Integrate Accessibility Menu

Use this skill to quickly add a production-ready accessibility menu to any website or application.

## 📋 Prerequisites
The project must support ES Modules (modern browsers or a bundler like Vite/Webpack).

## 🛠 Integration Steps

### 1. Identify the Entry Point
Locate the main HTML file (`index.html`) or the root component of the application.

### 2. Load the Component
Insert the script tag to load the Web Component.

**Vanilla HTML:**
```html
<script type="module" src="./src/accessibility-menu.js"></script>
```

**NPM (if installed):**
```javascript
import 'accessibility-menu';
```

### 3. Insert the Tag
Add the `<accessibility-menu>` tag before the closing `</body>` tag.

**Basic Configuration:**
```html
<accessibility-menu lang="en" position="bottom-right"></accessibility-menu>
```

### 4. Configuration Options
| Attribute | Description | Options | Default |
|---|---|---|---|
| `lang` | UI Language | `en`, `fr` | `en` |
| `position` | Button position | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` |

## 🎨 Professional Recommendation: Theming
Suggest to the user to customize the menu colors to match their brand using CSS variables in their global stylesheet:

```css
accessibility-menu {
  --a11y-accent: #your-brand-color;
  --a11y-radius: 8px;
}
```

## 🧩 Developing Compatible Components

To ensure that **new components** created in this project automatically respect the accessibility features, follow these rules:

### 1. Font Sizes (Inheritance)
**NEVER** use hardcoded `px` for font sizes. Always use `rem`, `em`, or percentage.
- **Why**: The menu scales `html { font-size: % }`. Using `rem` ensures all your components scale proportionally (80% to 200%).

### 2. Colors & Contrast
Use CSS Variables for your theme colors and add overrides for high-contrast mode.
```css
.my-component {
  background: var(--bg-color, #fff);
  color: var(--text-color, #1a1a1a);
}

/* React to the high-contrast class on <html> */
html.a11y-high-contrast .my-component {
  background: #000 !important;
  color: #fff !important;
  border: 1px solid #fff;
}
```

### 3. Reduced Motion
Use the global class to kill animations if the user requests it.
```css
html.a11y-reduce-motion *,
html.a11y-reduce-motion *::before,
html.a11y-reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

### 4. Links & Interactive Elements
Ensure all interactive elements have highly visible focus rings, especially for `html.a11y-high-contrast` and `html.a11y-highlight-links`.

## ⚖️ Mandatory Legal Disclosure
When integrating, always inform the user that this tool is an **assistive aid** and not a substitute for a full accessibility audit.

## 🤖 Agent Verification Loop
1. Check if the script is loaded correctly.
2. Verify the tag is present in the DOM.
3. Check for console errors related to module paths.
