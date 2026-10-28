# Installation
Requirements: Node.js ≥ 20, npm, Chrome with side-panel support (116+ (sidePanel.open)).
```bash
npm ci
npm run build      # outputs dist/
```
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. **Load unpacked** → select the `dist/` folder.
4. Pin GeoPilot; click the icon for the popup, or press Alt+G.
`npm run package` creates the release ZIP under `release/`.
