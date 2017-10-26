let canvas;
let ctx;
let walkImage;
let socket; 
let hash; 
let animationFrame; 

let squares = {};

const keyDownHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = true;
  }
  //Space key was lifted
  else if(keyPressed === 32) {
    if(!square.jumping && square.canJump) square.jumping = true;
  }
};

const keyUpHandler = (e) => {
  var keyPressed = e.which;
  const square = squares[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    square.moveRight = false;
  }
};

const init = () => {
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