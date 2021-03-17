'use strict';

const socketio = require('socket.io-client');
const { prompt } = require('enquirer');

// when we deploy to Heroku - will need to change this
// const sinkyShipUrl = 'https://sinky-ship.herokuapp.com/sinky-ship';
const sinkyShipUrl = 'http://localhost:3000/sinky-ship';

const sinkyShipServer = socketio.connect(sinkyShipUrl);

//enquirer prompt, 
//await response
prompt({
  type: 'confirm',
  name: 'start',
  message: 'Would you like to start a game of Sinky Ship?',
})
  .then(answer => {
    if (answer.start) {
      sinkyShipServer.emit('new-game');
    } else {
      console.log(`That's too bad, it's a lot of fun!`);
      process.exit();
    }
  })
  .catch(console.error);

const regexPlacement = /^[a-j-A-J]\d$/g;
const regexDirection = /^(r|d|l|u|R|D|L|U)$/g;

sinkyShipServer.on('game-setup', (payload) => {
  // user receives board, places ships on board
  console.log('Player Board');
  console.log(displayBoard(payload.playerBoard));
  let shipSetup = {};
  prompt({
    type: 'input',
    name: 'shipPlacement',
    message: 'Please select a starting coordinate(A-J + 1-9) for your sinky ship that is 5 spaces long Example: A5',
    validate(value) {
      if (!regexPlacement.test(value)) {
        console.log('Please enter a valid coordinate(A-J + 1-9) such as A5');
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
            console.log('Please enter a valid ship direction of R, D, L, U');
            return prompt();
          }

          if (value.toLowerCase() === 'l' || value.toLowerCase() === 'r') {
            return displayShipHorizontal(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
          }
          if (value.toLowerCase() === 'd') {
            return displayShipDown(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
          }
          if (value.toLowerCase() === 'u') {
            return displayShipUp(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
          }
        },
      })
        .then(answer => {
          shipSetup.direction = answer.shipDirection;
          console.log('Player Board');
          console.log(displayBoard(payload.playerBoard));
          sinkyShipServer.emit('setup-complete', payload);
        });
    })
    .catch(console.error);
});

sinkyShipServer.on('guess', (payload) => {
  console.log('YOUR TURN');
  console.log('Player Board');
  console.log(displayBoard(payload.playerBoard));
  console.log('Choose a coordinate on the computer`s board to sinky ship!');
  console.log('Computer Board');
  console.log(
    (displayBoard(payload.computerBoard)));
  prompt({
    type: 'input',
    name: 'attack',
    message: 'Please select a attack coordinate(A-J + 1-9) for your torpedo that has not already been hit Example: H2',
    validate(value) {
      if (!value.match(regexPlacement)) {
        console.log('Please enter a valid coordinate(A-J + 1-9) such as A5');
        return prompt();
      }
      let boardCheck = checkBoard(payload.computerBoard, value);
      console.log(boardCheck);
      if (boardCheck.status === 'Hit') {
        console.log('HIT! YOUR ON YOUR WAY TO SINKY SHIP');
        return true;
      } else if (boardCheck.status === 'Miss') {
        console.log('MISS! YOU`LL HAVE TO AIM BETTER');
        return true;
      } else if (!boardCheck) {
        console.log('We did not make it into our if statements');
        return prompt();
      }
    },
  })
    .then(answer => {
      console.log(displayBoard(payload.computerBoard));
      sinkyShipServer.emit('response', payload);
    })
    .catch(console.error);
});

sinkyShipServer.on('game-over', (payload) => {
  // YOU LOSE
  if (payload.winner === 'Player 1') {
    console.log('You Win!!! You sinky shipped and your enemy is defeated!');
  }
  if (payload.winner === 'Computer') {
    console.log('You Lose!!! You have been sinky shipped and your enemy is victorious!');
  }
  console.log('GAMEOVER');
  console.log('Computer Board \n', displayBoard(payload.computerBoard));
  console.log('Player Board \n', displayBoard(payload.playerBoard));
  prompt({
    type: 'confirm',
    name: 'start',
    message: 'Would you like to start a new game of Sinky Ship?',
  })
    .then(answer => {
      if (answer.start) {
        sinkyShipServer.emit('new-game');
      } else {
        console.log(`That's too bad, we had a lot of fun!`);
        process.exit();
      }
    })
    .catch(console.error);
});




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
    return prompt();
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
    return prompt();
  } else if (direction.toLowerCase() === 'u') {
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
      // output += ' ' + board.size[i][j];
      if (board.player === 'Player 1') {
        if (board.size[i][j] === '$') {
          output += ' ' + board.size[i][j] + ' ';
        } else {
          output += ' ' + '* ';
        }
      } else {
        if (board.size[i][j] === 'X') {
          output += ' ' + 'X ';
        } else if (board.size[i][j] === 'O') {
          output += ' ' + 'O ';
        } else {
          output += ' ' + '* ';
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
