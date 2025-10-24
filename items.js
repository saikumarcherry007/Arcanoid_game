// Images 
const BG_IMG = new Image();
BG_IMG.src = "img/bg2.jpg";
const LEVEL_IMG = new Image();
LEVEL_IMG.src = "img/level.png";
const LIFE_IMG = new Image();
LIFE_IMG.src = "img/life.png";
const SCORE_IMG = new Image();
SCORE_IMG.src = "img/score.png";

//Sounds
const WALL_HIT = new Audio();
WALL_HIT.src = "sounds/wall.mp3";
const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/life_lost.mp3";
const PADDLE_HIT = new Audio();
PADDLE_HIT.src = "sounds/wall.mp3";
const WIN = new Audio();
WIN.src = "sounds/win.mp3";
const BRICK_HIT = new Audio();
BRICK_HIT.src = "sounds/brick_hit.mp3";

// Loading logic
let loadedAssets = 0;
const totalAssets = 9; // 4 images + 5 sounds

function assetLoaded() {
    loadedAssets++;
    if (loadedAssets === totalAssets) {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('loading-text').style.display = 'none';
        document.getElementById('start-btn').style.display = 'block';
        document.getElementById('rules-btn').style.display = 'block';
    }
}

BG_IMG.onload = assetLoaded;
LEVEL_IMG.onload = assetLoaded;
LIFE_IMG.onload = assetLoaded;
SCORE_IMG.onload = assetLoaded;

WALL_HIT.oncanplaythrough = assetLoaded;
LIFE_LOST.oncanplaythrough = assetLoaded;
PADDLE_HIT.oncanplaythrough = assetLoaded;
WIN.oncanplaythrough = assetLoaded;
BRICK_HIT.oncanplaythrough = assetLoaded;

// Button event listeners
document.getElementById('start-btn').addEventListener('click', function() {
    document.getElementById('loading').style.display = 'none';
    // Start the game
    startGame();
});

document.getElementById('rules-btn').addEventListener('click', function() {
    document.getElementById('rules-modal').style.display = 'flex';
    document.getElementById('loading').style.pointerEvents = 'none';
});

document.getElementById('close-rules').addEventListener('click', function() {
    document.getElementById('rules-modal').style.display = 'none';
    document.getElementById('loading').style.pointerEvents = 'auto';
});

// Allow closing modal by clicking background
document.getElementById('rules-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        document.getElementById('loading').style.pointerEvents = 'auto';
    }
});

// Prevent clicks on rules content from closing modal
document.getElementById('rules-content').addEventListener('click', function(e) {
    e.stopPropagation();
});

