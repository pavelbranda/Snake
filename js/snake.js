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
const gridSize = 12;

// Game Constants
const interval = 1000 / gameSettings.fps; // Interval between frames in miliseconds

// Tile and Grid dimensions (updated dynamically)
let tileSize, tileCountX, tileCountY;

// ----------------------------------
// GAME STATE (CHANGES OVER TIME)
// ----------------------------------

// Game State
let lastTime = 0; // Timestamp of the last frame
let gameIsRunning = true;
let score = 0;

// Player
let snakeSpeed, snakePosX, snakePosY;
let velocityX = 1, velocityY = 0;
let tail = [];
let snakeLength = 4;

// Food
let foodPosX = 0;
let foodPosY = 0;

// ----------------------------------
// INITIALIZATION AND STARTUP
// ----------------------------------
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
  // NEW - update the direction when snake move 
  // Apply the next direction
  velocityX = nextVelocityX;
  velocityY = nextVelocityY;

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
  if (snakePosX >= canvas.width) {
    snakePosX = 0;
  } else if (snakePosX < 0) {
    snakePosX = canvas.width - tileSize;
  }

  // Handle vertical border go through
  if (snakePosY >= canvas.height) {
    snakePosY = 0;
  } else if (snakePosY < 0) {
    snakePosY = canvas.height - tileSize;
  }

  // Snap to grid to avoid misalignment
  snakePosX = Math.round(snakePosX / tileSize) * tileSize;
  snakePosY = Math.round(snakePosY / tileSize) * tileSize;
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
  let collisionDetected = false;

  tail.forEach((snakePart) => {
    if (snakePosX === snakePart.x && snakePosY === snakePart.y) {
      // Highlight the tile when collision occured
      rectangle("red", snakePart.x, snakePart.y, tileSize, tileSize);
      collisionDetected = true;
    }
  });

  if (collisionDetected) {
    console.log("Collision detected! Game over.")
    gameOver();
  }
}

/**
 * Increase score and grow the snake when eat food.
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
 * Initializes the canvas size dynamically based on the viewport dimensions.
 */
function initializeCanvas() {
  const size = Math.floor(Math.min(window.innerWidth, window.innerHeight)) * 0.9 / gridSize; // Ensures divisibility
  canvas.width = size;
  canvas.height = size; 

  updateGrid(); // Recalculate grid variables
  resetSnakePosition(); // Align the snake with the grid
  console.log(`Canvas initialized: ${canvas.width}x${canvas.height}, Tile size: ${tileSize}`);
}

/**
 * Updates grid dimensions and tile size based on the canvas size.
 */
function updateGrid() {
  tileSize = canvas.width / gridSize; // Ensure consistent tile size
  tileCountX = gridSize; // Fixed number of tiles on the X-axis
  tileCountY = gridSize; // Fixed number of tiles on the Y-axis
  snakeSpeed = tileSize; // Match snake speed with tile size
}

/**
 * Resizes the canvas and recalculates grid dimensions dynamically.
 */
function resizeCanvas() {
  // Calculate the size based on viewport dimensions
  const availableHeight = window.innerHeight - title.offsetHeight;
  const size = Math.floor(Math.min(window.innerWidth, availableHeight) * 0.9 / gridSize) * gridSize; // Ensure divisibility
  canvas.width = size;
  canvas.height = size; 
  
  updateGrid(); // Recalculate grid variables
  resetSnakePosition(); // Align the snake to the updated grid
  resetFood(); // Ensure food is placed correctly
  drawStuff(); // Redraw the game state
  console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);
}

/**
 * Resets the snake's position to the center of the canvas grid.
 */
function resetSnakePosition() {
  snakePosX = Math.round(tileCountX / 2) * tileSize; // Center X
  snakePosY = Math.round(tileCountY / 2) * tileSize; // Center Y
  // snakeSpeed = tileSize; // Ensure the speed matches the grid size
}

/**
 * Randomizes food position within the grid and avoids spawning on the snake.
 */
function resetFood() {
  do {
    foodPosX = Math.round(Math.random() * (tileCountX - 1)) * tileSize;
    foodPosY = Math.round(Math.random() * (tileCountY - 1)) * tileSize;
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

// NEW - to store the upcoming direction
let nextVelocityX = 1; // Start moving right
let nextVelocityY = 0;

function keyPush(event) {
  // Prevent default behavior for arrow keyPush
  const keysToPrevent = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];  // What about backspace ?!
  if (keysToPrevent.includes(event.key)) {
    event.preventDefault();
  }

  // Handle game controls
  switch (event.key) {
    case "ArrowLeft":
      if (velocityX !== 1) { // Prevent reversing right
        nextVelocityX = -1;
        nextVelocityY = 0;
      }
      break;
    case "ArrowUp":
      if (velocityY !== 1) { // Prevent reversing down
        nextVelocityX = 0;
        nextVelocityY = -1;
      }
      break;
    case "ArrowRight":
      if (velocityX !== -1) { // Prevent reversing left
        nextVelocityX = 1;
        nextVelocityY = 0;
      }
      break;
    case "ArrowDown":
      if (velocityY !== -1) { // Prevent reversing up
        nextVelocityX = 0;
        nextVelocityY = 1;
      }
      break;
    default:
      // restart game
      if (!gameIsRunning) location.reload();
      break;
  }
}


