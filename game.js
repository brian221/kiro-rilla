// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.3;
const GOO_SPEED = 1.5;
const WINS_NEEDED = 5;

// Game state
let gameState = 'splash';
let gameMode = 'turnBased'; // 'turnBased' or 'rapidFire'
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let buildings = [];
let players = [];
let goo = null;
let angle = 45;
let force = 50;
let angleDirection = 1;
let forceDirection = 1;
let selectingAngle = true;
let frameCount = 0;
let shakeAmount = 0;
let particles = [];
let playerSplatter = null;
let trailSegments = [];

// Rapid Fire mode state
let rapidFireState = {
    player1: {
        angle: 45,
        force: 50,
        angleDirection: 1,
        forceDirection: 1,
        selectingAngle: true,
        activeProjectiles: 0
    },
    player2: {
        angle: 45,
        force: 50,
        angleDirection: 1,
        forceDirection: 1,
        selectingAngle: true,
        activeProjectiles: 0
    },
    projectiles: []
};

// Map scale configuration
let mapScale = {
    factor: 1.0,
    buildingHeightMin: 100,
    buildingHeightMax: 300,
    buildingWidth: 0,
    playerDistance: 0
};

// Hit feedback state
let hitFeedback = {
    active: false,
    hitPlayer: null,
    fadeProgress: 0,
    displayTime: 0,
    scores: { p1: 0, p2: 0 }
};

// Splash screen state
let splashState = {
    leftKiroY: 0,
    rightKiroY: 0,
    bouncePhase: 0,
    musicLoaded: false,
    themeAudio: null
};

// Game music state
let gameMusic = null;
let selectSound = null;
let hitEffectSound = null;
let winnerSound = null;

// Player bounce animation state
let playerBounceState = {
    phase: 0,
    player1OffsetY: 0,
    player1OffsetX: 0,
    player2OffsetY: 0,
    player2OffsetX: 0
};

// Load Kiro logo
const kiroLogo = new Image();
kiroLogo.src = 'kiro-logo.png';
kiroLogo.onerror = function() {
    console.log('Kiro logo not found, using colored rectangles instead');
};

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Load theme music
function loadThemeMusic() {
    splashState.themeAudio = new Audio('theme.mp3');
    splashState.themeAudio.loop = true;
    splashState.themeAudio.volume = 0.5;
    
    splashState.themeAudio.addEventListener('canplaythrough', () => {
        splashState.musicLoaded = true;
        // Auto-play music when loaded (may require user interaction in some browsers)
        splashState.themeAudio.play().catch(err => {
            console.log('Audio autoplay prevented by browser:', err);
        });
    });
    
    splashState.themeAudio.addEventListener('error', (e) => {
        console.log('Failed to load theme music:', e);
        splashState.musicLoaded = false;
    });
}

// Load game music (randomly select between in_game_1 and in_game_2)
function loadGameMusic() {
    const musicFiles = ['audio/in_game_1.mp3', 'audio/in_game_2.mp3'];
    const selectedMusic = musicFiles[Math.floor(Math.random() * musicFiles.length)];
    
    gameMusic = new Audio(selectedMusic);
    gameMusic.loop = true;
    gameMusic.volume = 0.5;
    
    gameMusic.play().catch(err => {
        console.log('Failed to play game music:', err);
    });
}

// Stop game music
function stopGameMusic() {
    if (gameMusic) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
        gameMusic = null;
    }
}

// Load and play sound effects
function loadSoundEffects() {
    selectSound = new Audio('audio/select.wav');
    selectSound.volume = 0.6;
    
    hitEffectSound = new Audio('audio/hit_effect.wav');
    hitEffectSound.volume = 0.7;
    
    winnerSound = new Audio('audio/winner.wav');
    winnerSound.volume = 0.8;
}

// Play select sound
function playSelectSound() {
    if (selectSound) {
        selectSound.currentTime = 0;
        selectSound.play().catch(err => {
            console.log('Failed to play select sound:', err);
        });
    }
}

// Play hit effect sound
function playHitEffectSound() {
    if (hitEffectSound) {
        hitEffectSound.currentTime = 0;
        hitEffectSound.play().catch(err => {
            console.log('Failed to play hit effect sound:', err);
        });
    }
}

// Play winner sound
function playWinnerSound() {
    if (winnerSound) {
        winnerSound.currentTime = 0;
        winnerSound.play().catch(err => {
            console.log('Failed to play winner sound:', err);
        });
    }
}

// Initialize splash screen
function initSplash() {
    splashState.bouncePhase = 0;
    splashState.leftKiroY = 0;
    splashState.rightKiroY = 0;
    loadThemeMusic();
    loadSoundEffects();
}

// Update splash animation
function updateSplashAnimation() {
    splashState.bouncePhase += 0.05;
    
    // Use sine wave for bouncing motion
    const bounceAmount = Math.sin(splashState.bouncePhase) * 20;
    splashState.leftKiroY = bounceAmount;
    splashState.rightKiroY = Math.sin(splashState.bouncePhase + Math.PI) * 20; // Offset for opposite bounce
}

// Draw splash screen
function drawSplashScreen() {
    // Clear with sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game title at top
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GORILLA KIRO', canvas.width / 2, 120);
    
    // Draw subtitle
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Enhanced Edition', canvas.width / 2, 160);
    
    // Draw bouncing Kiro sprites
    const leftKiroX = canvas.width / 4;
    const rightKiroX = (canvas.width * 3) / 4;
    const kiroBaseY = canvas.height / 2;
    const kiroSize = 80;
    
    // Left Kiro (facing right)
    if (kiroLogo.complete && kiroLogo.naturalWidth > 0) {
        ctx.save();
        ctx.translate(leftKiroX, kiroBaseY + splashState.leftKiroY);
        ctx.drawImage(kiroLogo, -kiroSize / 2, -kiroSize / 2, kiroSize, kiroSize);
        ctx.restore();
    } else {
        // Fallback colored rectangle
        ctx.fillStyle = '#790ECB';
        ctx.fillRect(leftKiroX - kiroSize / 2, kiroBaseY + splashState.leftKiroY - kiroSize / 2, kiroSize, kiroSize);
    }
    
    // Right Kiro (facing left - flipped)
    if (kiroLogo.complete && kiroLogo.naturalWidth > 0) {
        ctx.save();
        ctx.translate(rightKiroX, kiroBaseY + splashState.rightKiroY);
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(kiroLogo, -kiroSize / 2, -kiroSize / 2, kiroSize, kiroSize);
        ctx.restore();
    } else {
        // Fallback colored rectangle
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(rightKiroX - kiroSize / 2, kiroBaseY + splashState.rightKiroY - kiroSize / 2, kiroSize, kiroSize);
    }
    
    // Draw "Press Space to Begin" text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    // Pulsing effect for the text
    const pulseAlpha = 0.5 + Math.sin(frameCount * 0.1) * 0.5;
    ctx.globalAlpha = pulseAlpha;
    ctx.fillText('Press Space to Begin', canvas.width / 2, canvas.height - 100);
    ctx.globalAlpha = 1.0;
}

// Cleanup splash screen
function cleanupSplash() {
    if (splashState.themeAudio) {
        splashState.themeAudio.pause();
        splashState.themeAudio.currentTime = 0;
    }
}

// Draw mode selection screen
function drawModeSelectScreen() {
    // Clear with sky blue background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT GAME MODE', canvas.width / 2, 120);
    
    // Draw mode options with boxes
    const boxWidth = 300;
    const boxHeight = 150;
    const spacing = 50;
    const leftBoxX = canvas.width / 2 - boxWidth - spacing / 2;
    const rightBoxX = canvas.width / 2 + spacing / 2;
    const boxY = canvas.height / 2 - boxHeight / 2;
    
    // Turn Based mode box
    ctx.fillStyle = 'rgba(121, 14, 203, 0.2)';
    ctx.fillRect(leftBoxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#790ECB';
    ctx.lineWidth = 3;
    ctx.strokeRect(leftBoxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Turn Based', leftBoxX + boxWidth / 2, boxY + 60);
    
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Classic gameplay', leftBoxX + boxWidth / 2, boxY + 90);
    ctx.fillText('Players alternate', leftBoxX + boxWidth / 2, boxY + 110);
    
    // Press 1 indicator
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Press 1', leftBoxX + boxWidth / 2, boxY + boxHeight - 15);
    
    // Rapid Fire mode box
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fillRect(rightBoxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.strokeRect(rightBoxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Rapid Fire', rightBoxX + boxWidth / 2, boxY + 60);
    
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Fast-paced action', rightBoxX + boxWidth / 2, boxY + 90);
    ctx.fillText('Simultaneous throws', rightBoxX + boxWidth / 2, boxY + 110);
    
    // Press 2 indicator
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Press 2', rightBoxX + boxWidth / 2, boxY + boxHeight - 15);
    
    // Instructions at bottom
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Choose your game mode to begin', canvas.width / 2, canvas.height - 80);
}

// Sound effect functions
function playThrowSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playHitSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 100;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playWinSound() {
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

// Select random map scale
function selectMapScale() {
    // Randomly choose scale factor between 0.5 and 1.5
    mapScale.factor = 0.5 + Math.random() * 1.0;
    
    // Calculate scaled dimensions
    mapScale.buildingHeightMin = 100 * mapScale.factor;
    mapScale.buildingHeightMax = 300 * mapScale.factor;
    
    const numBuildings = 8;
    mapScale.buildingWidth = (canvas.width / numBuildings) * mapScale.factor;
    
    // Player distance is based on canvas width and scale
    mapScale.playerDistance = canvas.width * mapScale.factor;
}

// Generate random buildings with scale parameter
function generateBuildings(scale = mapScale) {
    buildings = [];
    const numBuildings = 8;
    const buildingWidth = canvas.width / numBuildings;
    
    for (let i = 0; i < numBuildings; i++) {
        // Use scaled min/max values for height calculation
        const heightRange = scale.buildingHeightMax - scale.buildingHeightMin;
        const height = Math.random() * heightRange + scale.buildingHeightMin;
        
        // Apply scale factor to building width (affects visual appearance)
        const scaledWidth = buildingWidth * scale.factor;
        
        const windows = [];
        
        // Pre-generate window states
        for (let y = 20; y < height - 20; y += 30) {
            for (let x = 15; x < scaledWidth - 15; x += 25) {
                windows.push({
                    x: x,
                    y: y,
                    lit: Math.random() > 0.7
                });
            }
        }
        
        buildings.push({
            x: i * buildingWidth,
            y: canvas.height - height,
            width: buildingWidth, // Keep original width for positioning
            visualWidth: scaledWidth, // Store scaled width for rendering
            height: height,
            windows: windows,
            lastWindowUpdate: 0,
            destroyedChunks: []
        });
    }
}

// Destroy building chunk at impact point
function destroyBuildingChunk(building, impactX, impactY) {
    // Create chunk with dimensions 30-50 pixels, centered on impact
    const chunkWidth = 30 + Math.random() * 20;
    const chunkHeight = 30 + Math.random() * 20;
    
    // Convert world coordinates to building-relative coordinates
    const relativeX = impactX - building.x - chunkWidth / 2;
    const relativeY = impactY - building.y - chunkHeight / 2;
    
    building.destroyedChunks.push({
        x: relativeX,
        y: relativeY,
        width: chunkWidth,
        height: chunkHeight
    });
}

// Check if point is within a destroyed chunk
function checkBuildingCollision(x, y, building) {
    // Use visualWidth if available (for scaled buildings), otherwise use width
    const renderWidth = building.visualWidth || building.width;
    
    // First check if point is within building bounds
    if (x < building.x || x > building.x + renderWidth ||
        y < building.y || y > building.y + building.height) {
        return false;
    }
    
    // Convert to building-relative coordinates
    const relativeX = x - building.x;
    const relativeY = y - building.y;
    
    // Check if point is within any destroyed chunk
    for (let chunk of building.destroyedChunks) {
        if (relativeX >= chunk.x && relativeX <= chunk.x + chunk.width &&
            relativeY >= chunk.y && relativeY <= chunk.y + chunk.height) {
            return false; // Point is in destroyed area, no collision
        }
    }
    
    return true; // Point collides with building
}

// Initialize players on buildings with scale
function initializePlayers(scale = mapScale) {
    // Position players based on scale factor
    // For smaller scales, players are closer; for larger scales, farther apart
    const player1BuildingIndex = 0;
    const player2BuildingIndex = buildings.length - 1;
    
    players = [
        {
            x: buildings[player1BuildingIndex].x + buildings[player1BuildingIndex].width / 2,
            y: buildings[player1BuildingIndex].y - 30,
            width: 40,
            height: 40
        },
        {
            x: buildings[player2BuildingIndex].x + buildings[player2BuildingIndex].width / 2,
            y: buildings[player2BuildingIndex].y - 30,
            width: 40,
            height: 40
        }
    ];
}

// Initialize game
function initGame() {
    // Select new map scale at start of each round
    selectMapScale();
    generateBuildings(mapScale);
    initializePlayers(mapScale);
    goo = null;
    selectingAngle = true;
    angle = 45;
    force = 50;
    particles = [];
    playerSplatter = null;
    trailSegments = [];
    gameState = 'playerTurn';
    
    // Start game music if not already playing
    if (!gameMusic) {
        loadGameMusic();
    }
}

// Initialize Rapid Fire mode
function initRapidFireMode() {
    // Select new map scale at start of each round
    selectMapScale();
    generateBuildings(mapScale);
    initializePlayers(mapScale);
    
    // Initialize dual-player state
    rapidFireState.player1 = {
        angle: 45,
        force: 50,
        angleDirection: 1,
        forceDirection: 1,
        selectingAngle: true,
        activeProjectiles: 0
    };
    
    rapidFireState.player2 = {
        angle: 45,
        force: 50,
        angleDirection: 1,
        forceDirection: 1,
        selectingAngle: true,
        activeProjectiles: 0
    };
    
    rapidFireState.projectiles = [];
    
    particles = [];
    playerSplatter = null;
    trailSegments = [];
    gameState = 'playerTurn';
    
    // Start game music if not already playing
    if (!gameMusic) {
        loadGameMusic();
    }
}

// Trail effect system
function addTrailSegment(x, y) {
    trailSegments.push({
        x: x,
        y: y,
        opacity: 0.8,
        age: 0,
        maxAge: 15 + Math.random() * 5 // 15-20 frames
    });
}

function updateTrails() {
    // Age segments and remove expired ones
    trailSegments = trailSegments.filter(segment => {
        segment.age++;
        segment.opacity = 1.0 - (segment.age / segment.maxAge);
        return segment.age < segment.maxAge;
    });
}

function drawTrails() {
    trailSegments.forEach(segment => {
        ctx.globalAlpha = segment.opacity;
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

// Hit feedback screen functions
function triggerHitFeedback(playerIndex) {
    // Wait 3 seconds before displaying feedback screen
    setTimeout(() => {
        hitFeedback.active = true;
        hitFeedback.hitPlayer = playerIndex;
        hitFeedback.fadeProgress = 0;
        hitFeedback.displayTime = 0;
        hitFeedback.scores = { p1: player1Score, p2: player2Score };
        gameState = 'hitFeedback';
    }, 3000);
}

function updateHitFeedback() {
    if (!hitFeedback.active) return;
    
    // Fade in animation (takes about 0.5 seconds at 60fps)
    if (hitFeedback.fadeProgress < 1.0) {
        hitFeedback.fadeProgress += 0.033; // ~2 seconds to fully fade in
        hitFeedback.fadeProgress = Math.min(1.0, hitFeedback.fadeProgress);
    }
    
    // Track display time
    hitFeedback.displayTime++;
    
    // After 2 seconds of display (120 frames), transition to next state
    if (hitFeedback.displayTime > 120) {
        hitFeedback.active = false;
        hitFeedback.fadeProgress = 0;
        hitFeedback.displayTime = 0;
        
        // Check if game is over or continue to next round
        if (player1Score >= WINS_NEEDED || player2Score >= WINS_NEEDED) {
            gameState = 'gameOver';
            playWinSound();
            stopGameMusic(); // Stop game music
            playWinnerSound(); // Play winner sound
        } else {
            if (gameMode === 'rapidFire') {
                initRapidFireMode();
            } else {
                initGame();
            }
        }
    }
}

function drawHitFeedback() {
    if (!hitFeedback.active) return;
    
    // Apply fade-in effect to overlay
    ctx.globalAlpha = hitFeedback.fadeProgress * 0.85;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = hitFeedback.fadeProgress;
    
    // Draw border
    ctx.strokeStyle = '#790ECB';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 300, canvas.height / 2 - 150, 600, 300);
    
    // Draw hit message
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Player ${hitFeedback.hitPlayer + 1} Hit!`, canvas.width / 2, canvas.height / 2 - 60);
    
    // Draw scores
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Current Scores', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '28px Arial';
    ctx.fillStyle = '#790ECB';
    ctx.fillText(`Player 1: ${hitFeedback.scores.p1}`, canvas.width / 2 - 100, canvas.height / 2 + 50);
    
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`Player 2: ${hitFeedback.scores.p2}`, canvas.width / 2 + 100, canvas.height / 2 + 50);
    
    // Draw continuation message
    ctx.fillStyle = '#a855f7';
    ctx.font = '18px Arial';
    ctx.fillText('Get ready for next round...', canvas.width / 2, canvas.height / 2 + 100);
    
    ctx.globalAlpha = 1.0;
}

// Create particle explosion
function createParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = Math.random() * 3 + 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

// Update and draw particles
function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.life -= 0.02;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1.0;
}

// Draw splatter on player
function drawPlayerSplatter() {
    if (!playerSplatter) return;
    
    const player = players[playerSplatter.playerIndex];
    
    // Account for bounce offsets
    const bounceOffsetY = playerSplatter.playerIndex === 0 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
    const bounceOffsetX = playerSplatter.playerIndex === 0 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
    
    ctx.globalAlpha = playerSplatter.opacity;
    
    // Draw splatter blobs
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        const size = Math.random() * 8 + 4;
        ctx.beginPath();
        ctx.arc(player.x + bounceOffsetX + offsetX, player.y + bounceOffsetY + player.height / 2 + offsetY, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    
    // Fade out splatter
    playerSplatter.opacity -= 0.01;
    if (playerSplatter.opacity <= 0) {
        playerSplatter = null;
    }
}

// Draw buildings
function drawBuildings() {
    buildings.forEach((building) => {
        // Use visualWidth if available (for scaled buildings), otherwise use width
        const renderWidth = building.visualWidth || building.width;
        
        const gradient = ctx.createLinearGradient(building.x, building.y, building.x, building.y + building.height);
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(1, '#2a2a2a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(building.x, building.y, renderWidth, building.height);
        
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x, building.y, renderWidth, building.height);
        
        // Update window states very infrequently (every 3 seconds)
        if (frameCount - building.lastWindowUpdate > 180) {
            building.windows.forEach(window => {
                if (Math.random() > 0.95) { // Only 5% chance to change
                    window.lit = !window.lit;
                }
            });
            building.lastWindowUpdate = frameCount;
        }
        
        // Draw windows with stored states
        building.windows.forEach(window => {
            ctx.fillStyle = window.lit ? '#790ECB' : '#1a1a1a';
            ctx.fillRect(building.x + window.x, building.y + window.y, 10, 15);
        });
        
        // Draw destroyed chunks as gaps (render sky color)
        if (building.destroyedChunks.length > 0) {
            ctx.fillStyle = '#87CEEB'; // Sky color
            building.destroyedChunks.forEach(chunk => {
                ctx.fillRect(
                    building.x + chunk.x,
                    building.y + chunk.y,
                    chunk.width,
                    chunk.height
                );
            });
        }
    });
}

// Update player bounce animation
function updatePlayerBounce() {
    playerBounceState.phase += 0.04;
    
    // Player 1 bounces with sine wave for Y and cosine for X (slight side-to-side)
    playerBounceState.player1OffsetY = Math.sin(playerBounceState.phase) * 3;
    playerBounceState.player1OffsetX = Math.cos(playerBounceState.phase * 0.7) * 2;
    
    // Player 2 bounces with offset phase for variety
    playerBounceState.player2OffsetY = Math.sin(playerBounceState.phase + Math.PI * 0.5) * 3;
    playerBounceState.player2OffsetX = Math.cos(playerBounceState.phase * 0.7 + Math.PI * 0.3) * 2;
}

// Draw players
function drawPlayers() {
    players.forEach((player, index) => {
        // Get bounce offsets for this player
        const offsetY = index === 0 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
        const offsetX = index === 0 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
        
        // Apply bounce offsets to player position
        const drawX = player.x + offsetX;
        const drawY = player.y + offsetY;
        
        // Try to draw logo if it loaded successfully, otherwise draw colored rectangle
        if (kiroLogo.complete && kiroLogo.naturalWidth > 0) {
            ctx.drawImage(kiroLogo, drawX - player.width / 2, drawY, player.width, player.height);
        } else {
            // Draw colored rectangle as fallback
            ctx.fillStyle = index === 0 ? '#790ECB' : '#a855f7';
            ctx.fillRect(drawX - player.width / 2, drawY, player.width, player.height);
            
            // Add a simple face
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(drawX - 8, drawY + 12, 3, 0, Math.PI * 2);
            ctx.arc(drawX + 8, drawY + 12, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Smile
            ctx.beginPath();
            ctx.arc(drawX, drawY + 20, 8, 0, Math.PI);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// Draw meters
function drawMeters() {
    if (gameState !== 'playerTurn') return;
    
    const player = players[currentPlayer - 1];
    const direction = currentPlayer === 1 ? 1 : -1;
    
    // Account for bounce offsets
    const offsetY = currentPlayer === 1 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
    const offsetX = currentPlayer === 1 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
    
    if (selectingAngle) {
        // Draw trajectory arrow
        const angleRad = (angle * Math.PI) / 180;
        const arrowLength = 80;
        const startX = player.x + offsetX;
        const startY = player.y + offsetY + player.height / 2;
        const endX = startX + Math.cos(angleRad) * arrowLength * direction;
        const endY = startY - Math.sin(angleRad) * arrowLength;
        
        // Draw arrow line
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const arrowHeadSize = 10;
        const arrowAngle = Math.atan2(startY - endY, endX - startX);
        
        ctx.fillStyle = '#790ECB';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle - Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle + Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw angle text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(angle)}°`, startX, startY - arrowLength - 10);
    } else {
        // Force meter
        const meterX = player.x + offsetX - 50;
        const meterY = player.y + offsetY - 80;
        
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(meterX, meterY, 100, 20);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, 100, 20);
        
        const forceWidth = force;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(meterX, meterY, forceWidth, 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Force: ${Math.round(force)}%`, meterX + 50, meterY - 5);
    }
}

// Draw Rapid Fire UI for both players
function drawRapidFireUI() {
    if (gameState !== 'playerTurn' && gameState !== 'playing') return;
    
    // Draw Player 1 meters (left side)
    const player1 = players[0];
    const player1OffsetY = playerBounceState.player1OffsetY;
    const player1OffsetX = playerBounceState.player1OffsetX;
    const player1State = rapidFireState.player1;
    
    // Player 1 angle arrow (facing right)
    if (player1State.selectingAngle) {
        const angleRad = (player1State.angle * Math.PI) / 180;
        const arrowLength = 80;
        const startX = player1.x + player1OffsetX;
        const startY = player1.y + player1OffsetY + player1.height / 2;
        const endX = startX + Math.cos(angleRad) * arrowLength;
        const endY = startY - Math.sin(angleRad) * arrowLength;
        
        // Draw arrow line
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const arrowHeadSize = 10;
        const arrowAngle = Math.atan2(startY - endY, endX - startX);
        
        ctx.fillStyle = '#790ECB';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle - Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle + Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw angle text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(player1State.angle)}°`, startX, startY - arrowLength - 10);
    } else {
        // Player 1 force meter
        const meterX = player1.x + player1OffsetX - 50;
        const meterY = player1.y + player1OffsetY - 80;
        
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(meterX, meterY, 100, 20);
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, 100, 20);
        
        const forceWidth = player1State.force;
        ctx.fillStyle = '#790ECB';
        ctx.fillRect(meterX, meterY, forceWidth, 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Force: ${Math.round(player1State.force)}%`, meterX + 50, meterY - 5);
    }
    
    // Draw Player 2 meters (right side)
    const player2 = players[1];
    const player2OffsetY = playerBounceState.player2OffsetY;
    const player2OffsetX = playerBounceState.player2OffsetX;
    const player2State = rapidFireState.player2;
    
    // Player 2 angle arrow (facing left)
    if (player2State.selectingAngle) {
        const angleRad = (player2State.angle * Math.PI) / 180;
        const arrowLength = 80;
        const startX = player2.x + player2OffsetX;
        const startY = player2.y + player2OffsetY + player2.height / 2;
        const endX = startX - Math.cos(angleRad) * arrowLength; // Negative for left direction
        const endY = startY - Math.sin(angleRad) * arrowLength;
        
        // Draw arrow line
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const arrowHeadSize = 10;
        const arrowAngle = Math.atan2(startY - endY, endX - startX);
        
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle - Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowHeadSize * Math.cos(arrowAngle + Math.PI / 6),
            endY + arrowHeadSize * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw angle text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(player2State.angle)}°`, startX, startY - arrowLength - 10);
    } else {
        // Player 2 force meter
        const meterX = player2.x + player2OffsetX - 50;
        const meterY = player2.y + player2OffsetY - 80;
        
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(meterX, meterY, 100, 20);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(meterX, meterY, 100, 20);
        
        const forceWidth = player2State.force;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(meterX, meterY, forceWidth, 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Force: ${Math.round(player2State.force)}%`, meterX + 50, meterY - 5);
    }
    
    // Draw player labels and active projectile count at top of screen
    // Player 1 info (left side)
    const p1InfoX = 100;
    const infoY = 70;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p1InfoX - 80, infoY - 25, 160, 50);
    
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Player 1', p1InfoX, infoY);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Projectiles: ${player1State.activeProjectiles}/2`, p1InfoX, infoY + 20);
    
    // Player 2 info (right side)
    const p2InfoX = canvas.width - 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p2InfoX - 80, infoY - 25, 160, 50);
    
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Player 2', p2InfoX, infoY);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Projectiles: ${player2State.activeProjectiles}/2`, p2InfoX, infoY + 20);
}

// Draw goo blob
function drawGoo() {
    if (!goo) return;
    
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(goo.x, goo.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Goo trail
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(goo.x - goo.vx * 2, goo.y - goo.vy * 2, 6, 0, Math.PI * 2);
    ctx.fill();
}

// Update meters
function updateMeters() {
    if (selectingAngle) {
        angle += angleDirection * 2;
        if (angle >= 90 || angle <= 0) {
            angleDirection *= -1;
            angle = Math.max(0, Math.min(90, angle));
        }
    } else {
        force += forceDirection * 3;
        if (force >= 100 || force <= 0) {
            forceDirection *= -1;
            force = Math.max(0, Math.min(100, force));
        }
    }
}

// Update Rapid Fire meters for both players simultaneously
function updateRapidFireMeters() {
    // Update Player 1 meters
    if (rapidFireState.player1.selectingAngle) {
        rapidFireState.player1.angle += rapidFireState.player1.angleDirection * 2;
        if (rapidFireState.player1.angle >= 90 || rapidFireState.player1.angle <= 0) {
            rapidFireState.player1.angleDirection *= -1;
            rapidFireState.player1.angle = Math.max(0, Math.min(90, rapidFireState.player1.angle));
        }
    } else {
        rapidFireState.player1.force += rapidFireState.player1.forceDirection * 3;
        if (rapidFireState.player1.force >= 100 || rapidFireState.player1.force <= 0) {
            rapidFireState.player1.forceDirection *= -1;
            rapidFireState.player1.force = Math.max(0, Math.min(100, rapidFireState.player1.force));
        }
    }
    
    // Update Player 2 meters
    if (rapidFireState.player2.selectingAngle) {
        rapidFireState.player2.angle += rapidFireState.player2.angleDirection * 2;
        if (rapidFireState.player2.angle >= 90 || rapidFireState.player2.angle <= 0) {
            rapidFireState.player2.angleDirection *= -1;
            rapidFireState.player2.angle = Math.max(0, Math.min(90, rapidFireState.player2.angle));
        }
    } else {
        rapidFireState.player2.force += rapidFireState.player2.forceDirection * 3;
        if (rapidFireState.player2.force >= 100 || rapidFireState.player2.force <= 0) {
            rapidFireState.player2.forceDirection *= -1;
            rapidFireState.player2.force = Math.max(0, Math.min(100, rapidFireState.player2.force));
        }
    }
}

// Shoot goo
function shootGoo() {
    const player = players[currentPlayer - 1];
    const angleRad = (angle * Math.PI) / 180;
    const power = (force / 100) * 15;
    
    const direction = currentPlayer === 1 ? 1 : -1;
    
    // Account for bounce offsets when launching projectile
    const offsetY = currentPlayer === 1 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
    const offsetX = currentPlayer === 1 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
    
    goo = {
        x: player.x + offsetX,
        y: player.y + offsetY + player.height / 2,
        vx: Math.cos(angleRad) * power * direction * GOO_SPEED,
        vy: -Math.sin(angleRad) * power * GOO_SPEED
    };
    
    playThrowSound();
    gameState = 'playing';
}

// Update goo physics
function updateGoo() {
    if (!goo) return;
    
    // Add trail segment at current position before moving
    addTrailSegment(goo.x, goo.y);
    
    goo.vy += GRAVITY;
    goo.x += goo.vx;
    goo.y += goo.vy;
    
    // Check collision with players
    players.forEach((player, index) => {
        if (index + 1 !== currentPlayer) {
            // Account for bounce offsets in collision detection
            const offsetY = index === 0 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
            const offsetX = index === 0 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
            const playerX = player.x + offsetX;
            const playerY = player.y + offsetY;
            
            if (goo.x > playerX - player.width / 2 && 
                goo.x < playerX + player.width / 2 &&
                goo.y > playerY && 
                goo.y < playerY + player.height) {
                
                // Hit!
                if (currentPlayer === 1) {
                    player1Score++;
                } else {
                    player2Score++;
                }
                
                updateScoreDisplay();
                playHitSound();
                playHitEffectSound(); // Play hit effect sound
                shakeAmount = 10;
                
                // Create hit particles
                createParticles(goo.x, goo.y, '#00ff00', 30);
                
                // Create splatter on player
                playerSplatter = {
                    playerIndex: index,
                    opacity: 1.0
                };
                
                // Trigger hit feedback screen with 3-second delay
                triggerHitFeedback(index);
                
                goo = null;
            }
        }
    });
    
    // Check if goo is out of bounds
    if (goo && (goo.x < 0 || goo.x > canvas.width || goo.y > canvas.height)) {
        goo = null;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        selectingAngle = true;
        gameState = 'playerTurn';
    }
    
    // Check collision with buildings
    if (goo) {
        for (let building of buildings) {
            if (checkBuildingCollision(goo.x, goo.y, building)) {
                // Destroy building chunk at impact point
                destroyBuildingChunk(building, goo.x, goo.y);
                
                // Create building hit particles
                createParticles(goo.x, goo.y, '#666666', 15);
                
                // Play hit effect sound
                playHitEffectSound();
                
                goo = null;
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                selectingAngle = true;
                gameState = 'playerTurn';
                break; // Exit loop after collision
            }
        }
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('player1-score').textContent = `Player 1: ${player1Score}`;
    document.getElementById('player2-score').textContent = `Player 2: ${player2Score}`;
}

// Draw start screen
function drawStartScreen() {
    // Draw semi-transparent overlay only in center
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 200);
    
    ctx.strokeStyle = '#790ECB';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 200);
    
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GORILLA KIRO', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE or click to start!', canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#a855f7';
    ctx.fillText('First to 5 hits wins!', canvas.width / 2, canvas.height / 2 + 50);
}

// Draw game over screen
function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const winner = player1Score >= WINS_NEEDED ? 1 : 2;
    
    ctx.fillStyle = '#790ECB';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`PLAYER ${winner} WINS!`, canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE or click to restart', canvas.width / 2, canvas.height / 2 + 30);
}

// Main game loop
function gameLoop() {
    // Apply screen shake
    ctx.save();
    if (shakeAmount > 0) {
        ctx.translate(
            Math.random() * shakeAmount - shakeAmount / 2,
            Math.random() * shakeAmount - shakeAmount / 2
        );
        shakeAmount *= 0.9;
        if (shakeAmount < 0.5) shakeAmount = 0;
    }
    
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update player bounce animation (always active when players are visible)
    if (gameState !== 'splash' && gameState !== 'modeSelect' && gameState !== 'start') {
        updatePlayerBounce();
    }
    
    // Draw game elements (always draw buildings and players so they're visible)
    if (gameState !== 'start' || buildings.length > 0) {
        drawBuildings();
        drawPlayers();
        drawPlayerSplatter();
        drawTrails();
        
        // Draw projectiles based on game mode
        if (gameMode === 'rapidFire') {
            drawRapidFireProjectiles();
        } else {
            drawGoo();
        }
        
        updateParticles();
        
        // Draw UI based on game mode
        if (gameMode === 'rapidFire') {
            drawRapidFireUI();
        } else {
            drawMeters();
        }
    }
    
    // Update game logic
    if (gameState === 'playerTurn') {
        if (gameMode === 'rapidFire') {
            updateRapidFireMeters();
            // Also update projectiles in playerTurn state for Rapid Fire
            updateTrails();
            updateRapidFireProjectiles();
        } else {
            updateMeters();
        }
    } else if (gameState === 'playing') {
        updateTrails();
        if (gameMode === 'rapidFire') {
            updateRapidFireProjectiles();
        } else {
            updateGoo();
        }
    } else if (gameState === 'hitFeedback') {
        updateHitFeedback();
    }
    
    // Update and draw splash screen
    if (gameState === 'splash') {
        updateSplashAnimation();
        drawSplashScreen();
    }
    
    // Draw mode select screen
    if (gameState === 'modeSelect') {
        drawModeSelectScreen();
    }
    
    // Draw overlays
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
    } else if (gameState === 'hitFeedback') {
        drawHitFeedback();
    } else if (gameState === 'playerTurn') {
        // Show current player turn with highlight
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, 50);
        
        ctx.fillStyle = currentPlayer === 1 ? '#790ECB' : '#a855f7';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Player ${currentPlayer}'s Turn`, canvas.width / 2, 32);
        
        // Draw arrow pointing to current player
        const player = players[currentPlayer - 1];
        const arrowOffsetY = currentPlayer === 1 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
        const arrowOffsetX = currentPlayer === 1 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
        
        ctx.fillStyle = currentPlayer === 1 ? '#790ECB' : '#a855f7';
        ctx.beginPath();
        ctx.moveTo(player.x + arrowOffsetX, player.y + arrowOffsetY - 50);
        ctx.lineTo(player.x + arrowOffsetX - 10, player.y + arrowOffsetY - 60);
        ctx.lineTo(player.x + arrowOffsetX + 10, player.y + arrowOffsetY - 60);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Update all Rapid Fire projectiles
function updateRapidFireProjectiles() {
    if (rapidFireState.projectiles.length === 0) return;
    
    // Track projectiles to remove
    const projectilesToRemove = [];
    
    // Update each projectile
    for (let i = 0; i < rapidFireState.projectiles.length; i++) {
        const projectile = rapidFireState.projectiles[i];
        
        // Add trail segment at current position before moving
        addTrailSegment(projectile.x, projectile.y);
        
        // Apply physics
        projectile.vy += GRAVITY;
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;
        
        // Check collision with players
        let hitDetected = false;
        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            const player = players[playerIndex];
            const playerNum = playerIndex + 1;
            
            // Check if projectile owner is different from hit player
            if (projectile.owner !== playerNum) {
                // Account for bounce offsets in collision detection
                const offsetY = playerIndex === 0 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
                const offsetX = playerIndex === 0 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
                const playerX = player.x + offsetX;
                const playerY = player.y + offsetY;
                
                if (projectile.x > playerX - player.width / 2 && 
                    projectile.x < playerX + player.width / 2 &&
                    projectile.y > playerY && 
                    projectile.y < playerY + player.height) {
                    
                    // Hit! Award point to projectile owner (not hit player)
                    if (projectile.owner === 1) {
                        player1Score++;
                    } else {
                        player2Score++;
                    }
                    
                    updateScoreDisplay();
                    playHitSound();
                    playHitEffectSound();
                    shakeAmount = 10;
                    
                    // Create hit particles
                    createParticles(projectile.x, projectile.y, '#00ff00', 30);
                    
                    // Create splatter on player
                    playerSplatter = {
                        playerIndex: playerIndex,
                        opacity: 1.0
                    };
                    
                    // Trigger hit feedback screen with 3-second delay
                    triggerHitFeedback(playerIndex);
                    
                    // Mark projectile for removal
                    projectilesToRemove.push(i);
                    hitDetected = true;
                    
                    // Handle simultaneous hits by processing first collision detected
                    break;
                }
            }
        }
        
        // Skip further checks if hit was detected
        if (hitDetected) continue;
        
        // Check if projectile is out of bounds
        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y > canvas.height) {
            projectilesToRemove.push(i);
            continue;
        }
        
        // Check collision with buildings
        for (let building of buildings) {
            if (checkBuildingCollision(projectile.x, projectile.y, building)) {
                // Destroy building chunk at impact point
                destroyBuildingChunk(building, projectile.x, projectile.y);
                
                // Create building hit particles
                createParticles(projectile.x, projectile.y, '#666666', 15);
                
                // Play hit effect sound
                playHitEffectSound();
                
                // Mark projectile for removal
                projectilesToRemove.push(i);
                break;
            }
        }
    }
    
    // Remove projectiles in reverse order to maintain correct indices
    for (let i = projectilesToRemove.length - 1; i >= 0; i--) {
        const index = projectilesToRemove[i];
        const projectile = rapidFireState.projectiles[index];
        
        // Decrement activeProjectiles count for the owner
        if (projectile.owner === 1) {
            rapidFireState.player1.activeProjectiles--;
        } else {
            rapidFireState.player2.activeProjectiles--;
        }
        
        // Remove projectile from array
        rapidFireState.projectiles.splice(index, 1);
    }
}

// Draw Rapid Fire projectiles
function drawRapidFireProjectiles() {
    rapidFireState.projectiles.forEach(projectile => {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Goo trail
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(projectile.x - projectile.vx * 2, projectile.y - projectile.vy * 2, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Handle Rapid Fire input for player-specific throws
function handleRapidFireInput(playerNum) {
    if (gameState !== 'playerTurn' || gameMode !== 'rapidFire') return;
    
    const playerState = playerNum === 1 ? rapidFireState.player1 : rapidFireState.player2;
    const player = players[playerNum - 1];
    
    // Check if player can throw (must have < 2 active projectiles)
    if (playerState.activeProjectiles >= 2) {
        return; // Cannot throw, already at limit
    }
    
    // Toggle between angle and force selection
    if (playerState.selectingAngle) {
        playerState.selectingAngle = false;
    } else {
        // Launch projectile using player-specific angle and force values
        const angleRad = (playerState.angle * Math.PI) / 180;
        const power = (playerState.force / 100) * 15;
        const direction = playerNum === 1 ? 1 : -1;
        
        // Account for bounce offsets when launching projectile
        const offsetY = playerNum === 1 ? playerBounceState.player1OffsetY : playerBounceState.player2OffsetY;
        const offsetX = playerNum === 1 ? playerBounceState.player1OffsetX : playerBounceState.player2OffsetX;
        
        // Create projectile with owner property
        const projectile = {
            x: player.x + offsetX,
            y: player.y + offsetY + player.height / 2,
            vx: Math.cos(angleRad) * power * direction * GOO_SPEED,
            vy: -Math.sin(angleRad) * power * GOO_SPEED,
            owner: playerNum
        };
        
        rapidFireState.projectiles.push(projectile);
        
        // Increment player's activeProjectiles counter
        playerState.activeProjectiles++;
        
        playThrowSound();
        
        // Toggle back to angle selection
        playerState.selectingAngle = true;
        
        // Transition to playing state if this is the first projectile
        if (rapidFireState.projectiles.length === 1) {
            gameState = 'playing';
        }
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (gameState === 'splash') {
            playSelectSound(); // Play select sound
            cleanupSplash();
            gameState = 'modeSelect';
        } else if (gameState === 'start') {
            if (gameMode === 'rapidFire') {
                initRapidFireMode();
            } else {
                initGame();
            }
        } else if (gameState === 'gameOver') {
            player1Score = 0;
            player2Score = 0;
            currentPlayer = 1;
            updateScoreDisplay();
            stopGameMusic(); // Stop any existing game music
            if (gameMode === 'rapidFire') {
                initRapidFireMode();
            } else {
                initGame();
            }
        } else if (gameState === 'playerTurn') {
            if (gameMode === 'turnBased') {
                if (selectingAngle) {
                    selectingAngle = false;
                } else {
                    shootGoo();
                }
            }
        }
    }
    
    // Handle Rapid Fire mode input
    if (e.code === 'ShiftLeft') {
        e.preventDefault();
        handleRapidFireInput(1);
    } else if (e.code === 'ShiftRight') {
        e.preventDefault();
        handleRapidFireInput(2);
    }
    
    // Handle mode selection
    if (gameState === 'modeSelect') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
            e.preventDefault();
            playSelectSound(); // Play select sound
            gameMode = 'turnBased';
            selectMapScale();
            generateBuildings(mapScale);
            initializePlayers(mapScale);
            gameState = 'start';
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
            e.preventDefault();
            playSelectSound(); // Play select sound
            gameMode = 'rapidFire';
            selectMapScale();
            generateBuildings(mapScale);
            initializePlayers(mapScale);
            gameState = 'start';
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'start') {
        if (gameMode === 'rapidFire') {
            initRapidFireMode();
        } else {
            initGame();
        }
    } else if (gameState === 'gameOver') {
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        updateScoreDisplay();
        if (gameMode === 'rapidFire') {
            initRapidFireMode();
        } else {
            initGame();
        }
    }
});

// Initialize splash screen
initSplash();

// Start game loop
gameLoop();
