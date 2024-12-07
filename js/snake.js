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
  food: {
    x: 0, // Food X position
    y: 0, // Food Y position
  },
};

// Desired grid size (Initially set to 12)
const gridSize = 12;

// Game Constants
const interval = 1000 / gameSettings.fps; // Interval between frames in miliseconds

// Tile and Grid dimensions (updated dynamically)
let tileSize, tileCountX, tileCountY;

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
function moveStuff() {
  // NEW - update the direction when snake move 
  // Apply the next direction
  gameState.snake.velocityX = gameState.snake.nextVelocityX;
  gameState.snake.velocityY = gameState.snake.nextVelocityY;


  // Update snake position
  gameState.snake.x += gameState.snake.speed * gameState.snake.velocityX;
  gameState.snake.y += gameState.snake.speed * gameState.snake.velocityY;

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
  gameState.snake.tail.push({ x: gameState.snake.x, y: gameState.snake.y });      // Add the current position to the tail
  gameState.snake.tail = gameState.snake.tail.slice(-1 * gameState.snake.length); // Keep only the latest positions up to the length of the snake 
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
    gameState.snake.x = canvas.width - tileSize;
  }

  // Handle vertical border go through
  if (gameState.snake.y >= canvas.height) {
    gameState.snake.y = 0;
  } else if (gameState.snake.y < 0) {
    gameState.snake.y = canvas.height - tileSize;
  }

  // Snap to grid to avoid misalignment
  gameState.snake.x = Math.round(gameState.snake.x / tileSize) * tileSize;
  gameState.snake.y = Math.round(gameState.snake.y / tileSize) * tileSize;
}

/**
 * GAME OVER (crash into wall)
 */
function checkWallCollision() {
  // Check horizontal border collision
  if (gameState.snake.x > canvas.width - tileSize || gameState.snake.x < 0) {
    gameOver();
     }

  // Check vertical border collision
  if (gameState.snake.y > canvas.height - tileSize || gameState.snake.y < 0) {
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
  circle("#05abd7", gameState.food.x, gameState.food.y, tileSize, tileSize); // Food

  // Snake tail
  gameState.snake.tail.forEach((snakePart) =>
    circle("#555", snakePart.x, snakePart.y, tileSize, tileSize)
  );

  circle("black", gameState.snake.x, gameState.snake.y, tileSize, tileSize); // Snake head
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
  const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9 / gridSize) * gridSize; // Ensures tiles fit perfectly in the grid
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
  gameState.snake.speed = tileSize; // Match snake speed with tile size
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
  gameState.snake.x = Math.round(tileCountX / 2) * tileSize; // Center X
  gameState.snake.y = Math.round(tileCountY / 2) * tileSize; // Center Y
  // snakeSpeed = tileSize; // Ensure the speed matches the grid size
}

/**
 * Randomizes food position within the grid and avoids spawning on the snake.
 */
function resetFood() {
  do {
    gameState.food.x = Math.floor(Math.random() * tileCountX) * tileSize;
    gameState.food.y = Math.floor(Math.random() * tileCountY) * tileSize;
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


