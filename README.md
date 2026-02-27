# `<accessibility-menu>`

> Un menu d'accessibilité clé-en-main, conforme **WCAG 2.1 AA**, sous forme de Web Component natif.  
> Zéro dépendance. Zéro build. Une balise.

---

## ⚡ Quick start — 30 secondes

```html
<!-- 1. Charger le composant -->
<script type="module" src="https://cdn.example.com/accessibility-menu.js"></script>

<!-- 2. Ajouter la balise (avant </body>) -->
<accessibility-menu lang="fr"></accessibility-menu>
```

C'est tout. Le composant s'occupe du reste.

---

## Intégration dans votre projet

### HTML vanilla
```html
<script type="module" src="./src/accessibility-menu.js"></script>
<accessibility-menu lang="fr"></accessibility-menu>
```

### React / Next.js
```jsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    import('./accessibility-menu.js');
  }, []);

  return (
    <>
      {/* votre app */}
      <accessibility-menu lang="fr" />
    </>
  );
}
```

### Vue
```vue
<template>
  <accessibility-menu lang="fr" />
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

## Attributs

| Attribut | Valeurs | Défaut |
|---|---|---|
| `lang` | `"fr"` \| `"en"` | `"en"` |
| `position` | `"bottom-right"` \| `"bottom-left"` \| `"top-right"` \| `"top-left"` | `"bottom-right"` |

```html
<!-- Exemples -->
<accessibility-menu lang="fr" position="bottom-left"></accessibility-menu>
<accessibility-menu lang="en" position="top-right"></accessibility-menu>
```

---

## Fonctionnalités

| Contrôle | Effet | Critère WCAG |
|---|---|---|
| 🔡 Taille de police | 80 % → 200 % (pas de 10 %) | 1.4.4 Resize Text |
| ◑ Contraste élevé | Fond noir, texte blanc, liens jaunes | 1.4.6 Contrast Enhanced |
| ⬛ Niveaux de gris | `filter: grayscale(100%)` sur `<html>` | 1.4.11 Non-text Contrast |
| 🔗 Surligner les liens | Gras + outline sur tous les `<a>` | 1.4.1 Use of Color |
| T Police dyslexie | OpenDyslexic chargée à la demande | 1.4.8 Visual Presentation |
| — Guide de lecture | Barre horizontale qui suit la souris | 1.4.8 Visual Presentation |
| ⏸ Réduire animations | Toutes transitions/animations à 0 ms | 2.3.3 Animation |

Les préférences sont **automatiquement sauvegardées** dans `localStorage` et restaurées à chaque visite.

---

## Thèmes — CSS custom properties

Personnalisez l'apparence depuis votre feuille de style globale (les variables sont exposées via `:host`) :

```css
accessibility-menu {
  --a11y-accent:       #005fcc;   /* couleur principale (bouton, toggles actifs) */
  --a11y-accent-hover: #0047a3;
  --a11y-bg:           #ffffff;   /* fond du panel */
  --a11y-surface:      #f5f5f5;   /* fond des lignes au survol */
  --a11y-border:       #d0d0d0;
  --a11y-text:         #1a1a1a;
  --a11y-text-muted:   #555555;
  --a11y-radius:       12px;
  --a11y-shadow:       0 8px 32px rgba(0, 0, 0, 0.18);
}
```

---

## Classes CSS appliquées sur `<html>`

Le composant ajoute / retire ces classes pour que **vos propres CSS** puissent aussi réagir :

| Classe | Active quand |
|---|---|
| `a11y-high-contrast` | Contraste élevé activé |
| `a11y-grayscale` | Niveaux de gris activés |
| `a11y-dyslexia` | Police dyslexie activée |
| `a11y-reduce-motion` | Réduire animations activé |
| `a11y-highlight-links` | Surligner les liens activé |

```css
/* Exemple — adapter votre design au mode contraste élevé */
html.a11y-high-contrast .hero {
  border: 2px solid #fff;
}
```

---

## Clavier & accessibilité

Le composant est entièrement utilisable au clavier :

| Touche | Action |
|---|---|
| `Tab` | Naviguer entre les contrôles |
| `Shift + Tab` | Naviguer en arrière |
| `Enter` / `Space` | Activer un bouton ou toggle |
| `Escape` | Fermer le panel, retour au bouton déclencheur |

**ARIA intégré :** `role="dialog"`, `aria-modal`, `aria-expanded`, `aria-checked` (`role="switch"`), `aria-live` sur le compteur de police, focus trap, restauration du focus à la fermeture.

---

## Structure du projet

```
src/
├── accessibility-menu.js    ← entry point à importer/scripter
├── AccessibilityMenu.js     ← Custom Element class
├── constants.js             ← préférences par défaut, i18n
├── icons.js                 ← SVG icons
├── styles.js                ← Shadow CSS + styles globaux
└── reading-guide.js         ← feature guide de lecture
```

---

## Dev local

```bash
# Lancer un serveur de démo
npm run dev
# → http://localhost:3000/demo/
```

---

## Compatibilité navigateurs

Tous les navigateurs modernes supportant **Custom Elements v1 + Shadow DOM** :

| Chrome | Firefox | Safari | Edge |
|---|---|---|---|
| ✅ 67+ | ✅ 63+ | ✅ 12.1+ | ✅ 79+ |

---

## Licence

MIT — libre d'utilisation, modification et distribution.
