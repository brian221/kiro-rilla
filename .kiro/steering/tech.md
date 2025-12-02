# Technology Stack

## Core Technologies
- **Vanilla JavaScript (ES6+)** - No frameworks or build tools required
- **HTML5 Canvas API** - For 2D rendering and game graphics
- **Web Audio API** - For procedural sound effects (throw, hit, win sounds)
- **CSS3** - For layout and styling

## Architecture
- Single-file game logic (`game.js`) with immediate execution
- No build system - runs directly in browser
- Game loop using `requestAnimationFrame` for 60 FPS target
- State machine pattern for game states: `start`, `playerTurn`, `playing`, `gameOver`

## Key Libraries & APIs
- Native Canvas 2D context for all rendering
- AudioContext for synthesized sound effects
- Image API for sprite loading (Kiro logo)

## Running the Game
Simply open `index.html` in a modern web browser. No compilation, bundling, or server required.

## Development Workflow
- Edit files directly and refresh browser to see changes
- Use browser DevTools console for debugging
- No package manager or dependencies to install
