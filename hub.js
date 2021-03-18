'use strict';

const socketio = require('socket.io');
require('dotenv').config();
const io = socketio(process.env.PORT);

const game = require('./src/server/game.js');

const sinkyShip = io.of('/sinky-ship');

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const galleon = new game.Ship('Spanish Galleon', 5, []);
const fleut = new game.Ship('Dutch Fleut', 4, []);
const brigantine = new game.Ship('Brigantine', 3, []);
const sloop = new game.Ship('Sloop', 2, []);
const schooner = new game.Ship('Schooner', 1, []);

const ships = [galleon, fleut, brigantine, sloop, schooner];

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
    ships.forEach(ship => {
      computerShips(payload.computerBoard, ship);
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
    const guess = validateComputerGuess();
    let hitOrMiss = checkBoard(payload.playerBoard, guess);
    console.log('HITORMISS', hitOrMiss);
    console.log('PAYLOAD', payload);
    payload.computerGuess = hitOrMiss.status;
    if (winChecker(payload.playerBoard.size)) {
      payload.winner = 'Computer';
      socket.emit('game-over', payload);
    }
    else if (winChecker(payload.computerBoard.size)) {
      payload.winner = 'Player 1';
      socket.emit('game-over', payload);
    } else {
      setTimeout(() => {
        socket.emit('guess', payload);
      }, Math.random() * 3000 + 1000);
    }
  });
});


function computerShips(board, ship) {
  let directions = ['r', 'd', 'l', 'u'];
  let horizontalCoord = Math.floor(Math.random() * 10);
  let verticalCoord = Math.floor(Math.random() * 10);
  let letterCoord = letters[verticalCoord];
  let coordinates = letterCoord + `${horizontalCoord}`;
  let placedShip = false;
  while (!placedShip) {
    let random = Math.floor(Math.random() * 4);
    let direction = directions[random];
    console.log(coordinates);
    console.log(direction);
    if (!initialCoordinateCheck(board, coordinates)) {
      horizontalCoord = Math.floor(Math.random() * 10);
      verticalCoord = Math.floor(Math.random() * 10);
      letterCoord = letters[verticalCoord];
      coordinates = letterCoord + `${horizontalCoord}`;
      placedShip = false;
    }
    else if (direction.toLowerCase() === 'l' || direction.toLowerCase() === 'r') {
      placedShip = displayShipHorizontal(coordinates, direction, board.size, ship/*.hitCounter*/);
    }
    else if (direction.toLowerCase() === 'd') {
      placedShip = displayShipDown(coordinates, direction, board.size, ship/*.hitCounter*/);
    }
    else if (direction.toLowerCase() === 'u') {
      placedShip = displayShipUp(coordinates, direction, board.size, ship/*.hitCounter*/);
    } else {
      horizontalCoord = Math.floor(Math.random() * 10);
      verticalCoord = Math.floor(Math.random() * 10);
      letterCoord = letters[verticalCoord];
      coordinates = letterCoord + `${horizontalCoord}`;
      placedShip = false;
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



function displayShipHorizontal(start, direction, gameboard, ship/*Length*/) {
  let index;
  // let i;
  for (let i = 0; i < gameboard.length; i++) {
    let letter = String.fromCharCode(65 + i);
    let array1 = gameboard[i];
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    if (direction.toLowerCase() === 'r') {
      let temp = index;
      if (index + ship.hitCounter/*Length*/ > 9) {
        console.log('Not enough room. Choose a different starting position, or choose to place your ship to the left.');
        return false;
      } else {
        while (index < temp + ship.hitCounter/*Length*/) {
          ship.coordinates.push(letter + index);
          array1[index] = '$';
          index++;
        }
        return true;
      }
    }
    else if (direction.toLowerCase() === 'l') {
      let temp = index;
      if (index - ship.hitCounter/*Length*/ < 0) {
        console.log('Not enough room. Choose a different starting position, or choose to place your ship to the right.');
        return false;
      } else {
        while (index > temp - ship.hitCounter/*Length*/) {
          ship.coordinates.push(letter + index);
          array1[index] = '$';
          index--;
        }
        return true;
      }
    }
  }
}

function displayShipDown(start, direction, gameboard, ship/*Length*/) {
  let index;
  let i;
  let originalRow;
  let originalLetter = 65; // 65=A=0, 66=B=1, 67=C=2
  for (i = 0; i < gameboard.length; i++) {
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'd' && originalRow + ship.hitCounter/*Length*/ > 9) {
    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return false;
  } else if (direction.toLowerCase() === 'd') {
    for (let j = originalRow; j < (originalRow + ship.hitCounter/*Length*/); j++) {
      let letter = String.fromCharCode(originalLetter + j);
      ship.coordinates.push(letter + index);
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function displayShipUp(start, direction, gameboard, ship/*Length*/) {
  let index;
  let i;
  let originalRow;
  // let startLetter = 65;
  let originalLetter = 65; // I=8=9th=73 J=8
  for (i = 0; i < gameboard.length; i++) {
    // originalLetter++;
    index = gameboard[i].indexOf(start);
    if (index === -1) {
      continue;
    } else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'u' && originalRow - ship.hitCounter/*Length*/ < 0) {
    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return false;
  } else if (direction.toLowerCase() === 'u') {
    for (let j = originalRow; j > (originalRow - ship.hitCounter/*Length*/); j--) {
      let letter = String.fromCharCode(originalLetter + j);
      ship.coordinates.push(letter + index);
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function winChecker(gameboard) {
  for (let i = 0; i < gameboard.length; i++) {
    if (!gameboard[i].includes('$')) {
      continue;
    } else if (gameboard[i].includes('$')) {
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


function initialCoordinateCheck(board, value) {
  if (board.size[value] === '$') {
    return false;
  }
  else {
    return true;
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
