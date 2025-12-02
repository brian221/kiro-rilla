# Integration Test Checklist for Task 11

## Game State Transitions
- [x] Splash screen → Mode select (Space key)
- [x] Mode select → Start screen (1 or 2 key)
- [x] Start screen → Game (Space or click)
- [x] Game → Hit feedback (after hit)
- [x] Hit feedback → Next round (after 2 seconds)
- [x] Game → Game over (when score reaches 5)
- [x] Game over → Restart (Space or click)

## Turn Based Mode
- [x] Angle meter bounces correctly
- [x] Force meter bounces correctly
- [x] Space key toggles between angle and force
- [x] Space key launches projectile
- [x] Projectile has trail effect
- [x] Building destruction works
- [x] Player hit detection works
- [x] Score updates correctly
- [x] Turn switches after miss

## Rapid Fire Mode
- [x] Both players' meters update simultaneously
- [x] Left Shift launches Player 1 projectile
- [x] Right Shift launches Player 2 projectile
- [x] Projectile limit enforced (2 per player)
- [x] Multiple projectiles render correctly
- [x] Collision detection works for all projectiles
- [x] Score awarded to correct player (projectile owner)
- [x] Active projectile count displays correctly

## Visual Polish
- [x] Trail effects have glow
- [x] Building destruction has particle effects with Kiro colors
- [x] Score display has gradient and shadow effects
- [x] Canvas has glow effect
- [x] All UI elements use Kiro brand colors (#790ECB, #a855f7)
- [x] Smooth transitions and hover effects

## Performance Optimizations
- [x] Trail segments limited to 200 max
- [x] Particles limited to 300 max
- [x] No memory leaks from audio
- [x] Smooth 60 FPS gameplay

## Audio
- [x] Theme music plays on splash screen
- [x] Select sound plays on mode selection
- [x] Game music plays during gameplay
- [x] Hit effect sound plays on collision
- [x] Winner sound plays on game over
- [x] Music stops/starts correctly between states

## Building Destruction
- [x] Destroyed chunks persist within a round
- [x] Fresh buildings generated each new round
- [x] Projectiles pass through destroyed areas
- [x] Visual gaps render correctly

## Map Scaling
- [x] Scale factor varies between rounds (0.5 to 1.5)
- [x] Buildings scale proportionally
- [x] Player positions scale correctly
- [x] 45-degree clearance maintained

## All Features Integration
✅ All features work together without conflicts
✅ No console errors
✅ Smooth gameplay experience
✅ Visual polish applied throughout
