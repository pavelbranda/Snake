// ----------------------------------
// LISTENERS AND CANVAS SETUP
// ----------------------------------

// Listeners
document.addEventListener("keydown", keyPush);
window.addEventListener("resize", resizeCanvas);

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
  fps: 8, // Initially set to 8
};

// Desired grid size (Initially set to 12)
const gridSize = 10;

// Game Constants
const interval = 1000 / gameSettings.fps; // Interval between frames in miliseconds

// This is NEW !
// Tile and Grid dimensions (updated dynamically)
let tileSize, tileCountX, tileCountY;


// const tileSize = 50;
// const tileCountX = canvas.width / tileSize;
// const tileCountY = canvas.height / tileSize;

// ----------------------------------
// GAME STATE (CHANGES OVER TIME)
// ----------------------------------

// Game State
let lastTime = 0; // Timestamp of the last frame
let gameIsRunning = true;
let score = 0;

// Player
// This is NEW !
let snakeSpeed, snakePosX, snakePosY;
let velocityX = 1, velocityY = 0;
let tail = [];
let snakeLength = 4;

// let snakeSpeed = tileSize;
// let snakePosX = 0;
// let snakePosY = canvas.height / 2;

// let velocityX = 1;
// let velocityY = 0;

// let tail = [];
// let snakeLength = 4;

// Food
let foodPosX = 0;
let foodPosY = 0;

// ----------------------------------
// INITIALIZATION AND STARTUP
// ----------------------------------
// This is NEW !
initializeCanvas(); // First, initialize canvas and grid
resetSnakePosition(); // Ensure the snake starts aligned
resetFood(); // Place the first food item on the board before starting the game
drawStuff(); // Draw the board immediately to prevent blinking
requestAnimationFrame(gameLoop); // Start the game loop with the initial timestamp

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

// This is NEW !
/**
 * Initializes the canvas size dynamically based on the viewport dimensions.
 */
function initializeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  canvas.width = Math.floor(size / gridSize) * gridSize; // Ensure divisible by grid size
  canvas.height = canvas.width; // Keep it square

  updateGrid();
  console.log(`Canvas initialized: ${canvas.width}x${canvas.height}`);
}

// This is NEW !
/**
 * Updates grid dimensions and tile size based on the canvas size.
 */
function updateGrid() {
  tileSize = canvas.width / gridSize // Adjust tile size based on grid size
  tileCountX = gridSize; // Fixed grid size
  tileCountY = gridSize; // Fixed grid size
  snakeSpeed = tileSize; // Match snake speed with tile size
}

// This is NEW !
/**
 * Resizes the canvas and recalculates grid dimensions dynamically.
 */
function resizeCanvas() {
  // Calculate the size based on viewport dimensions
  const availableHeight = window.innerHeight - title.offsetHeight;
  const size = Math.min(window.innerWidth, availableHeight) * 0.9;

  // Round size down to ensure it fits a grid divisible by tileSize
  // size = Math.floor(size / 20) * 20; // Ensure it's divisible by 20

  canvas.width = Math.floor(size / gridSize) * gridSize; // Ensure divisible by grid size
  canvas.height = canvas.width; // Keep it square

  updateGrid();
  resetSnakePosition(); // Align the snake to the updated grid
  resetFood(); // Recalculate food position
  drawStuff(); // Redraw the game state
  console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);
}

// This is NEW !
/**
 * Resets the snake's position to the center of the canvas grid.
 */
function resetSnakePosition() {
  snakePosX = Math.floor(tileCountX / 2) * tileSize; // Center X
  snakePosY = Math.floor(tileCountY / 2) * tileSize; // Center Y
  snakeSpeed = tileSize; // Ensure the speed matches the grid size
}




/**
 * Randomizes food position within the grid and avoids spawning on the snake.
 */
function resetFood() {
  do {
    foodPosX = Math.floor(Math.random() * tileCountX) * tileSize;
    foodPosY = Math.floor(Math.random() * tileCountY) * tileSize;
  } while (
    tail.some((part) => part.x === foodPosX && part.y === foodPosY) || // Avoid snake body
    (foodPosX === snakePosX && foodPosY === snakePosY) // Avoid snake head
  );
  console.log(`Food placed: (${foodPosX}, ${foodPosY})`);
}


/**
 * Ends the game and display the final score.
 * Wait for user to restart the game by pushing a keyboard.
 */
function gameOver() {
  title.innerHTML = `☠️ <strong> ${score} </strong> ☠️`;
  gameIsRunning = false;
}

// THIS IS NEW!
/**
 * Resizes the canvas and recalculates grid dimensions dynamically.
 */
function resizeCanvas() {
  const availableHeight = window.innerHeight - title.offsetHeight;
  const size = Math.min(window.innerWidth, availableHeight) * 0.9;
  canvas.width = Math.floor(size / 20) * 20; // Ensure divisible by 20
  canvas.height = canvas.width; // Keep it square
  updateGrid();
  resetSnakePosition(); // Align snake
  resetFood(); // Recalculate food
  drawStuff(); // Redraw game state
  console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);
}

// Call resizeCanvas initially and on window resize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


// ----------------------------------
// INPUT HANDLING
// ----------------------------------

/**
 * KEYBOARD - game controls.
 */
function keyPush(event) {
  // Prevent default behavior for arrow keyPush
  const keysToPrevent = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];  // What about backspace ?!
  if (keysToPrevent.includes(event.key)) {
    event.preventDefault();
  }

  // Handle game controls
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


