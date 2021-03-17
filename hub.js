'use strict';

const socketio = require('socket.io');
require('dotenv').config();
const io = socketio(process.env.PORT);

const game = require('./src/server/game.js');

const sinkyShip = io.of('/sinky-ship');

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const computerGuessesMade = [];

io.on('connection', socket => {
  console.log('New connection created : ' + socket.id);
});

sinkyShip.on('connection', (socket) => {
  console.log('New connection : ' + socket.id);


  socket.on('new-game', () => {
    let payload = new game.GameObject();
    payload.playerBoard = new game.Normal();
    payload.computerBoard = new game.Normal();
    payload.computerBoard.player = 'Computer';
    computerShips(payload.computerBoard);
    payload.id = socket.id;
    payload.battleship = new game.Ship('Carrier', 5, []);
    socket.emit('game-setup', payload);
  });

  socket.on('setup-complete', (payload) => {
    // console.log('SETUP-COMPLETE', payload);
    socket.emit('guess', payload);
  });

  socket.on('response', (payload) => {
    const guess = validateComputerGuess();
    checkBoard(payload.playerBoard, guess);
    console.log(payload.playerBoard);
    if(winChecker(payload.playerBoard.size)){
      payload.winner = 'Computer';
      socket.emit('game-over', payload);
    }
    else if(winChecker(payload.computerBoard.size)){
      payload.winner = 'Player 1';
      socket.emit('game-over', payload);
    }else{
      socket.emit('guess', payload);
    }
  });
});


function computerShips(board) {
  let directions = ['r', 'd', 'l', 'u'];
  const carrier = new game.Ship('battleship', 5, []);
  let horizontalCoord = Math.floor(Math.random() * 10);
  let verticalCoord = Math.floor(Math.random() * 10);
  let letterCoord = letters[verticalCoord];
  let coordinates = letterCoord + `${horizontalCoord}`;
  console.log(coordinates);
  let placedShip = false;
  while (!placedShip) {
    let random = Math.floor(Math.random() * 4);
    let direction = directions[random];
    console.log(direction);
    if (direction.toLowerCase() === 'l' || direction.toLowerCase() === 'r') {
      placedShip = displayShipHorizontal(coordinates, direction, board.size, carrier.hitCounter);
    }
    if (direction.toLowerCase() === 'd') {
      placedShip = displayShipDown(coordinates, direction, board.size, carrier.hitCounter);
    }
    if (direction.toLowerCase() === 'u') {
      placedShip = displayShipUp(coordinates, direction, board.size, carrier.hitCounter);
    }
  }
  console.log(board.size);
}

function generateComputerGuess() {
  let horizontalCoord = Math.floor(Math.random() * 10);
  let verticalCoord = Math.floor(Math.random() * 10);
  let letterCoord = letters[verticalCoord];
  let coordinates = letterCoord + `${horizontalCoord}`;
  return coordinates;
}

function validateComputerGuess() {
  let guess = generateComputerGuess();
  while (computerGuessesMade.includes(guess)) {
    guess = generateComputerGuess();
  }
  computerGuessesMade.push(guess);
  return guess;
}

// console.log('computer guess: ', validateComputerGuess(), ' computer guess array: ');

const carrier = new game.Ship('Carrier', 5, ['F1', 'F2', 'F3', 'F4', 'F5']);
const destroyer = new game.Ship('Destroyer', 4, []);
const aABoat = new game.Ship('amphibiousAssaultBoat', 3, []);
const patrolBoat = new game.Ship('patrolBoat', 2, []);
const pirateRowBoat = new game.Ship('pirateRowBoat', 1, []);

const ships = [carrier, destroyer, aABoat, patrolBoat, pirateRowBoat];


function displayShipHorizontal(start, direction, gameboard, shipLength) {
  let index;
  // let i;
  for (let i = 0; i < gameboard.length; i++) {
    let array1 = gameboard[i];
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    if (direction.toLowerCase() === 'r') {
      let temp = index;
      if (index + shipLength > 9) {
        console.log('Not enough room. Choose a different starting position, or choose to place your ship to the left.');
        return false;
      } else {
        while (index < temp + shipLength) {
          array1[index] = '$';
          index++;
        }
        return true;
      }
    }
    else if (direction.toLowerCase() === 'l') {
      let temp = index;
      if (index - shipLength < 0) {
        console.log('Not enough room. Choose a different starting position, or choose to place your ship to the right.');
        return false;
      } else {
        while (index > temp - shipLength) {
          array1[index] = '$';
          index--;
        }
        return true;
      }
    }
  }
}

function displayShipDown(start, direction, gameboard, shipLength) {
  let index;
  let i;
  let originalRow;
  for (i = 0; i < gameboard.length; i++) {
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'd' && originalRow + shipLength > 9) {
    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return false;
  } else if (direction.toLowerCase() === 'd') {
    for (let j = originalRow; j < (originalRow + shipLength); j++) {
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function displayShipUp(start, direction, gameboard, shipLength) {
  let index;
  let i;
  let originalRow;
  for (i = 0; i < gameboard.length; i++) {
    index = gameboard[i].indexOf(start);
    if (index === -1) {
      continue;
    } else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'u' && originalRow - shipLength < 0) {
    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return false;
  } else if (direction.toLowerCase() === 'u') {
    for (let j = originalRow; j > (originalRow - shipLength); j--) {
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function winChecker(gameboard){
  for (let i = 0; i < gameboard.length; i++) {
    if (!gameboard[i].includes('$')) {
      continue;
    } else if (gameboard[i].includes('$')){
      return false;
    }
  }
  return true;
}

function checkBoard(board, value) {
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let verticalCoordLetter = value.substring(0, 1).toUpperCase();
  let verticalCoordNumber = letters.indexOf(verticalCoordLetter);
  let horizontalCoord = Number(value.substring(1, 2));
  console.log('Hit coordinates', board.size[verticalCoordNumber][horizontalCoord]);
  if (board.size[verticalCoordNumber][horizontalCoord] === 'X' || board.size[verticalCoordNumber][horizontalCoord] === 'O') {
    return false;
  }
  else if (board.size[verticalCoordNumber][horizontalCoord] === '$') {
    board.size[verticalCoordNumber][horizontalCoord] = 'X';
    return { status: 'Hit' };
  } else {
    board.size[verticalCoordNumber][horizontalCoord] = 'O';
    return { status: 'Miss' };
  }
}



















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
