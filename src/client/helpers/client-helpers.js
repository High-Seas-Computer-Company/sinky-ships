'use strict';

const chalk = require('chalk');
const log = console.log;
const error = chalk.bold.red;
const figlet = require('figlet');
const { prompt } = require('enquirer');



function printFiglet(color) {
  figlet('GAME OVER', function (err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    log(chalk[color].bold('\n' + data + '\n'));
  });
}

function displayShipHorizontal(start, direction, gameboard, shipLength) {
  let index;
  for (let i = 0; i < gameboard.length; i++) {
    let array1 = gameboard[i];
    index = gameboard[i].indexOf(start);
    if (index === -1) { continue; }
    if (direction.toLowerCase() === 'r') {
      let temp = index;

      let checkIndex = index;
      if (index + shipLength > 10) {
        log(error('\n Not enough room. Choose a different starting position, or direction. \n'));

      } else {
        while (checkIndex < temp + shipLength) {
          if (array1[checkIndex] === '$') {
            log(error('\n Not enough room. Choose a different starting position, or direction. \n'));
            return prompt();
          }
          checkIndex++;
        }
        while (index < temp + shipLength) {
          array1[index] = '$';
          index++;
        }
        return true;
      }
    }
    else if (direction.toLowerCase() === 'l') {
      let temp = index;

      let checkIndex = index;
      if (index - shipLength < -1) {
        log(error('\n Not enough room. Choose a different starting position, or direction.\n'));

      } else {
        while (checkIndex > temp - shipLength) {
          if (array1[checkIndex] === '$') {
            log(error('\n Not enough room. Choose a different starting position, or direction. \n'));
            return prompt();
          }
          checkIndex--;
        }
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

  if (direction.toLowerCase() === 'd' && originalRow + shipLength > 10) {
    log(error('\n Not enough room. Choose a different starting position, or direction.\n'));

    return prompt();
  } else if (direction.toLowerCase() === 'd') {
    for (let k = originalRow; k < (originalRow + shipLength); k++) {
      if (gameboard[k][index] === '$') {
        return prompt();
      }
    }
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


  if (direction.toLowerCase() === 'u' && originalRow - shipLength < -1) {
    log(error('\n Not enough room. Choose a different starting position, or direction.\n'));

    return prompt();
  } else if (direction.toLowerCase() === 'u') {
    for (let k = originalRow; k > (originalRow - shipLength); k--) {
      if (gameboard[k][index] === '$') {
        log(error('\n Not enough room. Choose a different starting position, or direction. \n'));
        return prompt();
      }
    }
    for (let j = originalRow; j > (originalRow - shipLength); j--) {
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function displayBoard(board) {
  let horizontalGuide = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let verticalGuide = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let output = '\n' + '    ';
  for (let i = 0; i < horizontalGuide.length; i++) {
    output += horizontalGuide[i] + '  ';
  }
  output += '\n';
  for (let i = 0; i < board.size.length; i++) {
    output += ' ' + verticalGuide[i] + ' ';
    for (let j = 0; j < board.size[i].length; j++) {
      if (board.player === 'Player 1') {
        if (board.size[i][j] === 'X') {
          output += ' ' + chalk.yellow.bold('X ');
        } else if (board.size[i][j] === 'O') {
          output += chalk.bgCyan(' ') + chalk.bgCyan.black('o ');
        } else if (board.size[i][j] === '$') {
          output += ' ' + chalk.magenta.bold('$') + ' ';
        } else {
          output += chalk.bgBlue(' ') + chalk.bgBlue.black('* ');
        }
      } else {
        if (board.size[i][j] === 'X') {
          output += ' ' + chalk.green.bold('X ');
        } else if (board.size[i][j] === 'O') {
          output += chalk.bgCyan(' ') + chalk.bgCyan.black('o ');
        } else {
          output += chalk.bgBlue(' ') + chalk.bgBlue.black('* ');
        }
      }
    }
    output += '\n';
  }
  return output;
}

function checkBoard(board, value) {
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let verticalCoordLetter = value.substring(0, 1).toUpperCase();
  let verticalCoordNumber = letters.indexOf(verticalCoordLetter);
  let horizontalCoord = Number(value.substring(1, 2));
  if (board.size[verticalCoordNumber][horizontalCoord] === 'X' || board.size[verticalCoordNumber][horizontalCoord] === 'O') {
    log(error('\n That coordinate has already been chosen! \n'));
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
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  let verticalCoordLetter = value.substring(0, 1).toUpperCase();
  let verticalCoordNumber = letters.indexOf(verticalCoordLetter);
  let horizontalCoord = Number(value.substring(1, 2));
  if (board.size[verticalCoordNumber][horizontalCoord] === '$') {
    log(error('\n Ship already at this coordinate location, choose again\n'));
    return false;
  }
  else {
    return true;
  }
}

module.exports = {
  printFiglet,
  displayShipHorizontal,
  displayShipDown,
  displayShipUp,
  displayBoard,
  checkBoard,
  initialCoordinateCheck,
};
