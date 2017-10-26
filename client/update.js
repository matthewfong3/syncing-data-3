const update = (data) => {
  if(!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  const square = squares[data.hash];
  
  if(data.hash === hash){
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

const removeUser = (data) => {
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

const setUser = (data) => {
  hash = data.hash;
  squares[hash] = data; 
  requestAnimationFrame(redraw); 
};

//update this user's positions based on keyboard input
const updatePosition = () => {
  const square = squares[hash];

  square.prevX = square.x;
  square.prevY = square.y;
  
  // if character can jump and is jumping, decrease it's y and increment jump timer
  if(square.jumping && square.canJump){
    square.destY -= 2;
    square.jumpTimer++;
  }
  
  // when jump timer reaches a threshold, set jumping to false, so character will begin falling again
  // and reset jump timer
  if(square.jumpTimer > 50){
    square.canJump = false;
    square.jumping = false;
    square.jumpTimer = 0;
  }
  
  // check square prevY before allowing it to jump again
  if(!square.jumping && square.prevY >= 377){
    square.canJump = true;
  }
  
  //if user is moving left, decrease x
  if(square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if(square.moveRight && square.destX < 438) {
    square.destX += 2;
  }

  if(square.moveLeft && !(square.moveUp || square.moveDown)) square.direction = directions.LEFT;

  if(square.moveRight && !(square.moveUp || square.moveDown)) square.direction = directions.RIGHT;
  
  square.alpha = 0.05;

  socket.emit('movementUpdate', square);
};