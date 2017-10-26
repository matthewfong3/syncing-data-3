const sockets = require('./sockets.js');

let charList = {};

const checkGravity = () => {
  const keys = Object.keys(charList);
  for (let i = 0; i < keys.length; i++) {
    // if not jumping, character should fall
    // unless they are at the bottom of the canvas
    if (!charList[keys[i]].jumping) {
      if (charList[keys[i]].destY < 378) {
        charList[keys[i]].falling = true;
        charList[keys[i]].destY += 2;
      } else {
        charList[keys[i]].falling = false;
        charList[keys[i]].destY = 378;
      }
    }

    sockets.emitGravity(charList[keys[i]]);
  }
};

const setCharacterList = (characterList) => {
  charList = characterList;
};

const setCharacter = (character) => {
  charList[character.hash] = character;
};

// check gravity every 20ms
setInterval(() => {
  checkGravity();
}, 20);

module.exports.setCharacterList = setCharacterList;
module.exports.setCharacter = setCharacter;
