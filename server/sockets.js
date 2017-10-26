const xxh = require('xxhashjs');
const Character = require('./classes/Character.js');
const physics = require('./physics.js');

const characters = {};

let io;

const emitGravity = (data) => {
  io.sockets.in('room1').emit('updatedMovement', data);
};

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    characters[hash] = new Character(hash);

    socket.hash = hash;

    socket.emit('joined', characters[hash]);

    socket.on('movementUpdate', (data) => {
      characters[socket.hash] = data;

      characters[socket.hash].lastUpdate = new Date().getTime();

      physics.setCharacter(characters[socket.hash]);

      io.sockets.in('room1').emit('updatedMovement', characters[socket.hash]);
    });

    socket.on('disconnect', () => {
      io.sockets.in('room1').emit('left', characters[socket.hash]);

      delete characters[socket.hash];

      physics.setCharacterList(characters);

      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.emitGravity = emitGravity;
