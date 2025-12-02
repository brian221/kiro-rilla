# Requirements Document

## Introduction

This specification defines enhancements to the Gorilla Kiro game, adding visual polish, gameplay variety, and a new competitive game mode. The enhancements include an animated intro splash screen with music, visual effects for projectiles and hits, destructible buildings, dynamic map scaling, and a new "Rapid Fire" mode where both players can throw simultaneously.

## Glossary

- **Game System**: The Gorilla Kiro browser-based artillery game
- **Splash Screen**: A full-screen overlay displaying game information with animations
- **Projectile Trail**: Visual effect showing the path of a thrown goo blob
- **Hit Feedback Screen**: A temporary overlay showing hit information and current scores
- **Building Destruction**: Removal of building sections when struck by projectiles
- **Map Scale**: The distance between players and overall size of the game environment
- **Turn Based Mode**: Original gameplay where players alternate throwing projectiles
- **Rapid Fire Mode**: New gameplay mode allowing simultaneous throwing by both players
- **Active Projectile**: A goo blob currently in flight
- **Round**: A single game session ending when one player reaches the winning score

## Requirements

### Requirement 1

**User Story:** As a player, I want to see an engaging intro splash screen when the game starts, so that I feel excited and prepared to play.

#### Acceptance Criteria

1. WHEN the Game System starts THEN the Game System SHALL display a splash screen with the game title positioned toward the top of the screen
2. WHEN the splash screen is displayed THEN the Game System SHALL render two Kiro sprites, one on each side of the screen, facing each other
3. WHEN the splash screen is active THEN the Game System SHALL animate both Kiro sprites with a slight bouncing motion
4. WHEN the splash screen is displayed THEN the Game System SHALL play the theme music from the theme.mp3 file
5. WHEN the splash screen is active THEN the Game System SHALL display the text "Press Space to Begin" to indicate how to start
6. WHEN the player presses the Space key during the splash screen THEN the Game System SHALL stop the music and transition to gameplay

### Requirement 2

**User Story:** As a player, I want to see a visual trail behind thrown projectiles, so that I can better track their movement and trajectory.

#### Acceptance Criteria

1. WHEN a projectile is in flight THEN the Game System SHALL render a trail effect behind the projectile
2. WHEN rendering the trail THEN the Game System SHALL display multiple trail segments that fade in opacity over time
3. WHEN a trail segment ages THEN the Game System SHALL reduce its opacity until it disappears
4. WHEN a projectile moves THEN the Game System SHALL create new trail segments at the projectile's previous positions

### Requirement 3

**User Story:** As a player, I want to see a feedback screen after a hit occurs, so that I understand what happened and can see the current score.

#### Acceptance Criteria

1. WHEN a player is struck by a projectile THEN the Game System SHALL wait 3 seconds before displaying the hit feedback screen
2. WHEN displaying the hit feedback screen THEN the Game System SHALL fade in the screen overlay smoothly
3. WHEN the hit feedback screen is visible THEN the Game System SHALL display which player was hit
4. WHEN the hit feedback screen is visible THEN the Game System SHALL display the current scores for both players
5. WHEN the hit feedback screen completes its display THEN the Game System SHALL transition to the next round or game over state

### Requirement 4

**User Story:** As a player, I want buildings to be destructible, so that the battlefield changes dynamically and creates new strategic opportunities.

#### Acceptance Criteria

1. WHEN a projectile strikes a building THEN the Game System SHALL remove a small chunk of the building at the impact point
2. WHEN a building chunk is destroyed THEN the Game System SHALL update the building's collision geometry to reflect the damage
3. WHEN rendering damaged buildings THEN the Game System SHALL display the destruction visually with appropriate gaps or holes
4. WHEN a projectile passes through a destroyed section THEN the Game System SHALL allow the projectile to continue without collision

### Requirement 5

**User Story:** As a player, I want the map scale to vary between rounds, so that each game feels different and requires different strategies.

#### Acceptance Criteria

1. WHEN a new round begins THEN the Game System SHALL randomly select a map scale from a range of possible values
2. WHEN the map scale is small THEN the Game System SHALL position players closer together with shorter buildings
3. WHEN the map scale is large THEN the Game System SHALL position players farther apart with taller buildings
4. WHEN generating buildings with a specific scale THEN the Game System SHALL adjust building heights and widths proportionally
5. WHEN positioning players THEN the Game System SHALL place them at appropriate distances based on the selected map scale

### Requirement 6

**User Story:** As a player, I want to play a "Rapid Fire" mode, so that I can experience faster-paced competitive gameplay.

#### Acceptance Criteria

1. WHEN the game starts THEN the Game System SHALL allow the player to select between Turn Based mode and Rapid Fire mode
2. WHEN Rapid Fire mode is active THEN the Game System SHALL allow Player 1 to throw projectiles using the left Shift key
3. WHEN Rapid Fire mode is active THEN the Game System SHALL allow Player 2 to throw projectiles using the right Shift key
4. WHEN a player has fewer than 2 active projectiles THEN the Game System SHALL allow that player to throw another projectile
5. WHEN a player has 2 active projectiles THEN the Game System SHALL prevent that player from throwing additional projectiles until one lands
6. WHEN any projectile hits a player in Rapid Fire mode THEN the Game System SHALL award a point to the throwing player and end the round
7. WHEN Rapid Fire mode is active THEN the Game System SHALL display separate angle and force meters for both players simultaneously
8. WHEN a player presses their throw key in Rapid Fire mode THEN the Game System SHALL use the current meter values for that player to launch the projectile
