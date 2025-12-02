# Design Document

## Overview

This design extends the existing Gorilla Kiro game with six major feature enhancements: an animated intro splash screen with music, projectile trail effects, hit feedback screens, destructible buildings, variable map scaling, and a new Rapid Fire game mode. The implementation maintains the existing vanilla JavaScript architecture while adding new state management for game modes, visual effects systems, and enhanced collision detection.

## Architecture

### Game State Extensions

The existing state machine will be extended with new states and mode tracking:

```javascript
// New states
gameState: 'splash' | 'modeSelect' | 'start' | 'playerTurn' | 'playing' | 'hitFeedback' | 'gameOver'

// New mode tracking
gameMode: 'turnBased' | 'rapidFire'
```

### Audio System Enhancement

Extend the existing Web Audio API usage to include background music playback:
- Load and control theme.mp3 using HTML5 Audio element
- Maintain existing procedural sound effects for game actions
- Implement fade-in/fade-out for music transitions

### Visual Effects System

Create a modular effects system building on the existing particle system:
- Trail renderer for projectile paths
- Fade-in/fade-out overlay system for screens
- Building destruction geometry management
- Sprite animation system for bouncing Kiros

## Components and Interfaces

### 1. Splash Screen Component

**State:**
```javascript
splashState = {
    leftKiroY: 0,
    rightKiroY: 0,
    bouncePhase: 0,
    musicLoaded: false,
    themeAudio: null
}
```

**Functions:**
- `initSplash()`: Initialize splash screen state and load music
- `updateSplashAnimation()`: Update Kiro bounce positions using sine wave
- `drawSplashScreen()`: Render title, Kiros, and instructions
- `cleanupSplash()`: Stop music and transition to mode select

### 2. Trail Effect System

**Data Structure:**
```javascript
trailSegments = [
    {
        x: number,
        y: number,
        opacity: number,
        age: number,
        maxAge: number
    }
]
```

**Functions:**
- `addTrailSegment(x, y)`: Create new trail segment at projectile position
- `updateTrails()`: Age segments and remove expired ones
- `drawTrails()`: Render all active trail segments with fading opacity

### 3. Hit Feedback Screen

**State:**
```javascript
hitFeedback = {
    active: false,
    hitPlayer: number,
    fadeProgress: 0,
    displayTime: 0,
    scores: { p1: number, p2: number }
}
```

**Functions:**
- `triggerHitFeedback(playerIndex)`: Initialize feedback screen with 3-second delay
- `updateHitFeedback()`: Manage fade-in animation and timing
- `drawHitFeedback()`: Render overlay with hit information and scores

### 4. Building Destruction System

**Enhanced Building Structure:**
```javascript
building = {
    x, y, width, height,
    windows: [...],
    destroyedChunks: [
        {
            x: number,      // Relative to building
            y: number,      // Relative to building
            width: number,
            height: number
        }
    ]
}
```

**Functions:**
- `destroyBuildingChunk(building, impactX, impactY)`: Create destruction at impact point
- `checkBuildingCollision(x, y, building)`: Check if point collides considering destroyed chunks
- `drawBuilding(building)`: Render building with destroyed sections as gaps

### 5. Map Scale System

**Scale Configuration:**
```javascript
mapScale = {
    factor: number,        // 0.5 to 1.5
    buildingHeightMin: number,
    buildingHeightMax: number,
    buildingWidth: number,
    playerDistance: number
}
```

**Functions:**
- `selectMapScale()`: Randomly choose scale factor for new round
- `generateScaledBuildings(scale)`: Create buildings with scaled dimensions
- `positionPlayersWithScale(scale)`: Place players at scaled distances

### 6. Rapid Fire Mode System

**Mode-Specific State:**
```javascript
rapidFireState = {
    player1: {
        angle: number,
        force: number,
        angleDirection: number,
        forceDirection: number,
        selectingAngle: boolean,
        activeProjectiles: number
    },
    player2: {
        angle: number,
        force: number,
        angleDirection: number,
        forceDirection: number,
        selectingAngle: boolean,
        activeProjectiles: number
    },
    projectiles: [
        {
            x, y, vx, vy,
            owner: 1 | 2,
            trail: []
        }
    ]
}
```

**Functions:**
- `initRapidFireMode()`: Set up dual-player state
- `updateRapidFireMeters()`: Update both players' meters simultaneously
- `handleRapidFireInput(player, key)`: Process player-specific throw inputs
- `updateRapidFireProjectiles()`: Update all active projectiles
- `drawRapidFireUI()`: Render meters for both players

## Data Models

### Projectile Trail Segment
```javascript
{
    x: number,           // World position X
    y: number,           // World position Y
    opacity: number,     // 0.0 to 1.0
    age: number,         // Frames since creation
    maxAge: number       // Frames until removal (15-20)
}
```

### Destroyed Building Chunk
```javascript
{
    x: number,           // Relative to building origin
    y: number,           // Relative to building origin
    width: number,       // Chunk width (30-50 pixels)
    height: number       // Chunk height (30-50 pixels)
}
```

### Game Mode Configuration
```javascript
{
    mode: 'turnBased' | 'rapidFire',
    maxProjectilesPerPlayer: number,  // 1 for turn-based, 2 for rapid fire
    simultaneousPlay: boolean,
    player1ThrowKey: string,          // 'Space' or 'ShiftLeft'
    player2ThrowKey: string           // null or 'ShiftRight'
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Splash Screen Properties

Property 1: Bounce animation follows sine wave
*For any* frame during splash screen display, the Y positions of both Kiro sprites should follow a sine wave pattern based on the bounce phase, ensuring smooth periodic motion
**Validates: Requirements 1.3**

### Trail Effect Properties

Property 2: Active projectiles have trails
*For any* projectile in flight, there should exist at least one trail segment associated with that projectile
**Validates: Requirements 2.1**

Property 3: Trail opacity decreases with age
*For any* trail segment, as its age increases, its opacity should decrease monotonically until removal
**Validates: Requirements 2.2, 2.3**

Property 4: Moving projectiles generate trail segments
*For any* projectile that has moved since the last frame, a new trail segment should be created at its previous position
**Validates: Requirements 2.4**

### Hit Feedback Properties

Property 5: Fade-in progresses smoothly
*For any* hit feedback screen during its fade-in phase, the fade progress value should increase monotonically from 0 to 1
**Validates: Requirements 3.2**

### Building Destruction Properties

Property 6: Collisions create destroyed chunks
*For any* projectile-building collision, a new destroyed chunk should be added to the building's destroyedChunks array at the impact location
**Validates: Requirements 4.1**

Property 7: Destroyed chunks prevent collision
*For any* point within a destroyed chunk's boundaries, collision detection with that building should return false
**Validates: Requirements 4.2, 4.4**

### Map Scale Properties

Property 8: Scale factor within valid range
*For any* newly initialized round, the selected map scale factor should be within the defined minimum and maximum bounds (0.5 to 1.5)
**Validates: Requirements 5.1**

Property 9: Scale affects dimensions proportionally
*For any* map scale factor, building heights, widths, and player distances should be proportional to that scale factor
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

### Rapid Fire Mode Properties

Property 10: Player input creates projectiles when under limit
*For any* player in Rapid Fire mode with fewer than 2 active projectiles, pressing their throw key should create a new projectile with that player as owner
**Validates: Requirements 6.2, 6.3, 6.4**

Property 11: Projectile limit enforced
*For any* player in Rapid Fire mode with 2 active projectiles, pressing their throw key should not create additional projectiles
**Validates: Requirements 6.5**

Property 12: Projectile ownership determines scoring
*For any* projectile-player collision in Rapid Fire mode, the score should be awarded to the player who owns the projectile (not the player who was hit)
**Validates: Requirements 6.6**

Property 13: Projectile velocity matches player meters
*For any* projectile launched in Rapid Fire mode, its initial velocity components should be calculated from the launching player's current angle and force meter values
**Validates: Requirements 6.8**

## Error Handling

### Audio Loading Failures
- If theme.mp3 fails to load, display splash screen without music
- Log error to console but continue game initialization
- Provide visual indication that audio is unavailable

### Invalid Map Scale
- If scale calculation produces invalid values, default to scale factor of 1.0
- Ensure minimum building heights prevent players from being positioned off-screen
- Validate player positions are within canvas bounds

### Rapid Fire Mode Edge Cases
- Handle simultaneous projectile hits by awarding point to first collision detected
- Prevent projectile count from exceeding limit through race conditions
- Ensure meter updates continue even when player is at projectile limit

### Building Destruction Bounds
- Clamp destroyed chunk positions to building boundaries
- Prevent destroyed chunks from overlapping excessively
- Ensure at least some building structure remains for visual clarity

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Splash Screen Tests:**
- Verify splash screen displays with correct initial state
- Test Space key transitions from splash to mode select
- Verify audio cleanup when leaving splash screen

**Trail System Tests:**
- Test trail segment creation at projectile positions
- Verify trail segments are removed when opacity reaches zero
- Test trail rendering with various opacity values

**Hit Feedback Tests:**
- Verify 3-second delay before feedback screen appears
- Test fade-in animation completes correctly
- Verify correct player and scores are displayed

**Building Destruction Tests:**
- Test chunk creation at specific impact coordinates
- Verify collision detection with single destroyed chunk
- Test multiple destroyed chunks on same building

**Map Scale Tests:**
- Test scale factor selection produces valid range
- Verify building generation with minimum scale (0.5)
- Verify building generation with maximum scale (1.5)
- Test player positioning at various scales

**Rapid Fire Mode Tests:**
- Test mode selection UI and state initialization
- Verify projectile creation for both players
- Test projectile limit enforcement at boundary (2 projectiles)
- Verify scoring awards point to correct player

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties. Each property-based test will run a minimum of 100 iterations.

**Trail Properties:**
- Generate random projectile positions and velocities
- Verify trail segments are created and aged correctly
- Test opacity decreases monotonically for all trail segments

**Building Destruction Properties:**
- Generate random building configurations and impact points
- Verify destroyed chunks prevent collision detection
- Test that projectiles pass through destroyed areas

**Map Scale Properties:**
- Generate random scale factors within valid range
- Verify all building dimensions scale proportionally
- Test player distances scale correctly with map scale

**Rapid Fire Properties:**
- Generate random game states with varying projectile counts
- Verify projectile limit enforcement for all player states
- Test projectile ownership and scoring logic
- Verify meter values correctly determine projectile velocities

Each property-based test will be tagged with a comment referencing its correctness property:
```javascript
// Feature: game-enhancements, Property 3: Trail opacity decreases with age
```

### Integration Testing

- Test complete splash-to-gameplay flow
- Verify mode selection affects gameplay correctly
- Test full round with building destruction and hit feedback
- Verify game state transitions with all new features active

## Implementation Notes

### Performance Considerations
- Limit maximum trail segments per projectile to prevent memory issues
- Use object pooling for trail segments to reduce garbage collection
- Optimize building collision detection with destroyed chunks using spatial partitioning
- Limit maximum destroyed chunks per building to maintain performance

### Browser Compatibility
- Use HTML5 Audio API for music playback (widely supported)
- Provide fallback for browsers without Audio API support
- Test audio playback on mobile devices (may require user interaction)

### Visual Polish
- Use easing functions for fade-in animations (ease-in-out)
- Add subtle glow effects to trail segments
- Implement particle effects for building destruction
- Use Kiro brand colors (#790ECB) for UI elements

### Code Organization
- Group splash screen code in dedicated section
- Create trail system as reusable module
- Separate Turn Based and Rapid Fire logic clearly
- Use configuration objects for mode-specific behavior
