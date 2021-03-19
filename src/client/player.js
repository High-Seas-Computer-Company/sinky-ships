'use strict';

const socketio = require('socket.io-client');
const { prompt } = require('enquirer');
const chalk = require('chalk');
const log = console.log;
const error = chalk.bold.red;
const figlet = require('figlet');
const help = require('./helpers/client-helpers.js');


const sinkyShipUrl = 'https://sinky-ship.herokuapp.com/sinky-ship';

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
  `    <|    \n` +
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
    message: `Please select a starting coordinate(A-J + 1-9) for your ${ship.name} that is ${ship.hitCounter} spaces long Example: A5`,
    validate(value) {
      if (!regexPlacementTest(value)) {
        return prompt();
      }
      if (!help.initialCoordinateCheck(payload.playerBoard, value)) {
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
            return help.displayShipHorizontal(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
          if (value.toLowerCase() === 'd') {
            return help.displayShipDown(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
          if (value.toLowerCase() === 'u') {
            return help.displayShipUp(shipSetup.coordinate, value, payload.playerBoard.size, ship.hitCounter);
          }
        },
      })
        .then(answer => {
          shipSetup.direction = answer.shipDirection;

          sinkyShipServer.emit(`setup-complete${shipsPlaced}`, payload);
          shipsPlaced++;

        });
    })
    .catch(console.error);
}


sinkyShipServer.on('game-setup1', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload['Spanish Galleon']);
});

sinkyShipServer.on('game-setup2', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload['Dutch Fleut']);
});

sinkyShipServer.on('game-setup3', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload['Brigantine']);
});

sinkyShipServer.on('game-setup4', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload['Sloop']);
});

sinkyShipServer.on('game-setup5', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));
  shipPlacementSetup(payload, payload['Schooner']);
});

sinkyShipServer.on('guess', (payload) => {
  log(chalk.green.inverse('Player Board'));
  log(help.displayBoard(payload.playerBoard));

  if (payload.computerGuess === 'Hit') {
    log(chalk.yellow('The computer has hit your ship!'));
  }
  if (payload.computerGuess === 'Miss') {
    log(chalk.magenta('Good ship placement! The computer missed your sinky ship!'));
  }
  log(chalk.green('YOUR TURN'));
  log('Choose a coordinate on the computer`s board to sinky ship!');
  log(chalk.yellow.inverse('Computer Board'));
  log((help.displayBoard(payload.computerBoard)));

  prompt({
    type: 'input',
    name: 'attack',
    message: 'Please select an attack coordinate(A-J + 1-9) that has not already been hit for your cannon ball shot Example: H2',
    validate(value) {
      if (!value.match(regexPlacement)) {
        log(error('\n Please enter a valid coordinate(A-J + 1-9) such as A5 \n'));
        return prompt();
      }
      let boardCheck = help.checkBoard(payload.computerBoard, value);
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
      log(help.displayBoard(payload.computerBoard));
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
  log(chalk.yellow.inverse('Computer Board') + '\n', help.displayBoard(payload.computerBoard));
  log(chalk.green.inverse('Player Board') + '\n', help.displayBoard(payload.playerBoard));
  if (payload.winner === 'Player 1') {
    log(chalk.bold.green(chalk.inverse('You Win!!!') + ' You sinky shipped and your enemy is defeated!'));
    help.printFiglet('green');
  }
  if (payload.winner === 'Computer') {
    log(chalk.bold.yellow(chalk.inverse('You Lose!!!') + ' You have been sinky shipped and your enemy is victorious!'));
    help.printFiglet('red');
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
