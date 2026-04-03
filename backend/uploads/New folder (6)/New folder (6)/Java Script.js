/**
 * --- LEVEL 1: NESTED DEFINITIONS (Scope) ---
 * Functions defined inside another function are "private" to that parent.
 */

function userManager(name) {
  // 1. A nested helper function
  function formatName() {
    return name.trim().toUpperCase();
  }

  // 2. Another nested helper
  function getWelcomeMessage() {
    return `Welcome, ${formatName()}!`; // Calling function #1
  }

  console.log(getWelcomeMessage());
}

/**
 * --- LEVEL 2: FUNCTION FACTORIES (Closures) ---
 * An outer function returns an inner function that "remembers" data.
 */

function createValidator(minLength) {
  // 3. This inner function is what actually gets used later
  return function(text) {
    return text.length >= minLength;
  };
}

/**
 * --- LEVEL 3: CHAIN CALLING (The Waterfall) ---
 * One function starts a chain reaction.
 */

// 4. Basic math
const square = (n) => n * n;

// 5. Uses #4
const sumOfSquares = (a, b) => square(a) + square(b);

// 6. Uses #5 to check a triangle
function isRightTriangle(a, b, c) {
  return sumOfSquares(a, b) === square(c);
}

/**
 * --- LEVEL 4: CALLBACKS (Functions as Arguments) ---
 * Passing one function INTO another.
 */

// 7. A simple printer
const logger = (val) => console.log("Result:", val);

// 8. Higher-order function
function executeMath(x, y, operation, callback) {
  const result = operation(x, y); // Running the passed function
  callback(result);               // Running the second passed function
}

/**
 * --- LEVEL 5: THE ORCHESTRATOR ---
 * Tying it all together.
 */

// 9. Main runner
function runProgram() {
  console.log("--- Executing Program ---");

  // Call userManager (uses nested functions)
  userManager("  gemini  ");

  // Call validator factory
  const isLongEnough = createValidator(5);
  console.log("Is 'Hi' long enough?", isLongEnough("Hi"));

  // Call the chain
  console.log("Is 3,4,5 a right triangle?", isRightTriangle(3, 4, 5));

  // Call the callback system
  executeMath(10, 5, (a, b) => a - b, logger);
}

// 10. Start the engine
runProgram();