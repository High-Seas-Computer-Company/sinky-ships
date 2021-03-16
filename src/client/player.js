'use strict';

const socketio = require('socket.io-client');
const {prompt} = require ('enquirer');

// when we deploy to Heroku - will need to change this
const sinkyShipUrl = 'https://sinky-ship.herokuapp.com/sinky-ship';

const sinkyShipServer = socketio.connect(sinkyShipUrl);

//enquirer prompt, 
//await response
prompt({
  type: 'confirm',
  name: 'start',
  message: 'Would you like to start a game of Sinky Ship?',
})
  .then(answer => {
    if(answer.start){
      sinkyShipServer.emit('new-game');
    }else{
      console.log(`That's too bad, it's a lot of fun!`);
      process.exit();
    }
  })
  .catch(console.error);


sinkyShipServer.on('game-setup', (payload) => {
  // user receives board, places ships on board
  let ship = {};
  const regexPlacement = /^[a-j-A-J]\d$/g;
  const regexDirection = /^(r|d|l|u|R|D|L|U)$/g;
  prompt({
    type: 'input',
    name: 'shipPlacement',
    message: 'Please select a starting coordinate(A-J + 1-9) for your battleship that is 5 spaces long Example: `A5',
    validate(value) {
      if (!regexPlacement.test(value)) {
        console.log('Please enter a valid coordinate(A-J + 1-9) such as "A5');
        return prompt();
      }
      return true;
    },
  })
    .then(answer => {
      ship.coordinate= answer.shipPlacement;
      console.log(ship);
      prompt({
        type: 'input',
        name: 'shipDirection',
        message: 'Please indicate a direction for your battleship (Right, Down, Left, Up) by entering a R, D, L, or U',
        validate(value){
          if(!regexDirection.test(value)){
            console.log('Please enter a valid ship direction of `R, D, L, U`');
            return prompt();
          }
          return true;
        },
      })
        .then(answer => {
          ship.direction= answer.shipDirection;
          console.log(ship);
          sinkyShipServer.emit('setup-complete', payload);
        });
    })
    .catch(console.error);
});

sinkyShipServer.on('guess', (payload) => {
  // prompt user, display their board and computer board
  sinkyShipServer.emit('response', payload);
});

sinkyShipServer.on('game-over', (payload) => {
  // YOU LOSE
  console.log('GAMEOVER', payload);
  // TODO: render the player board and computer board to terminal
  // TODO: ask if want to play again
  //if yes  sinkyShipServer.emit('new-game');
  //else process.exit
});



