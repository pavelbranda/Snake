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

// Game State - centralized object
const gameState = {
  isRunning: true, // Whether the game is currently running
  score: 0, // Current score
  lastTime: 0,
  snake: {
    x: 0, // Snake head X position
    y: 0, // Snake head Y position
    speed: 0, // Snake speed, initialized dynamically
    length: 4, // Initial snake length
    tail: [], // Positions of the snake tail
    velocityX: 1,
    velocityY: 0,
    nextVelocityX: 1,
    nextVelocityY: 0,
  },
  grid: {
    tileSize: 0,
    tileCountX: 0,
    tileCountY: 0,
  },
  food: {
    x: 0, // Food X position
    y: 0, // Food Y position
  }
};

// Desired grid size (Initially set to 12)
const gridSize = 12;

// Game Constants
const interval = 1000 / gameSettings.fps; // Interval between frames in miliseconds

// ----------------------------------
// INITIALIZATION AND STARTUP
// ----------------------------------
function startGame() {
  setSnakeStartPosition("left-edge"); // Choose "center" or "left-edge"
  initializeCanvas(); // First, initialize canvas and grid
  resetSnakePosition(); // Ensure the snake starts aligned
  resetFood(); // Place the first food item on the board before starting the game
  drawStuff(); // Draw the initial state board 
  requestAnimationFrame(gameLoop); // Start the game loop with the initial timestamp
}
startGame();

// ----------------------------------
// MAIN GAME LOOP
// ----------------------------------
function gameLoop(currentTime) {
  if (gameState.isRunning) {
    // Calculate the time since the last frame
    const deltaTime = currentTime - gameState.lastTime;

    // If enough time has passed, render the next frame
    if (deltaTime >= interval) {
      gameState.lastTime += interval;
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
function moveSnake() {
  // Update snake position
  gameState.snake.x += gameState.snake.speed * gameState.snake.velocityX;
  gameState.snake.y += gameState.snake.speed * gameState.snake.velocityY;
}

function updateTail () {
  gameState.snake.tail.push({ x: gameState.snake.x, y: gameState.snake.y }); // Add the current position to the tail
  if (gameState.snake.tail.length > gameState.snake.length) {
    gameState.snake.tail.shift(); // Remove the oldest tail segment
  }
}

function moveStuff() {
  // Apply the next direction
  gameState.snake.velocityX = gameState.snake.nextVelocityX;
  gameState.snake.velocityY = gameState.snake.nextVelocityY;

  moveSnake();
  collisionSystem();
  updateTail();
}

function collisionSystem() {
  // Handle if goThroughWalls or wallCollisions - check gameSettings to decide behavior.
  if (gameSettings.wallCollisions) {
    checkWallCollision();
  } else {
    goThroughWalls();
  }
  // Check collisions
  checkTailCollision();
  checkFoodCollision();
}

// ----------------------------------
// COLLISION HANDLING (videogames "collision system") 
// ----------------------------------

/**
 * Hadles wrapping around the screen edges
 */
function goThroughWalls() {
  // Handle horizontal border go through
  if (gameState.snake.x >= canvas.width) {
    gameState.snake.x = 0;
  } else if (gameState.snake.x < 0) {
    gameState.snake.x = canvas.width - gameState.grid.tileSize;
  }

  // Handle vertical border go through
  if (gameState.snake.y >= canvas.height) {
    gameState.snake.y = 0;
  } else if (gameState.snake.y < 0) {
    gameState.snake.y = canvas.height - gameState.grid.tileSize;
  }

  // Snap to grid to avoid misalignment
  gameState.snake.x = Math.round(gameState.snake.x / gameState.grid.tileSize) * gameState.grid.tileSize;
  gameState.snake.y = Math.round(gameState.snake.y / gameState.grid.tileSize) * gameState.grid.tileSize;
}

/**
 * GAME OVER (crash into wall)
 */
function checkWallCollision() {
  // Check horizontal border collision
  if (gameState.snake.x > canvas.width - gameState.grid.tileSize || gameState.snake.x < 0) {
    gameOver();
     }

  // Check vertical border collision
  if (gameState.snake.y > canvas.height - gameState.grid.tileSize || gameState.snake.y < 0) {
    gameOver();
    }  
}

/**
 * GAME OVER (crash into myself)
 */
function checkTailCollision() {
  let collisionDetected = false;

  gameState.snake.tail.forEach((snakePart) => {
    if (gameState.snake.x === snakePart.x && gameState.snake.y === snakePart.y) {
      // Highlight the tile when collision occured
      rectangle("red", snakePart.x, snakePart.y, gameState.grid.tileSize, gameState.grid.tileSize);
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
  // Using Math.abs to handle floating-point precision issues for food collision detection
  if (
      Math.abs(gameState.snake.x - gameState.food.x) < 0.01 &&
      Math.abs(gameState.snake.y - gameState.food.y) < 0.01
    ) {
    title.textContent = ++gameState.score; // Update the score in gameState
    gameState.snake.length++; // Increase the snake length
    resetFood(); // Place new food
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
  circle("#05abd7", gameState.food.x, gameState.food.y, gameState.grid.tileSize, gameState.grid.tileSize); // Food

  // Snake tail
  gameState.snake.tail.forEach((snakePart) =>
    circle("#555", snakePart.x, snakePart.y, gameState.grid.tileSize, gameState.grid.tileSize)
  );

  circle("black", gameState.snake.x, gameState.snake.y, gameState.grid.tileSize, gameState.grid.tileSize); // Snake head
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
  ctx.arc(x + gameState.grid.tileSize / 2, y + gameState.grid.tileSize / 2, gameState.grid.tileSize / 2, 0, 2 * Math.PI)
  ctx.fill();
}

/**
 * Draw the grid.
 */
function drawGrid() {
  for (let i = 0; i < gameState.grid.tileCountX; i++) {    // No. of tiles on X Axis
    for (let j = 0; j < gameState.grid.tileCountY; j++) {  // No. of tiles on Y Axis
      rectangle(
        "#fff",
        gameState.grid.tileSize * i,
        gameState.grid.tileSize * j,
        gameState.grid.tileSize - 1,
        gameState.grid.tileSize - 1
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
  const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9 / gridSize) * gridSize; // Ensures tiles fit perfectly in the grid
  canvas.width = size;
  canvas.height = size; 

  updateGrid(); // Recalculate grid variables
  resetSnakePosition(); // Align the snake with the grid
  console.log(`Canvas initialized: ${canvas.width}x${canvas.height}, Tile size: ${gameState.grid.tileSize}`);
}

/**
 * Updates grid dimensions and tile size based on the canvas size.
 */
function updateGrid() {
  gameState.grid.tileSize = canvas.width / gridSize; // Ensure consistent tile size
  gameState.grid.tileCountX = gridSize; // Fixed number of tiles on the X-axis
  gameState.grid.tileCountY = gridSize; // Fixed number of tiles on the Y-axis
  gameState.snake.speed = gameState.grid.tileSize; // Match snake speed with tile size
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
 * Sets the snake's starting position dynamically.
 * Options:
 * - "center": Starts the snake in the middle of the canvas.
 * - "left-edge": Starts the snake at the left edge, vertically centered.
 */
function setSnakeStartPosition(position = "center") {
  if (position === "center") {
    gameState.snake.startX = Math.round(gridSize / 2); // Center X
    gameState.snake.startY = Math.round(gridSize / 2); // Center Y
  } else if (position === "left-edge") {
    gameState.snake.startX = 0; // Left edge X
    gameState.snake.startY = Math.round(gridSize / 2); // Center Y
  } else {
    throw new Error("Invalid position. Use 'center' or 'left-edge'.");
  }
}

/**
 * Resets the snake's position.
 */
function resetSnakePosition() {
  gameState.snake.x = gameState.snake.startX * gameState.grid.tileSize;
  gameState.snake.y = gameState.snake.startY * gameState.grid.tileSize;
}

/**
 * Randomizes food position within the grid and avoids spawning on the snake.
 */
function resetFood() {
  do {
    gameState.food.x = Math.floor(Math.random() * gameState.grid.tileCountX) * gameState.grid.tileSize;
    gameState.food.y = Math.floor(Math.random() * gameState.grid.tileCountY) * gameState.grid.tileSize;
  } while (
    gameState.snake.tail.some((part) => part.x === gameState.food.x && part.y === gameState.food.y) || // Avoid snake body
    (gameState.food.x === gameState.snake.x && gameState.food.y === gameState.snake.y) // Avoid snake head
  );
  console.log(`Food placed: (${gameState.food.x}, ${gameState.food.y})`);
}

/**
 * Ends the game and display the final score.
 * Wait for user to restart the game by pushing a keyboard.
 */
function gameOver() {
  title.innerHTML = `☠️ <strong> ${gameState.score} </strong> ☠️`;
  gameState.isRunning = false;
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
      if (gameState.snake.velocityX !== 1) { // Prevent reversing right
        gameState.snake.nextVelocityX = -1;
        gameState.snake.nextVelocityY = 0;
      }
      break;
    case "ArrowUp":
      if (gameState.snake.velocityY !== 1) { // Prevent reversing down
        gameState.snake.nextVelocityX = 0;
        gameState.snake.nextVelocityY = -1;
      }
      break;
    case "ArrowRight":
      if (gameState.snake.velocityX !== -1) { // Prevent reversing left
        gameState.snake.nextVelocityX = 1;
        gameState.snake.nextVelocityY = 0;
      }
      break;
    case "ArrowDown":
      if (gameState.snake.velocityY !== -1) { // Prevent reversing up
        gameState.snake.nextVelocityX = 0;
        gameState.snake.nextVelocityY = 1;
      }
      break;
    default:
      // restart game
      if (!gameState.isRunning) location.reload();
      break;
  }
}


