// Game constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.3;
const GOO_SPEED = 1.5;
const WINS_NEEDED = 5;

// Game state
let gameState = 'start';
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

// Load Kiro logo
const kiroLogo = new Image();
kiroLogo.src = 'kiro-logo.png';
kiroLogo.onerror = function() {
    console.log('Kiro logo not found, using colored rectangles instead');
};

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

// Generate random buildings
function generateBuildings() {
    buildings = [];
    const numBuildings = 8;
    const buildingWidth = canvas.width / numBuildings;
    
    for (let i = 0; i < numBuildings; i++) {
        const height = Math.random() * 200 + 100;
        const windows = [];
        
        // Pre-generate window states
        for (let y = 20; y < height - 20; y += 30) {
            for (let x = 15; x < buildingWidth - 15; x += 25) {
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
            width: buildingWidth,
            height: height,
            windows: windows,
            lastWindowUpdate: 0
        });
    }
}

// Initialize players on buildings
function initializePlayers() {
    players = [
        {
            x: buildings[0].x + buildings[0].width / 2,
            y: buildings[0].y - 30,
            width: 40,
            height: 40
        },
        {
            x: buildings[buildings.length - 1].x + buildings[buildings.length - 1].width / 2,
            y: buildings[buildings.length - 1].y - 30,
            width: 40,
            height: 40
        }
    ];
}

// Initialize game
function initGame() {
    generateBuildings();
    initializePlayers();
    goo = null;
    selectingAngle = true;
    angle = 45;
    force = 50;
    particles = [];
    playerSplatter = null;
    gameState = 'playerTurn';
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
    ctx.globalAlpha = playerSplatter.opacity;
    
    // Draw splatter blobs
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        const size = Math.random() * 8 + 4;
        ctx.beginPath();
        ctx.arc(player.x + offsetX, player.y + player.height / 2 + offsetY, size, 0, Math.PI * 2);
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
        const gradient = ctx.createLinearGradient(building.x, building.y, building.x, building.y + building.height);
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(1, '#2a2a2a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        ctx.strokeStyle = '#790ECB';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x, building.y, building.width, building.height);
        
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
    });
}

// Draw players
function drawPlayers() {
    players.forEach((player, index) => {
        // Try to draw logo if it loaded successfully, otherwise draw colored rectangle
        if (kiroLogo.complete && kiroLogo.naturalWidth > 0) {
            ctx.drawImage(kiroLogo, player.x - player.width / 2, player.y, player.width, player.height);
        } else {
            // Draw colored rectangle as fallback
            ctx.fillStyle = index === 0 ? '#790ECB' : '#a855f7';
            ctx.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
            
            // Add a simple face
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(player.x - 8, player.y + 12, 3, 0, Math.PI * 2);
            ctx.arc(player.x + 8, player.y + 12, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Smile
            ctx.beginPath();
            ctx.arc(player.x, player.y + 20, 8, 0, Math.PI);
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
    
    if (selectingAngle) {
        // Draw trajectory arrow
        const angleRad = (angle * Math.PI) / 180;
        const arrowLength = 80;
        const startX = player.x;
        const startY = player.y + player.height / 2;
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
        const meterX = player.x - 50;
        const meterY = player.y - 80;
        
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

// Shoot goo
function shootGoo() {
    const player = players[currentPlayer - 1];
    const angleRad = (angle * Math.PI) / 180;
    const power = (force / 100) * 15;
    
    const direction = currentPlayer === 1 ? 1 : -1;
    
    goo = {
        x: player.x,
        y: player.y + player.height / 2,
        vx: Math.cos(angleRad) * power * direction * GOO_SPEED,
        vy: -Math.sin(angleRad) * power * GOO_SPEED
    };
    
    playThrowSound();
    gameState = 'playing';
}

// Update goo physics
function updateGoo() {
    if (!goo) return;
    
    goo.vy += GRAVITY;
    goo.x += goo.vx;
    goo.y += goo.vy;
    
    // Check collision with players
    players.forEach((player, index) => {
        if (index + 1 !== currentPlayer) {
            if (goo.x > player.x - player.width / 2 && 
                goo.x < player.x + player.width / 2 &&
                goo.y > player.y && 
                goo.y < player.y + player.height) {
                
                // Hit!
                if (currentPlayer === 1) {
                    player1Score++;
                } else {
                    player2Score++;
                }
                
                updateScoreDisplay();
                playHitSound();
                shakeAmount = 10;
                
                // Create hit particles
                createParticles(goo.x, goo.y, '#00ff00', 30);
                
                // Create splatter on player
                playerSplatter = {
                    playerIndex: index,
                    opacity: 1.0
                };
                
                if (player1Score >= WINS_NEEDED || player2Score >= WINS_NEEDED) {
                    gameState = 'gameOver';
                    playWinSound();
                } else {
                    setTimeout(() => {
                        initGame();
                    }, 1000);
                }
                
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
            if (goo && goo.x > building.x && goo.x < building.x + building.width &&
                goo.y > building.y && goo.y < building.y + building.height) {
                
                // Create building hit particles
                createParticles(goo.x, goo.y, '#666666', 15);
                
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
    
    // Draw game elements (always draw buildings and players so they're visible)
    if (gameState !== 'start' || buildings.length > 0) {
        drawBuildings();
        drawPlayers();
        drawPlayerSplatter();
        drawGoo();
        updateParticles();
        drawMeters();
    }
    
    // Update game logic
    if (gameState === 'playerTurn') {
        updateMeters();
    } else if (gameState === 'playing') {
        updateGoo();
    }
    
    // Draw overlays
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
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
        ctx.fillStyle = currentPlayer === 1 ? '#790ECB' : '#a855f7';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 50);
        ctx.lineTo(player.x - 10, player.y - 60);
        ctx.lineTo(player.x + 10, player.y - 60);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (gameState === 'start') {
            initGame();
        } else if (gameState === 'gameOver') {
            player1Score = 0;
            player2Score = 0;
            currentPlayer = 1;
            updateScoreDisplay();
            initGame();
        } else if (gameState === 'playerTurn') {
            if (selectingAngle) {
                selectingAngle = false;
            } else {
                shootGoo();
            }
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'start') {
        initGame();
    } else if (gameState === 'gameOver') {
        player1Score = 0;
        player2Score = 0;
        currentPlayer = 1;
        updateScoreDisplay();
        initGame();
    }
});

// Initialize buildings and players for start screen
generateBuildings();
initializePlayers();

// Start game loop
gameLoop();
