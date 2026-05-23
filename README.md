# Blackjack Strategy Web App

A responsive, high-fidelity React single-page web application for memorizing and practicing basic blackjack strategy, ported from the iOS app.

## Features

- **Practice Mode**: Random or weighted hands with immediate feedback on correct/incorrect plays. Weighted generation biases toward hands you get wrong most often.
- **Reference Mode**: Interactive, color-coded strategy charts for hard totals, soft totals, and pairs.
- **Statistics Mode**: Rolling accuracy statistics over the last 1000 plays, broken down overall, by category, and by specific hand. Persisted in `localStorage`.
- **Hand Review**: Review recent practice plays (incorrect only or all plays) to see what you played vs. the correct basic strategy action and review strategy advice.
- **340 Scenarios**: Complete basic strategy coverage with helpful advice for each situation.
- **Action Colors**: Hit (green), Stand (red), Double (orange), Split (blue) across Practice, Reference, and Hand Review screens.

## Keyboard & Desktop UX Enhancements

- **Choice Shortcuts**:
  - `H` - Hit
  - `S` - Stand
  - `D` - Double
  - `P` - Split
- **Advance Shortcuts**:
  - `Space` / `Enter` / `N` (or repeating any action key: `H`, `S`, `D`, `P`) immediately deals the next hand.
- **Zero-Mouse-Movement Transition**: When a choice is made, the action buttons instantly collapse into a single "Next Hand" button in the exact same spot. You can double-click your selection to quickly deal the next hand.
- **Table Felt Feedback Cards**: Exchanged the dark screen-blocking modal backdrop overlay for a beautiful inline glass card on the green felt table, keeping all hands and dealer cards visible at all times.

## Setup & Running

This project is built using React, Vite, and TypeScript.

### Requirements
- Node.js (v18+)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```

### Production Build
Build the optimized static assets for production deployment:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

### Running Tests
Run the Vitest unit tests:
```bash
npm run test
```

## License

This project is licensed under the Creative Commons Zero v1.0 Universal (CC0) License. See [LICENSE](LICENSE) for details.
