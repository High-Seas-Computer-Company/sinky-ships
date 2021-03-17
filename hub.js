'use strict';

const socketio = require('socket.io');
require('dotenv').config();
const io = socketio(process.env.PORT);

const game = require('./src/server/game.js');

const sinkyShip = io.of('/sinky-ship');

io.on('connection', socket => {
  console.log('New connection created : ' + socket.id);
});

sinkyShip.on('connection', (socket) => {
  // add socket.id into the game object, adding new id on instantiation
  console.log('New connection : ' + socket.id);


  socket.on('new-game', () => {
    //if game with socket.id exists delete old game, instantiate new game
    //else just instantiate new game
    let payload = new game.GameObject();
    payload.playerBoard = new game.Normal();
    payload.id = socket.id;
    payload.battleship = new game.Ship('Carrier', 5, []);
    console.log('NEWGAME', payload);
    socket.emit('game-setup', payload);
  });

  socket.on('setup-complete', (payload) => {
    console.log('SETUP-COMPLETE', payload);
    socket.emit('guess', payload);
  });

  socket.on('response', (payload) => {
    console.log('RESPONSE', payload);
    // insert logic here

    // TODO: emit hit/miss info and computer move
    // TODO: on client side, console log hit/miss and computers board and then delayed console log of computer move and players board
    // could have logic in here - if gameover emit gameover, or emit guess
    socket.emit('game-over', payload);
  });
});



const carrier = new game.Ship('Carrier', 5, ['F1', 'F2', 'F3', 'F4', 'F5']);
const destroyer = new game.Ship('Destroyer', 4, []);
const aABoat = new game.Ship('amphibiousAssaultBoat', 3, []);
const patrolBoat = new game.Ship('patrolBoat', 2, []);
const pirateRowBoat = new game.Ship('pirateRowBoat', 1, []);

const ships = [carrier, destroyer, aABoat, patrolBoat, pirateRowBoat];






















//TODO: Eat nachos while drunk. YAAAASSSSSS!

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
