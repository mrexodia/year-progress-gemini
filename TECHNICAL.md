# TECHNICAL.md

This document records technical decisions made during the development of the Year Progress PWA.

## Technology Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript. No framework.
- **Data Storage:** Browser LocalStorage.
- **PWA:** Service Worker for offline capabilities and `manifest.json` for installability.
- **Hosting:** TBD (likely Netlify or GitHub Pages).

## File Structure

```
/
├── index.html         # Main app page
├── styles.css         # All styles
├── app.js             # Main application logic
├── manifest.json      # PWA manifest
├── sw.js              # Service worker
├── icons/             # App icons
├── AGENTS.md
├── PLAN.md
├── VISION.md
└── TECHNICAL.md
```

## Icons

- Placeholder icons are needed. Final icons will be created in Phase 6. For now, the `icons` directory is created but may be empty. This will cause the `apple-touch-icon` and manifest icons to fail to load, which is expected at this stage.

## Browser Compatibility

- The app is targeted at modern evergreen browsers on both mobile and desktop.
- No support for IE11 or other legacy browsers is planned.

## Skipped Features

- **Month Indicators (Phase 5.3):** The implementation of month indicators or separators in the main grid was deemed too complex for the value it would add to the user experience. Several approaches were considered (e.g., changing the grid layout, inserting separator elements), but all added significant complexity to the grid rendering logic. To maintain simplicity and focus on core features, this was deferred.
