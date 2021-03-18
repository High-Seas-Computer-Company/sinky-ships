'use strict';

const socketio = require('socket.io-client');
const { prompt } = require('enquirer');
const chalk = require('chalk');
const log = console.log;
const error = chalk.bold.red;
var figlet = require('figlet');


// const sinkyShipUrl = 'https://sinky-ship.herokuapp.com/sinky-ship';
const sinkyShipUrl = 'http://localhost:3000/sinky-ship';

const sinkyShipServer = socketio.connect(sinkyShipUrl);

figlet('Sinky Ship', function (err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  log(chalk.cyan.bold('\n' + data + '\n'));
});

console.log(
`   __|__ |___| |\\ \n` +
`   |o__| |___| | \\ \n` +
`   |___| |___| |o \\ \n` +
`  _|___| |___| |__o\\ \n` +
` /...\\_____|___|____\\_/ \n ` +
`\\   o * o * * o o  / `);
log(chalk.blue(`~~~~~~~~~~~~~~~~~~~~~~~~~~`));

prompt({
  type: 'confirm',
  name: 'start',
  message: 'Would you like to start a game of Sinky Ship?',
})
  .then(answer => {
    if (answer.start) {
      sinkyShipServer.emit('new-game');
    } else {
      log(chalk.bgWhite.black(`That's too bad, it's a lot of fun!`));
      process.exit();
    }
  })
  .catch(console.error);

const regexPlacement = /^[a-j-A-J]\d$/;
const regexDirection = /^(r|d|l|u|R|D|L|U)$/;
function regexPlacementTest(value) {
  if (!regexPlacement.test(value)) {
    log(error('\n Please enter a valid coordinate(A-J + 1-9) such as A5 \n'));
    // console.log('Please enter a valid coordinate(A-J + 1-9) such as A5');
    return false;
  } else {
    return true;
  }
}
let shipsPlaced = 1;
function shipPlacementSetup(payload, ship) {

  let shipSetup = {};
  prompt({
    type: 'input',
    name: 'shipPlacement',
    message: `Please select a starting coordinate(A-J + 1-9) for your sinky ship that is ${ship.hitCounter} spaces long Example: A5`,
    validate(value) {
      if (!regexPlacementTest(value)) {
        return prompt();
      }
      if (!initialCoordinateCheck(payload.playerBoard, value)) {
        log(error('Ship already at this coordinate location, choose again'));
        return prompt();
      }
      return true;
    },
  })
    .then(answer => {
      shipSetup.coordinate = answer.shipPlacement.toUpperCase();
      prompt({
        type: 'input',
        name: 'shipDirection',
        message: 'Please indicate a direction for your sinky ship (Right, Down, Left, Up) by entering a R, D, L, or U',
        validate(value) {
          if (!value.match(regexDirection)) {
            log(error('\n Please enter a valid ship direction of R, D, L, U \n'));
            return prompt();
          }

          if (value.toLowerCase() === 'l' || value.toLowerCase() === 'r') {
            return displayShipHorizontal(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
          if (value.toLowerCase() === 'd') {
            return displayShipDown(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
          if (value.toLowerCase() === 'u') {
            return displayShipUp(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
        },
      })
        .then(answer => {
          shipSetup.direction = answer.shipDirection;

          log(chalk.green.inverse('Player Board'));
          log(displayBoard(payload.playerBoard));
          sinkyShipServer.emit(`setup-complete${shipsPlaced}`, payload);
          shipsPlaced++;

        });
    })
    .catch(console.error);
}

sinkyShipServer.on('game-setup1', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload.Carrier);
});

sinkyShipServer.on('game-setup2', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload.Destroyer);
});

sinkyShipServer.on('game-setup3', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload.amphibiousAssaultBoat);
});

sinkyShipServer.on('game-setup4', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload.patrolBoat);
});

sinkyShipServer.on('game-setup5', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload.pirateRowBoat);
});

sinkyShipServer.on('guess', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(displayBoard(payload.playerBoard));

  if (payload.computerGuess === 'Hit') {
    log(chalk.yellow('The computer has hit your ship!'));
  }
  if (payload.computerGuess === 'Miss') {
    log(chalk.magenta('Good ship placement! The computer missed your sinky ship!'));
  }
  log(chalk.green('YOUR TURN'));
  log('Choose a coordinate on the computer`s board to sinky ship!');
  log(chalk.yellow.inverse('Computer Board'));
  log((displayBoard(payload.computerBoard)));

  prompt({
    type: 'input',
    name: 'attack',
    message: 'Please select an attack coordinate(A-J + 1-9) for your torpedo that has not already been hit Example: H2',
    validate(value) {
      if (!value.match(regexPlacement)) {
        log(error('\n Please enter a valid coordinate(A-J + 1-9) such as A5 \n'));
        return prompt();
      }
      let boardCheck = checkBoard(payload.computerBoard, value);
      if (boardCheck.status === 'Hit') {
        payload.missileStatus = 'Hit';
        return true;
      } else if (boardCheck.status === 'Miss') {
        payload.missileStatus = 'Miss';
        return true;
      } else if (!boardCheck) {
        return prompt();
      }
    },
  })
    .then(answer => {
      log(chalk.yellow.inverse('Computer Board'));
      log(displayBoard(payload.computerBoard));
      if (payload.missileStatus === 'Hit') {
        log(chalk.magenta('HIT! YOU\'RE ON YOUR WAY TO SINKY SHIP'));
      }
      if (payload.missileStatus === 'Miss') {
        log(chalk.yellow('MISS! YOU`LL HAVE TO AIM BETTER THAN THAT!'));
      }
      sinkyShipServer.emit('response', payload);
      console.log('Pirate Computer is thinking....Going to sinky ship!');
    })
    .catch(console.error);
});

sinkyShipServer.on('game-over', (payload) => {
  log(chalk.red.bold.inverse('GAMEOVER'));
  log(chalk.yellow.inverse('Computer Board') + '\n', displayBoard(payload.computerBoard));
  log(chalk.green.inverse('Player Board') + '\n', displayBoard(payload.playerBoard));
  if (payload.winner === 'Player 1') {
    log(chalk.bold.green(chalk.inverse('You Win!!!') + ' You sinky shipped and your enemy is defeated!'));
  }
  if (payload.winner === 'Computer') {
    log(chalk.bold.yellow(chalk.inverse('You Lose!!!') + ' You have been sinky shipped and your enemy is victorious!'));
  }
  prompt({
    type: 'confirm',
    name: 'start',
    message: 'Would you like to start a new game of Sinky Ship?',
  })
    .then(answer => {
      if (answer.start) {
        sinkyShipServer.emit('new-game');
      } else {
        log(chalk.bgWhite.black(`That's too bad, we had a lot of fun!`));
        process.exit();
      }
    })
    .catch(console.error);
});




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
    for (let j = originalRow; j < (originalRow + shipLength); j++) {
      if (gameboard[j][index] === '$') {
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
    for (let j = originalRow; j > (originalRow - shipLength); j--) {
      if (gameboard[j][index] === '$') {
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
  log('Hit coordinates', board.size[verticalCoordNumber][horizontalCoord]);
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