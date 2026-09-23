# Roche Agentic Clinical Intelligence — Interactive Architecture

A standalone HTML/CSS/JavaScript prototype for presenting an animated AI-agent solution architecture.

## Features

- Animated particles moving through the architecture
- Play / Pause / Stop controls
- Step-by-step execution
- Reset
- Clickable architecture components with contextual details
- Responsive layout
- No build step
- No npm dependencies
- Works directly on GitHub Pages

## GitHub Pages deployment

1. Create a new GitHub repository.
2. Upload:
   - `index.html`
   - `assets/styles.css`
   - `assets/app.js`
3. Open `assets/app.js`.
4. Change:

```js
ARCH_URL: "https://YOUR-USERNAME.github.io/YOUR-ARCH-REPO/"
```

to the GitHub Pages URL you want the **Arch** button to open.

5. In GitHub, go to:

**Settings → Pages → Deploy from a branch → main → / (root)**

6. Save and wait for GitHub Pages to publish the site.

Your URL will generally look like:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

## Suggested repository structure

```text
roche-agentic-architecture/
├── index.html
├── README.md
└── assets/
    ├── styles.css
    └── app.js
```

## Notes

This is a conceptual solution-architecture visualization intended for presentation/demo use. It is not a clinical decision system and should not be presented as validated medical software.
