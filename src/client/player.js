'use strict';

const socketio = require('socket.io-client');
const game = require('../client/player.js');
// when we deploy to Heroku - will need to change this
const sinkyShipUrl = 'http://localhost:3000/sinky-ship';

const sinkyShipServer = socketio.connect(sinkyShipUrl);

//enquirer prompt, 
//await response
sinkyShipServer.emit('new-game');

sinkyShipServer.on('game-setup', (payload) => {
  // user receives board, places ships on board
  sinkyShipServer.emit('setup-complete', payload);
});

sinkyShipServer.on('guess', (payload) => {
  // prompt user, display their board and computer board
  sinkyShipServer.emit('response', payload); 
});

sinkyShipServer.on('game-over', (payload) => {
  // YOU LOSE
  console.log('GAMEOVER', payload);
  // TODO: render the player board and computer board to terminal
  // TODO: ask if want to play again
  //if yes  sinkyShipServer.emit('new-game');
  //else process.exit
});



