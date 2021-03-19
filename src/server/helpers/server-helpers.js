'use strict';

const game = require('../game.js');
const computerGuessesMade = [];
const shipPlacements = [];
let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

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

function createShips(){
  const galleon = new game.Ship('Spanish Galleon', 5, []);
  const fleut = new game.Ship('Dutch Fleut', 4, []);
  const brigantine = new game.Ship('Brigantine', 3, []);
  const sloop = new game.Ship('Sloop', 2, []);
  const schooner = new game.Ship('Schooner', 2, []);
  return [galleon, fleut, brigantine, sloop, schooner];
}

module.exports = {
  computerShips,
  generateComputerGuess,
  validateComputerGuess,
  validateShipPlacement,
  displayShipHorizontal,
  displayShipDown,
  displayShipUp,
  winChecker,
  checkBoard,
  initialCoordinateCheck,
  createShips,
};

