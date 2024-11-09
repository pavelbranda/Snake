// listeners
document.addEventListener("keydown", keyPush);

// canvas
const canvas = document.querySelector("canvas");
const title = document.querySelector("h1");
const ctx = canvas.getContext("2d");

// game
let gameIsRunning = true;

const fps = 8;
const tileSize = 50;
const tileCountX = canvas.width / tileSize;
const tileCountY = canvas.height / tileSize;

let score = 0;

// player
let snakeSpeed = tileSize;
let snakePosX = 0;
let snakePosY = canvas.height / 2;

let velocityX = 1;
let velocityY = 0;

let tail = [];
let snakeLength = 4;

// food
let foodPosX = 0;
let foodPosY = 0;

// loop
function gameLoop() {
  if (gameIsRunning) {
    drawStuff(); // hra se kreslí
    moveStuff(); // hra se hýbe
    setTimeout(gameLoop, 1000 / fps);
  }
}

resetFood();
gameLoop();

/**
 * MOVE EVERYTHING
 */
function moveStuff() {
  snakePosX += snakeSpeed * velocityX;
  snakePosY += snakeSpeed * velocityY;

  // videogames "collision system"
  // wall collision
  if (snakePosX > canvas.width - tileSize) {
    snakePosX = 0;
  }
  if (snakePosX < 0) {
    snakePosX = canvas.width;
  }
  if (snakePosY > canvas.height - tileSize) {
    snakePosY = 0;
  }
  if (snakePosY < 0) {
    snakePosY = canvas.height;
  }

  // GAME OVER (crash into myself)
  tail.forEach((snakePart) => {
    if (snakePosX === snakePart.x && snakePosY === snakePart.y) {
      gameOver();
    }
  });

  // tail
  tail.push({ x: snakePosX, y: snakePosY });

  // forget earliest parts of snake
  tail = tail.slice(-1 * snakeLength);

  // food collision
  if (snakePosX === foodPosX && snakePosY === foodPosY) {
    title.textContent = ++score;
    snakeLength++;
    resetFood();
  }
}

/**
 * DRAW EVERYTHING
 */
function drawStuff() {
  // background
  rectangle("#f1c232", 0, 0, canvas.width, canvas.height);

  // grid
  drawGrid();

  // food
  circle("#05abd7", foodPosX, foodPosY, tileSize, tileSize);

  // tail
  tail.forEach((snakePart) =>
    circle("#555", snakePart.x, snakePart.y, tileSize, tileSize)
  );

  // snake
  circle("black", snakePosX, snakePosY, tileSize, tileSize);
}

// draw rectangle - used in: background, drawGrid()
function rectangle(color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// draw circle - used in: snake, tail, food
function circle(color, x, y, width, height) {
  ctx.fillStyle = color;
  //ctx.fillRect(x, y, width, height);
  ctx.beginPath();
  ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2, 0, 2 * Math.PI)
  ctx.fill();
}

// randomize food position
function resetFood(params) {
  // GAME OVER (nowhere to go)
  if (snakeLength === tileCountX * tileCountY) {
    gameOver();
  }


  foodPosX = Math.floor(Math.random() * tileCountX) * tileSize;
  foodPosY = Math.floor(Math.random() * tileCountY) * tileSize;

  // dont spawn food on snake head
  if (foodPosX === snakePosX && foodPosY === snakePosY) {
    resetFood();
  }

  // dont spawn food on any snake part
  if (
    tail.some(
      (snakePart) => snakePart.x === foodPosX && snakePart.y === foodPosY
    )
  ) {
    resetFood();
  }
}

// GAME OVER
// KEYBOARD restarts game
function gameOver() {
  title.innerHTML = `☠️ <strong> ${score} </strong> ☠️`;
  gameIsRunning = false;
}

/**
 * KEYBOARD
 */
function keyPush(event) {
  switch (event.key) {
    case "ArrowLeft":
      if (velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
      }
      break;
    case "ArrowUp":
      if (velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
      }
      break;
    case "ArrowRight":
      if (velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
      }
      break;
    case "ArrowDown":
      if (velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
      }
      break;
    default:
      // restart game
      if (!gameIsRunning) location.reload();
      break;
  }
}

// grid
function drawGrid() {
  for (let i = 0; i < tileCountX; i++) {
    // počet dlaždic na ose X
    for (let j = 0; j < tileCountY; j++) {
      // počet dlaždic na ose Y
      rectangle(
        "#fff",
        tileSize * i,
        tileSize * j,
        tileSize - 1,
        tileSize - 1
      );
    }
  }
}