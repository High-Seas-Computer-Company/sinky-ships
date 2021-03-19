'use strict';

const socketio = require('socket.io');
require('dotenv').config();
const io = socketio(process.env.PORT);

const game = require('./src/server/game.js');
const hub = require('./src/server/helpers/server-helpers.js');
const sinkyShip = io.of('/sinky-ship');


io.on('connection', socket => {
  console.log('New connection created : ' + socket.id);
});

sinkyShip.on('connection', (socket) => {
  console.log('New connection : ' + socket.id);
  

  socket.on('new-game', () => {
    const ships = hub.createShips();
    let payload = new game.GameObject();
    payload.playerBoard = new game.Normal();
    payload.computerBoard = new game.Normal();
    payload.computerBoard.player = 'Computer';
    ships.forEach(ship => {
      hub.computerShips(payload.computerBoard, ship);
    });
    payload.id = socket.id;
    ships.forEach(ship => {
      payload[ship.name] = ship;
    });
    socket.emit('game-setup1', payload);
  });

  socket.on('setup-complete1', (payload) => {
    socket.emit('game-setup2', payload);
  });

  socket.on('setup-complete2', (payload) => {
    socket.emit('game-setup3', payload);
  });

  socket.on('setup-complete3', (payload) => {
    socket.emit('game-setup4', payload);
  });

  socket.on('setup-complete4', (payload) => {
    socket.emit('game-setup5', payload);
  });

  socket.on('setup-complete5', (payload) => {
    socket.emit('guess', payload);
  });

  socket.on('response', (payload) => {
    const guess = hub.validateComputerGuess();
    let hitOrMiss = hub.checkBoard(payload.playerBoard, guess);
    payload.computerGuess = hitOrMiss.status;
    if (hub.winChecker(payload.playerBoard.size)) {
      payload.winner = 'Computer';
      socket.emit('game-over', payload);
    }
    else if (hub.winChecker(payload.computerBoard.size)) {
      payload.winner = 'Player 1';
      socket.emit('game-over', payload);
    } else {
      setTimeout(() => {
        socket.emit('guess', payload);
      }, Math.random() * 3000 + 1000);
    }
  });
});










// ________00000000000___________000000000000_________
// ______00000000_____00000___000000_____0000000______
// ____0000000_____________000______________00000_____
// ___0000000_______________0_________________0000____
// __000000____________________________________0000___
// __00000______________________________________0000__
// _00000______________________________________00000__
// _00000_____________________________________000000__
// __000000_________________________________0000000___
// ___0000000______________________________0000000____
// _____000000____________________________000000______
// _______000000________________________000000________
// __________00000_____________________0000___________
// _____________0000_________________0000_____________
// _______________0000_____________000________________
// _________________000_________000___________________
// ____________________000_____00_____________________
// ______________________00__00_______________________
// ________________________00_________________________
