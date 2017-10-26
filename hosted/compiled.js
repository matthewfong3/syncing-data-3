"use strict";

var directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7
};

var spriteSizes = {
  WIDTH: 61,
  HEIGHT: 121
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {
  updatePosition();

  ctx.clearRect(0, 0, 500, 500);

  var keys = Object.keys(squares);

  for (var i = 0; i < keys.length; i++) {
    var square = squares[keys[i]];

    if (square.alpha < 1) square.alpha += 0.05;

    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    if (square.frame > 0 || square.moveUp || square.moveDown || square.moveRight || square.moveLeft) {
      square.frameCount++;

      if (square.frameCount % 8 === 0) {
        if (square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }

    ctx.drawImage(walkImage, spriteSizes.WIDTH * square.frame, spriteSizes.HEIGHT * square.direction, spriteSizes.WIDTH, spriteSizes.HEIGHT, square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

    ctx.strokeRect(square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var walkImage = void 0;
var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var squares = {};

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = true;
    }
    //Space key was lifted
    else if (keyPressed === 32) {
        if (!square.jumping && square.canJump) square.jumping = true;
      }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = false;
    }
};

var init = function init() {
  walkImage = document.querySelector('#walk');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('left', removeUser); //when a user leaves

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
'use strict';

var update = function update(data) {
  if (!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  if (squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  var square = squares[data.hash];

  if (data.hash === hash) {
    square.destX = data.destX;
    square.destY = data.destY;
  } else {
    square.prevX = data.prevX;
    square.prevY = data.prevY;
    square.destX = data.destX;
    square.destY = data.destY;
    square.direction = data.direction;
    square.moveLeft = data.moveLeft;
    square.moveRight = data.moveRight;

    // update jumping, canJump, and falling properties
    square.jumping = data.jumping;
    square.canJump = data.canJump;
    square.falling = data.falling;
    square.jumpTimer = data.jumpTimer;
  }

  square.alpha = 0.05;
};

var removeUser = function removeUser(data) {
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

var setUser = function setUser(data) {
  hash = data.hash;
  squares[hash] = data;
  requestAnimationFrame(redraw);
};

//update this user's positions based on keyboard input
var updatePosition = function updatePosition() {
  var square = squares[hash];

  square.prevX = square.x;
  square.prevY = square.y;

  // if character can jump and is jumping, decrease it's y and increment jump timer
  if (square.jumping && square.canJump) {
    square.destY -= 2;
    square.jumpTimer++;
  }

  // when jump timer reaches a threshold, set jumping to false, so character will begin falling again
  // and reset jump timer
  if (square.jumpTimer > 50) {
    square.canJump = false;
    square.jumping = false;
    square.jumpTimer = 0;
  }

  // check square prevY before allowing it to jump again
  if (!square.jumping && square.prevY >= 377) {
    square.canJump = true;
  }

  //if user is moving left, decrease x
  if (square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if (square.moveRight && square.destX < 438) {
    square.destX += 2;
  }

  if (square.moveLeft && !(square.moveUp || square.moveDown)) square.direction = directions.LEFT;

  if (square.moveRight && !(square.moveUp || square.moveDown)) square.direction = directions.RIGHT;

  square.alpha = 0.05;

  socket.emit('movementUpdate', square);
};
