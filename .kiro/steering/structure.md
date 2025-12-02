# Project Structure

## File Organization

```
/
├── .kiro/                          # Kiro AI assistant configuration
│   └── steering/                   # Steering rules for AI guidance
│       ├── app-building-rules.md   # Workshop-specific development guidelines
│       └── game-style-guide.md     # Visual design and color scheme rules
├── game.js                         # Main game logic and rendering
├── index.html                      # Entry point and canvas container
├── style.css                       # Layout and UI styling
├── kiro-logo.png                   # Player sprite image
└── prompt.txt                      # Original game specification
```

## Code Organization (game.js)

The game follows a clear structure:

1. **Constants & Configuration** - Game parameters (gravity, speed, win conditions)
2. **State Management** - Game state variables and player data
3. **Asset Loading** - Image and audio context initialization
4. **Sound Functions** - Procedural audio generation (throw, hit, win)
5. **Initialization Functions** - Building generation, player setup, game reset
6. **Visual Effects** - Particles, screen shake, splatter effects
7. **Drawing Functions** - Rendering for buildings, players, UI, goo projectiles
8. **Game Logic** - Meter updates, physics, collision detection
9. **Game Loop** - Main render/update cycle at 60 FPS
10. **Event Handlers** - Keyboard and mouse input

## Conventions

- All game constants use SCREAMING_SNAKE_CASE
- Functions use camelCase naming
- Canvas context stored in global `ctx` variable
- Game state managed through string-based state machine
- Frame-based timing (frameCount) for animations and updates
