// SELECT CANVAS ELEMENT
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");
//Border
cvs.style.border = "1px solid #0ff";
ctx.lineWidth = 3;



// Constants and variables

let LIFE = 3; // 3 chances 
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;

//Paddle 
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 10;

const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx :5
}
// draw paddle
function drawPaddle(){
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.strokeStyle = "#2e3548";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}


function pauseGame()
{
    clearInterval(interval);
    isPaused = true;
    Canvas.style.opacity = 0.5;
    CanvasContext.font  ="90px tahoma";
    CanvasContext.fillStyle = "white";
    CanvasContext.textAlign = "center";
    CanvasContext.textBaseline = "middle";
    CanvasContext.fillText ("Game Paused", 400, 250);
}

function resumeGame()
{
    isPaused = fasle;
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    canvas.style.opacity = 1;
    interval = setInterval(runGame, 20);
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
// paddle movement
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// Ball
const BALL_RADIUS = 9;
const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 5,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

//Draw ball
function drawBall(){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
}

// move ball
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// wall and ball collision 
function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > cvs.height){
        LIFE--; // lost life
        LIFE_LOST.play();
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
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){
        
        // Play sound
        PADDLE_HIT.play();
    
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        collidePoint = collidePoint / (paddle.width/2);
        
        // Calculating the angle
        let angle = collidePoint * Math.PI/3;
            
            
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

// Bricks
const brick = {
    row : 1,
    column : 8,
    width : 28,
    height : 12,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#2e3548",
    strokeColor : "#FFF"
}

let bricks = [];

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true
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
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
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
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false; // the brick is broken
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

// show game stats
function showGameStats(text, textX, textY, img, imgX, imgY){
    // draw text
    ctx.fillStyle = "#FFF";
    ctx.font = "23px Germania One";
    ctx.fillText(text, textX, textY);
    
    // draw image
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// Draw
function draw(){
    drawPaddle();
    
    drawBall();
    
    drawBricks();

    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5); //score
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width-55, 5); //life
    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 5);//lvls
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
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
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
}

// game loop
function loop(){
    
    ctx.drawImage(BG_IMG, 0, 0);
    
    draw();
    
    update();
    
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();


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



















