# Implementation Plan

- [ ] 1. Implement intro splash screen with animations and music
  - Add new 'splash' game state and initialize on game start
  - Load theme.mp3 using HTML5 Audio element with error handling
  - Create splash screen rendering with game title at top
  - Implement bouncing Kiro sprite animation using sine wave for Y positions
  - Position two Kiro sprites on left and right sides facing each other
  - Add "Press Space to Begin" text display
  - Handle Space key input to stop music and transition to mode select
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [-] 1.1 Write property test for splash screen bounce animation
  - **Property 1: Bounce animation follows sine wave**
  - **Validates: Requirements 1.3**

- [ ] 2. Add mode selection screen
  - Create 'modeSelect' game state
  - Display "Turn Based" and "Rapid Fire" mode options
  - Handle keyboard input (1 for Turn Based, 2 for Rapid Fire)
  - Store selected mode in gameMode variable
  - Transition to appropriate game initialization based on mode
  - _Requirements: 6.1_

- [ ] 3. Implement projectile trail effect system
  - Create trailSegments array to store active trail segments
  - Add trail segment data structure with x, y, opacity, age, maxAge
  - Implement addTrailSegment() function to create segments at projectile position
  - Create updateTrails() function to age segments and remove expired ones
  - Implement drawTrails() function to render segments with fading opacity
  - Call addTrailSegment() each frame when projectile is active
  - Integrate trail rendering into main game loop
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.1 Write property test for trail segment creation
  - **Property 2: Active projectiles have trails**
  - **Validates: Requirements 2.1**

- [ ] 3.2 Write property test for trail opacity decay
  - **Property 3: Trail opacity decreases with age**
  - **Validates: Requirements 2.2, 2.3**

- [ ] 3.3 Write property test for trail generation
  - **Property 4: Moving projectiles generate trail segments**
  - **Validates: Requirements 2.4**

- [ ] 4. Implement hit feedback screen
  - Add 'hitFeedback' game state
  - Create hitFeedback state object with active, hitPlayer, fadeProgress, displayTime, scores
  - Implement triggerHitFeedback() function with 3-second setTimeout delay
  - Create updateHitFeedback() function to manage fade-in animation
  - Implement drawHitFeedback() function to render overlay with hit info and scores
  - Modify hit detection to call triggerHitFeedback() instead of immediate round restart
  - Transition to next round or game over after feedback display completes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.1 Write property test for fade-in animation
  - **Property 5: Fade-in progresses smoothly**
  - **Validates: Requirements 3.2**

- [ ] 5. Implement destructible buildings
  - Add destroyedChunks array to building data structure
  - Implement destroyBuildingChunk() function to add chunk at impact point
  - Create chunk with dimensions (30-50 pixels width/height) centered on impact
  - Modify checkBuildingCollision() to check if point is within destroyed chunk
  - Update building collision detection in updateGoo() to call destroyBuildingChunk()
  - Modify drawBuilding() to render gaps for destroyed chunks
  - Add particle effects for building destruction impacts
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.1 Write property test for chunk creation on collision
  - **Property 6: Collisions create destroyed chunks**
  - **Validates: Requirements 4.1**

- [ ] 5.2 Write property test for destroyed chunk collision
  - **Property 7: Destroyed chunks prevent collision**
  - **Validates: Requirements 4.2, 4.4**

- [ ] 6. Implement variable map scaling
  - Create mapScale configuration object with factor, buildingHeightMin, buildingHeightMax, buildingWidth, playerDistance
  - Implement selectMapScale() function to randomly choose scale factor (0.5 to 1.5)
  - Modify generateBuildings() to accept scale parameter and adjust dimensions
  - Update building height calculation to use scaled min/max values
  - Modify building width based on scale factor
  - Update initializePlayers() to position players based on scale
  - Call selectMapScale() at start of each new round
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.1 Write property test for scale factor range
  - **Property 8: Scale factor within valid range**
  - **Validates: Requirements 5.1**

- [ ] 6.2 Write property test for proportional scaling
  - **Property 9: Scale affects dimensions proportionally**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 7. Implement Rapid Fire mode core mechanics
  - Create rapidFireState object with player1 and player2 sub-objects
  - Add angle, force, angleDirection, forceDirection, selectingAngle, activeProjectiles to each player state
  - Modify projectile data structure to include owner property (1 or 2)
  - Change goo from single object to projectiles array
  - Implement initRapidFireMode() to initialize dual-player state
  - Create updateRapidFireMeters() to update both players' meters simultaneously
  - Modify game loop to call updateRapidFireMeters() when in Rapid Fire mode
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 8. Implement Rapid Fire input handling
  - Add keyboard event listeners for ShiftLeft and ShiftRight
  - Implement handleRapidFireInput() function to process player-specific throws
  - Check activeProjectiles count before allowing throw (must be < 2)
  - Create projectile with owner property set to throwing player
  - Use player-specific angle and force values for projectile velocity
  - Increment player's activeProjectiles counter
  - Toggle player's selectingAngle state on each key press
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.8_

- [ ] 8.1 Write property test for projectile creation under limit
  - **Property 10: Player input creates projectiles when under limit**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ] 8.2 Write property test for projectile limit enforcement
  - **Property 11: Projectile limit enforced**
  - **Validates: Requirements 6.5**

- [ ] 8.3 Write property test for projectile velocity calculation
  - **Property 13: Projectile velocity matches player meters**
  - **Validates: Requirements 6.8**

- [ ] 9. Implement Rapid Fire collision and scoring
  - Create updateRapidFireProjectiles() function to update all projectiles in array
  - Modify collision detection to check projectile owner vs hit player
  - Award point to projectile owner (not hit player)
  - Decrement activeProjectiles count when projectile is removed
  - Handle simultaneous hits by processing first collision detected
  - Trigger hit feedback screen on successful hit
  - Remove projectile from array on collision or out of bounds
  - _Requirements: 6.6_

- [ ] 9.1 Write property test for scoring by projectile ownership
  - **Property 12: Projectile ownership determines scoring**
  - **Validates: Requirements 6.6**

- [ ] 10. Implement Rapid Fire UI rendering
  - Create drawRapidFireUI() function to render both players' meters
  - Position Player 1 meters on left side of screen
  - Position Player 2 meters on right side of screen
  - Draw angle arrows for both players simultaneously
  - Draw force meters for both players with different colors
  - Add player labels to distinguish meters
  - Show active projectile count for each player
  - Integrate into main game loop when gameMode is 'rapidFire'
  - _Requirements: 6.7_

- [ ] 11. Final integration and polish
  - Ensure all game states transition correctly
  - Verify Turn Based mode still works as before
  - Test Rapid Fire mode with all features enabled
  - Add visual polish to new UI elements using Kiro brand colors
  - Optimize performance for trail rendering and multiple projectiles
  - Test audio playback and cleanup
  - Verify building destruction persists across rounds appropriately
  - _Requirements: All_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
