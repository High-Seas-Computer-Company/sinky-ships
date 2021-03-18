'use strict';

const socketio = require('socket.io');
require('dotenv').config();
const io = socketio(process.env.PORT);

const game = require('./src/server/game.js');

const sinkyShip = io.of('/sinky-ship');

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function createShips(){
  const galleon = new game.Ship('Spanish Galleon', 5, []);
  const fleut = new game.Ship('Dutch Fleut', 4, []);
  const brigantine = new game.Ship('Brigantine', 3, []);
  const sloop = new game.Ship('Sloop', 2, []);
  const schooner = new game.Ship('Schooner', 2, []);
  return [galleon, fleut, brigantine, sloop, schooner];
}


const computerGuessesMade = [];
const shipPlacements = [];

io.on('connection', socket => {
  console.log('New connection created : ' + socket.id);
});

sinkyShip.on('connection', (socket) => {
  console.log('New connection : ' + socket.id);
  

  socket.on('new-game', () => {
    const ships = createShips();
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
  let coordinates = validateShipPlacement();
  let placedShip = false;
  while (!placedShip) {
    let random = Math.floor(Math.random() * 4);
    let direction = directions[random];
    if (!initialCoordinateCheck(board, coordinates)) {
      coordinates = validateShipPlacement();
      placedShip = false;
      continue;
    }
    else if (direction.toLowerCase() === 'l' || direction.toLowerCase() === 'r') {
      placedShip = displayShipHorizontal(coordinates, direction, board.size, ship);
    }
    else if (direction.toLowerCase() === 'd') {
      placedShip = displayShipDown(coordinates, direction, board.size, ship);
    }
    else if (direction.toLowerCase() === 'u') {
      placedShip = displayShipUp(coordinates, direction, board.size, ship);
    } else {
      coordinates = validateShipPlacement();
      placedShip = false;
      continue;
    }
  }
  shipPlacements.push(...ship.coordinates);
  console.log(ship);
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

function validateShipPlacement() {
  let guess = generateComputerGuess();
  while (shipPlacements.includes(guess)) {
    guess = generateComputerGuess();
  }
  return guess;
}


function displayShipHorizontal(start, direction, gameboard, ship) {
  let index;
  for (let i = 0; i < gameboard.length; i++) {
    let letter = String.fromCharCode(65 + i);
    let array1 = gameboard[i];
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    if (direction.toLowerCase() === 'r') {
      let temp = index;
      let checkIndex = index;
      if (index + ship.hitCounter > 10) {
        return false;
      } else {
        while (checkIndex < temp + ship.hitCounter) {
          if (array1[checkIndex] === '$') {
            return false;
          }
          checkIndex++;
        }
        while (index < temp + ship.hitCounter) {
          ship.coordinates.push(letter + index);
          array1[index] = '$';
          index++;
        }
        return true;
      }
    }
    else if (direction.toLowerCase() === 'l') {
      let temp = index;
      let checkIndex = index;
      if (index - ship.hitCounter < -1) {
        return false;
      } else {
        while (checkIndex > temp - ship.hitCounter) {
          if (array1[checkIndex] === '$') {
            return false;
          }
          checkIndex--;
        }
        while (index > temp - ship.hitCounter) {
          ship.coordinates.push(letter + index);
          array1[index] = '$';
          index--;
        }
        return true;
      }
    }
  }
}

function displayShipDown(start, direction, gameboard, ship) {
  let index;
  let i;
  let originalRow;
  let originalLetter = 65;
  for (i = 0; i < gameboard.length; i++) {
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'd' && originalRow + ship.hitCounter > 10) {
    return false;
  } else if (direction.toLowerCase() === 'd') {
    for (let k = originalRow; k < (originalRow + ship.hitCounter); k++) {
      if (gameboard[k][index] === '$') {
        return false;
      }
    }
    for (let j = originalRow; j < (originalRow + ship.hitCounter); j++) {
      let letter = String.fromCharCode(originalLetter + j);
      ship.coordinates.push(letter + index);
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function displayShipUp(start, direction, gameboard, ship) {
  let index;
  let i;
  let originalRow;
  let originalLetter = 65;
  for (i = 0; i < gameboard.length; i++) {
    index = gameboard[i].indexOf(start);
    if (index === -1) {
      continue;
    } else {
      originalRow = i;
      break;
    }
  }

  if (direction.toLowerCase() === 'u' && originalRow - ship.hitCounter < -1) {
    return false;
  } else if (direction.toLowerCase() === 'u') {
    for (let k = originalRow; k > (originalRow - ship.hitCounter); k--) {
      if (gameboard[k][index] === '$') {
        return false;
      }
    }
    for (let j = originalRow; j > (originalRow - ship.hitCounter); j--) {
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
