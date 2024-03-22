let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
let lastTimeStamp;

let heroX;
let heroY;
let screenOffset;

let platforms = [];
let sticks = [];

let score = 0;

const canvasWidth = 1200;
const canvasHeight = 375;
const platformHeight = 100;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart");

const stretchingSpeed = 4; // Milliseconds it takes to draw a pixel
const turningSpeed = 4; // Milliseconds it takes to turn a degree
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

resetGame();

function resetGame() {
    phase = "waiting";
    score = 0;
    platforms = [{x : 50, w : 50}];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    heroX = platforms[0].x + platforms[0].w - 30;
    heroY = 0;
    screenOffset = 0;
    sticks = [ { x : platforms[0].x , y:  platforms[0].y, length : 0, rotation : 0 } ];

    restartButton.style.display = "none";
    scoreElement.innerText = score;

    draw();
}

function generatePlatform() {
    minGap = 40;
    maxGap = 200;
    minWidth = 20;
    maxWidth = 100;
    
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;
    const x = furthestX + minGap + Math.floor(Math.random() * (maxWidth-minWidth));
    const w = minWidth + Math.floor(Math.random() * (maxWidth-minWidth));
    platforms.push({x,w});
}

function drawPlatforms() {
    platforms.forEach(({x,w})=>{
        ctx.fillStyle = "black";
        ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight);
    })
}

function drawHero() {
    // console.log(phase);
    const heroWidth = 20;
    const heroHeight = 30;
    ctx.fillStyle = "red";
    ctx.fillRect(
        heroX,heroY+canvasHeight-platformHeight-heroHeight,
        heroWidth,
        heroHeight
    );
    if(phase==="falling") {
        
    }
}

function drawSticks() {
    sticks.forEach((stick)=>{
        ctx.save();
        // console.log(stick);

    // Move the anchor point to the start of the stick and rotate
        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        // Draw stick
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -stick.length);
        ctx.stroke();

        // Restore transformations
        ctx.restore();
    });
}

function draw() {
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    ctx.save();
    ctx.translate(-screenOffset,0);
    
    drawPlatforms();
    drawSticks();
    drawHero();

    ctx.restore();
}


window.addEventListener("mousedown", function () {
    // console.log("mouse down");
  if (phase == "waiting") {
    phase = "stretching";
    lastTimeStamp = undefined;
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function () {
  if (phase == "stretching") {
    phase = "turning";
    // window.requestAnimationFrame(animate);
  }
});

restartButton.addEventListener("click", function (event) {
  resetGame();
  restartButton.style.display = "none";
});

function animate(timestamp) {
    // console.log(timestamp);
    if(!lastTimeStamp) {
        lastTimeStamp = timestamp;
        window.requestAnimationFrame(animate);
        // return ;
    }
    let timePassed = timestamp - lastTimeStamp;
    switch(phase) {
        case "waiting":
            return;
        case "stretching":
            sticks[sticks.length-1].length += timePassed / stretchingSpeed;
            if(sticks[sticks.length-1].rotation>=90) {
                sticks[sticks.length-1].rotation = 90;
                let nextPlatform = thePlatFormStickHits();
                if(nextPlatform)  {
                    score++;
                    score.innerText = score;
                    generatePlatform();
                }
                phase = "walking";
            }
            break;
        case "turning":
            sticks[sticks.length-1].rotation += timePassed / turningSpeed;
            if (sticks[sticks.length - 1].rotation >= 90) {
                sticks[sticks.length - 1].rotation = 90;
        
                const nextPlatform = thePlatFormStickHits();
                if (nextPlatform) {
                  score++;
                  scoreElement.innerText = score;
                  generatePlatform();
                }
                phase = "walking";
              }
            break;
        case "walking":
            heroX += timePassed / walkingSpeed;
            nextPlatform = thePlatFormStickHits();
            if(nextPlatform) {
                const maxHeroX = nextPlatform.x + nextPlatform.w - 30;
                if(heroX>maxHeroX) {
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            }else {
                const maxHeroX = sticks[sticks.length-1].x + sticks[sticks.length-1].length;
                if(heroX>maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                }
            }
            break;
        case "transitioning":
            screenOffset += timePassed / transitioningSpeed;
            nextPlatform = thePlatFormStickHits();
            if (nextPlatform.x + nextPlatform.w - screenOffset < 100) {
                sticks.push({
                    x : nextPlatform.x + nextPlatform.w,
                    length : 0,
                    rotation : 0,
                });
                phase = "waiting";
            }
            break;
        case "falling":
            // console.log("falling");
            heroY = timePassed / fallingSpeed;
            if(sticks[sticks.length-1].rotation<180) {
                sticks[sticks.length - 1].rotation += timePassed / turningSpeed;
            }
            const maxHeroY = platformHeight + 1000;
            // console.log(maxHeroY,heroY);
            restartButton.style.display = "block";
            return;
    }
    draw();
    lastTimeStamp = timestamp;
    window.requestAnimationFrame(animate);
}

function thePlatFormStickHits() {
    const lastStick = sticks[sticks.length - 1];
    const stickFarX = lastStick.x + lastStick.length;

    const platformTheStickHits = platforms.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );
    return platformTheStickHits;
}