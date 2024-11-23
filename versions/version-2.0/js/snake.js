// ----------------------------------
// LISTENERS AND CANVAS SETUP
// ----------------------------------

// Listeners
document.addEventListener("keydown", keyPush);

// Canvas
const canvas = document.querySelector("canvas");
const title = document.querySelector("h1");
const ctx = canvas.getContext("2d");

// ----------------------------------
// GAME SETTINGS AND CONSTANTS
// ----------------------------------

// Game Settings
const gameSettings = {
  wallCollisions: false, // Set to true for wall collisions
  fps: 8, 
};

// Game Constants
const interval = 1000 / gameSettings.fps; // Interval between frames in miliseconds
const tileSize = 50;
const tileCountX = canvas.width / tileSize;
const tileCountY = canvas.height / tileSize;

// ----------------------------------
// GAME STATE (CHANGES OVER TIME)
// ----------------------------------

// Game State
let lastTime = 0; // Timestamp of the last frame
let gameIsRunning = true;
let score = 0;

// Player
let snakeSpeed = tileSize;
let snakePosX = 0;
let snakePosY = canvas.height / 2;

let velocityX = 1;
let velocityY = 0;

let tail = [];
let snakeLength = 4;

// Food
let foodPosX = 0;
let foodPosY = 0;

// ----------------------------------
// INITIALIZATION AND STARTUP
// ----------------------------------

// Start the game loop with the initial timestamp
resetFood();
requestAnimationFrame(gameLoop);

// ----------------------------------
// MAIN GAME LOOP
// ----------------------------------
function gameLoop(currentTime) {
  if (gameIsRunning) {
    // Calculate the time since the last frame
    const deltaTime = currentTime - lastTime;

    // If enough time has passed, render the next frame
    if (deltaTime >= interval) {
      lastTime += interval;
      drawStuff(); // Drawing the game
      moveStuff(); // Moving the game
    }
    
    // Request the next frame
    requestAnimationFrame(gameLoop);
  }
}

// ----------------------------------
// GAME LOGIC FUNCTIONS
// ----------------------------------

/**
 * MOVE EVERYTHING - updates snake position, check collisions, handle tail grown.
 */
function moveStuff() {
  // Update snake position
  snakePosX += snakeSpeed * velocityX;
  snakePosY += snakeSpeed * velocityY;

  // Handle if goThroughWalls or wallCollisions - check gameSettings to decide behavior.
  if (gameSettings.wallCollisions) {
    checkWallCollision();
  } else {
    goThroughWalls();
  }

  // Check collisions
  checkTailCollision();
  checkFoodCollision();

  // Update tail
  tail.push({ x: snakePosX, y: snakePosY });  // Add the current position to the tail
  tail = tail.slice(-1 * snakeLength);        // Keep only the latest positions up to the length of the snake 
}

// ----------------------------------
// COLLISIONS (videogames "collision system") 
// ----------------------------------

/**
 * Hadles wrapping around the screen edges
 */
function goThroughWalls() {
  // Handle horizontal border go through
  if (snakePosX > canvas.width - tileSize) {
    snakePosX = 0;
     }
  if (snakePosX < 0) {
    snakePosX = canvas.width;
    }

    // Handle vertical border go through
  if (snakePosY > canvas.height - tileSize) {
    snakePosY = 0;
    }
  if (snakePosY < 0) {
    snakePosY = canvas.height;
    }
}

/**
 * GAME OVER (crash into wall)
 */
function checkWallCollision() {
  // Check horizontal border collision
  if (snakePosX > canvas.width - tileSize || snakePosX < 0) {
    gameOver();
     }

  // Check vertical border collision
  if (snakePosY > canvas.height - tileSize || snakePosY < 0) {
    gameOver();
    }  
}

/**
 * GAME OVER (crash into myself)
 */
function checkTailCollision() {
  tail.forEach((snakePart) => {
    if (snakePosX === snakePart.x && snakePosY === snakePart.y) {
      gameOver();
    }
  });
}

/**
 * Increase score and grow the snake whe eat food.
 */
function checkFoodCollision() {
  if (snakePosX === foodPosX && snakePosY === foodPosY) {
    title.textContent = ++score;
    snakeLength++;
    resetFood();
  }
} 

// ----------------------------------
// DRAWING FUNCTIONS
// ----------------------------------

/**
 * DRAW EVERYTHING - draw entire game state.
 */
function drawStuff() {
  rectangle("#f1c232", 0, 0, canvas.width, canvas.height); // Background
  drawGrid(); // Grid lines
  circle("#05abd7", foodPosX, foodPosY, tileSize, tileSize); // Food

  // Snake tail
  tail.forEach((snakePart) =>
    circle("#555", snakePart.x, snakePart.y, tileSize, tileSize)
  );

  circle("black", snakePosX, snakePosY, tileSize, tileSize); // Snake head
}

/**
 * Draw a rectangle on the canva - used in: background, drawGrid().
 */
function rectangle(color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Draw a circle on the canvas.
 */
function circle(color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 2, 0, 2 * Math.PI)
  ctx.fill();
}

/**
 * Draw the grid.
 */
function drawGrid() {
  for (let i = 0; i < tileCountX; i++) {    // No. of tiles on X Axis
    for (let j = 0; j < tileCountY; j++) {  // No. of tiles on Y Axis
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

// ----------------------------------
// UTILITY FUNCTIONS
// ----------------------------------

/**
 * Randomizes food position and ensures it won't be re-spawn on any part of snake. 
 */
function resetFood() {
  // GAME OVER (nowhere to go)
  if (snakeLength === tileCountX * tileCountY) {
    gameOver();
  }

  foodPosX = Math.floor(Math.random() * tileCountX) * tileSize;
  foodPosY = Math.floor(Math.random() * tileCountY) * tileSize;

  // Don't spawn food on snake head
  if (foodPosX === snakePosX && foodPosY === snakePosY) {
    resetFood();
  }

  // Don't spawn food on any snake part
  if (
    tail.some(
      (snakePart) => snakePart.x === foodPosX && snakePart.y === foodPosY
    )
  ) {
    resetFood();
  }
}

/**
 * Ends the game and display the final score.
 * Wait for user to restart the game by pushing a keyboard.
 */
function gameOver() {
  title.innerHTML = `☠️ <strong> ${score} </strong> ☠️`;
  gameIsRunning = false;
}

// ----------------------------------
// INPUT HANDLING
// ----------------------------------

/**
 * KEYBOARD - game controls.
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
