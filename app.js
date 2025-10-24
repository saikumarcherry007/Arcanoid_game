// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// Make canvas fullscreen
function resizeCanvas() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
}

// Initial resize and listen for window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//Border
cvs.style.border = "1px solid #0ff";
ctx.lineWidth = 3;



// Constants and variables

let LIFE = 3; // 3 chances 
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 10; // Increased from 3 to 10 levels
let GAME_OVER = false;
let gameStarted = false;
let isPaused = false;

//Paddle 
let PADDLE_WIDTH = 100;
let PADDLE_MARGIN_BOTTOM = 50;
let PADDLE_HEIGHT = 10;

const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx :5
}

// Update paddle and game elements based on screen size
function updateGameScale() {
    // Scale paddle based on screen width
    PADDLE_WIDTH = Math.max(80, Math.min(cvs.width * 0.15, 150));
    PADDLE_HEIGHT = Math.max(8, cvs.height * 0.015);
    PADDLE_MARGIN_BOTTOM = cvs.height * 0.08;
    
    paddle.width = PADDLE_WIDTH;
    paddle.height = PADDLE_HEIGHT;
    paddle.y = cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT;
    
    // Keep paddle within bounds
    if (paddle.x + paddle.width > cvs.width) {
        paddle.x = cvs.width - paddle.width;
    }
    if (paddle.x < 0) {
        paddle.x = 0;
    }
}

// Call on resize
window.addEventListener('resize', function() {
    resizeCanvas();
    updateGameScale();
    updateBallScale();
    updateBrickScale();
    if (bricks.length > 0) {
        createBricks();
    }
});
// draw paddle with glow
function drawPaddle(){
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#0ff";
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.restore();
}


function pauseGame()
{
    isPaused = true;
}

function resumeGame()
{
    isPaused = false;
}
// Controlling the paddle with buttons
let leftArrow = false;
let rightArrow = false;


document.addEventListener("keydown", function(event){
   if(event.keyCode == 37){
       leftArrow = true;
   }else if(event.keyCode == 39){
       rightArrow = true;
   }
});
document.addEventListener("keyup", function(event){
   if(event.keyCode == 37){
       leftArrow = false;
   }else if(event.keyCode == 39){
       rightArrow = false;
   }
});
// Touch controls for mobile
cvs.addEventListener("touchstart", function(event) {
    event.preventDefault();
});
cvs.addEventListener("touchmove", function(event) {
    event.preventDefault();
    let rect = cvs.getBoundingClientRect();
    let x = event.touches[0].clientX - rect.left;
    let scaleX = cvs.width / rect.width;
    paddle.x = x * scaleX - paddle.width / 2;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > cvs.width) paddle.x = cvs.width - paddle.width;
});
// paddle movement
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// Ball
let BALL_RADIUS = 9;
const ball = {
    x : cvs.width/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 5,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// Update ball size based on screen
function updateBallScale() {
    BALL_RADIUS = Math.max(6, Math.min(cvs.width * 0.015, 12));
    ball.radius = BALL_RADIUS;
}

// Particle system for effects
const particles = [];
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.97;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

// Ball trail effect
const ballTrail = [];
const TRAIL_LENGTH = 8;

// Screen shake effect
let shakeTime = 0;
let shakeIntensity = 0;

function screenShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTime = duration;
}

// Level transition effect
let levelTransition = false;
let transitionAlpha = 0;
let transitionText = "";

function startLevelTransition(text) {
    levelTransition = true;
    transitionAlpha = 0;
    transitionText = text;
}

//Draw ball with trail and glow
function drawBall(){
    // Draw ball trail
    ballTrail.push({x: ball.x, y: ball.y});
    if (ballTrail.length > TRAIL_LENGTH) {
        ballTrail.shift();
    }
    
    // Draw trail
    for (let i = 0; i < ballTrail.length; i++) {
        const alpha = i / ballTrail.length;
        const size = ball.radius * alpha;
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(ballTrail[i].x, ballTrail[i].y, size, 0, Math.PI*2);
        ctx.fillStyle = "#0ff";
        ctx.fill();
        ctx.restore();
    }
    
    // Draw glow effect
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0ff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    ctx.closePath();
}

// move ball
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// wall and ball collision 
function ballWallCollision(){
    // Left and right wall collision with position correction
    if(ball.x + ball.radius > cvs.width){
        ball.x = cvs.width - ball.radius;
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
        WALL_HIT.play();
    }
    
    if(ball.x - ball.radius < 0){
        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx); // Ensure ball moves right
        WALL_HIT.play();
    }
    
    // Top wall collision with position correction
    if(ball.y - ball.radius < 0){
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy); // Ensure ball moves down
        WALL_HIT.play();
    }
    
    // Bottom - life lost
    if(ball.y + ball.radius > cvs.height){
        LIFE--; // lost life
        LIFE_LOST.play();
        screenShake(5, 20);
        createParticles(ball.x, cvs.height, "#ff0000", 20);
        resetBall();
    }
}

//Ball reset
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

// Ball and paddle collision
function ballPaddleCollision(){
    if(ball.x + ball.radius > paddle.x && 
       ball.x - ball.radius < paddle.x + paddle.width && 
       ball.y + ball.radius > paddle.y && 
       ball.y - ball.radius < paddle.y + paddle.height){
        
        // Ensure ball is above paddle to prevent sticking
        if(ball.dy > 0){
            // Play sound
            PADDLE_HIT.play();
        
            // Position ball on top of paddle
            ball.y = paddle.y - ball.radius;
            
            let collidePoint = ball.x - (paddle.x + paddle.width/2);
            collidePoint = collidePoint / (paddle.width/2);
            
            // Calculating the angle
            let angle = collidePoint * Math.PI/3;
                
            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = -Math.abs(ball.speed * Math.cos(angle)); // Ensure ball goes up
            
            // Add particle effect on paddle hit
            createParticles(ball.x, paddle.y, "#0ff", 5);
        }
    }
}

// Bricks
const brick = {
    row : 1,
    column : 8,
    width : 0,
    height : 0,
    offSetLeft : 0,
    offSetTop : 0,
    marginTop : 0,
    fillColor : "#2e3548",
    strokeColor : "#FFF"
}

// Update brick dimensions based on screen size
function updateBrickScale() {
    const availableWidth = cvs.width * 0.9;
    const availableHeight = cvs.height * 0.4;
    
    // Calculate brick width with proper spacing
    const spacing = 2;
    brick.width = Math.floor((availableWidth - (brick.column + 1) * spacing) / brick.column);
    brick.height = Math.max(10, Math.floor(cvs.height * 0.025));
    
    // Calculate offsets to center the brick grid
    const totalBricksWidth = (brick.width * brick.column) + (spacing * (brick.column - 1));
    brick.offSetLeft = Math.floor((cvs.width - totalBricksWidth) / 2);
    brick.offSetTop = spacing;
    brick.marginTop = Math.floor(cvs.height * 0.08);
}

let bricks = [];

// Array of colors for brick variety
const brickColors = [
    "#FF6B6B", // Red
    "#4ECDC4", // Cyan
    "#45B7D1", // Blue
    "#FFA07A", // Orange
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Purple
    "#85C1E2"  // Sky Blue
];

// Random brick pattern generator
function getRandomPattern() {
    const patterns = [
        'full',      // All bricks present
        'checker',   // Checkerboard pattern
        'random',    // Random placement (70% chance)
        'pyramid',   // Pyramid shape
        'diamond',   // Diamond shape
        'zigzag'     // Zigzag pattern
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
}

function createBricks(){
    const pattern = getRandomPattern();
    
    updateBrickScale(); // Calculate brick dimensions
    
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            let shouldCreateBrick = true;
            
            // Determine if brick should exist based on pattern
            switch(pattern) {
                case 'checker':
                    shouldCreateBrick = (r + c) % 2 === 0;
                    break;
                case 'random':
                    shouldCreateBrick = Math.random() > 0.3;
                    break;
                case 'pyramid':
                    const distFromCenter = Math.abs(c - brick.column / 2);
                    shouldCreateBrick = distFromCenter <= r + 1;
                    break;
                case 'diamond':
                    const centerRow = brick.row / 2;
                    const centerCol = brick.column / 2;
                    const dist = Math.abs(r - centerRow) + Math.abs(c - centerCol);
                    shouldCreateBrick = dist < Math.max(brick.row, brick.column) / 2;
                    break;
                case 'zigzag':
                    shouldCreateBrick = (r % 2 === 0) ? (c % 2 === 0) : (c % 2 === 1);
                    break;
                default: // 'full'
                    shouldCreateBrick = true;
            }
            
            bricks[r][c] = {
                x : brick.offSetLeft + c * (brick.width + 2),
                y : brick.marginTop + brick.offSetTop + r * (brick.height + 2),
                status : shouldCreateBrick,
                color : brickColors[Math.floor(Math.random() * brickColors.length)]
            }
        }
    }
}

createBricks();

// draw the bricks
function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // if the brick isn't broken
            if(b.status){
                // Use brick's own color
                ctx.fillStyle = b.color || brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                // Add glow effect to bricks
                ctx.save();
                ctx.shadowBlur = 5;
                ctx.shadowColor = b.color;
                ctx.strokeStyle = brick.strokeColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
                ctx.restore();
            }
        }
    }
}

// ball brick collision
function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // if the brick isn't broken
            if(b.status){
                if(ball.x + ball.radius > b.x && 
                   ball.x - ball.radius < b.x + brick.width && 
                   ball.y + ball.radius > b.y && 
                   ball.y - ball.radius < b.y + brick.height){
                    
                    BRICK_HIT.play();
                    
                    // Determine collision side for better physics
                    let ballCenterX = ball.x;
                    let ballCenterY = ball.y;
                    let brickCenterX = b.x + brick.width / 2;
                    let brickCenterY = b.y + brick.height / 2;
                    
                    let deltaX = Math.abs(ballCenterX - brickCenterX);
                    let deltaY = Math.abs(ballCenterY - brickCenterY);
                    
                    // Determine which side was hit
                    if(deltaX / brick.width > deltaY / brick.height){
                        // Hit from left or right
                        ball.dx = -ball.dx;
                        // Push ball out of brick
                        if(ballCenterX < brickCenterX){
                            ball.x = b.x - ball.radius;
                        } else {
                            ball.x = b.x + brick.width + ball.radius;
                        }
                    } else {
                        // Hit from top or bottom
                        ball.dy = -ball.dy;
                        // Push ball out of brick
                        if(ballCenterY < brickCenterY){
                            ball.y = b.y - ball.radius;
                        } else {
                            ball.y = b.y + brick.height + ball.radius;
                        }
                    }
                    
                    b.status = false; // the brick is broken
                    SCORE += SCORE_UNIT;
                    // Create particle explosion
                    createParticles(b.x + brick.width/2, b.y + brick.height/2, b.color, 15);
                }
            }
        }
    }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY){
    // draw text
    ctx.fillStyle = "#FFF";
    const fontSize = Math.max(16, cvs.height * 0.03);
    ctx.font = fontSize + "px Germania One";
    ctx.fillText(text, textX, textY);
    
    // draw image - scale based on screen size
    const iconSize = Math.max(20, cvs.height * 0.04);
    ctx.drawImage(img, imgX, imgY, iconSize, iconSize);
}

// Draw
function draw(){
    drawPaddle();
    
    drawBall();
    
    drawBricks();
    
    drawParticles();

    // Scale stats position based on screen size
    const margin = cvs.width * 0.02;
    const topMargin = cvs.height * 0.04;
    const iconSize = Math.max(20, cvs.height * 0.04);
    
    showGameStats(SCORE, margin + iconSize + 10, topMargin, SCORE_IMG, margin, topMargin - iconSize * 0.7); //score
    showGameStats(LIFE, cvs.width - margin - 10, topMargin, LIFE_IMG, cvs.width - margin - iconSize - 10, topMargin - iconSize * 0.7); //life
    showGameStats(LEVEL, cvs.width/2, topMargin, LEVEL_IMG, cvs.width/2 - iconSize - 10, topMargin - iconSize * 0.7);//lvls
    
    // Draw level transition
    if (levelTransition) {
        transitionAlpha += 0.02;
        if (transitionAlpha >= 1) {
            transitionAlpha = 1;
            setTimeout(() => {
                levelTransition = false;
            }, 1000);
        }
        ctx.save();
        ctx.globalAlpha = transitionAlpha * (2 - transitionAlpha);
        ctx.fillStyle = "#0ff";
        const transitionFontSize = Math.max(32, cvs.width * 0.08);
        ctx.font = transitionFontSize + "px Germania One";
        ctx.textAlign = "center";
        ctx.fillText(transitionText, cvs.width/2, cvs.height/2);
        ctx.restore();
    }
}

// game over
function gameOver(){
    if(LIFE <= 0){
        showYouLose();
        GAME_OVER = true;
    }
}

// level up
function levelUp(){
    let isLevelDone = true;
    
    // check if all the bricks are broken
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();
        
        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }
        // Increase rows gradually, max 6 rows
        if(brick.row < 6) {
            brick.row++;
        }
        // Increase columns on higher levels, max 10 columns
        if(LEVEL % 3 === 0 && brick.column < 10) {
            brick.column++;
        }
        createBricks(); // This will generate a new random pattern
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
        startLevelTransition("LEVEL " + LEVEL);
        createParticles(cvs.width/2, cvs.height/2, "#0ff", 30);
    }
}

// Update function
function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
    
    ballPaddleCollision();
    
    ballBrickCollision();
    
    gameOver();
    
    levelUp();
    
    updateParticles();
    
    // Update screen shake
    if (shakeTime > 0) {
        shakeTime--;
    }
}

// game loop
function loop(){
    if (!gameStarted) return;
    
    ctx.save();
    
    // Apply screen shake
    if (shakeTime > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.drawImage(BG_IMG, 0, 0, cvs.width, cvs.height);
    
    draw();
    
    if (!isPaused) {
        update();
    } else {
        // Display pause text
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.fillStyle = "#0ff";
        const pauseFontSize = Math.max(32, cvs.width * 0.08);
        ctx.font = pauseFontSize + "px Germania One";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", cvs.width/2, cvs.height/2);
        ctx.restore();
    }
    
    ctx.restore();
    
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
// Don't auto-start the loop - wait for user to click start button
// loop();


// selecting sound element
const soundElement  = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
  
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";
    
    soundElement.setAttribute("src", SOUND_IMG);
    
    // Sounds on/ off
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}
//selecting elemnts
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");



// win
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}
// Shows loose
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}















function startGame() {
    if (document.getElementById('rules-modal').style.display === 'flex') return;
    if (gameStarted) return; // Prevent multiple starts
    
    // Initialize game scale
    updateGameScale();
    updateBallScale();
    updateBrickScale();
    
    gameStarted = true;
    loop(); // Start the main game loop
}

// Pause button functionality
document.getElementById('pause-btn').addEventListener('click', function() {
    if (!gameStarted) return;
    
    if (isPaused) {
        resumeGame();
        this.textContent = 'Pause';
    } else {
        pauseGame();
        this.textContent = 'Resume';
    }
});



