'use strict';

const socketio = require('socket.io-client');
const {prompt} = require ('enquirer');

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
  console.log('GAME OBJECT', payload);
  let shipSetup = {};
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
      shipSetup.coordinate= answer.shipPlacement;
      prompt({
        type: 'input',
        name: 'shipDirection',
        message: 'Please indicate a direction for your battleship (Right, Down, Left, Up) by entering a R, D, L, or U',
        validate(value){
          if(!value.match(regexDirection)){
            console.log('INVALID REGEX', value);
            console.log('Please enter a valid ship direction of `R, D, L, U`');
            return prompt();
          }
          let validPlacement = false;
          console.log('THIS IS THE VALUE',value);
          if(value.toLowerCase() === 'l' || value.toLowerCase() === 'r'){
            return displayShipHorizontal(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
          }
          if (value.toLowerCase() === 'd'){
            return displayShipDown(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
            // console.log('VALID PLACEMENT', validPlacement);
          }
          if (value.toLowerCase() === 'u'){
            return displayShipUp(shipSetup.coordinate, value, payload.playerBoard.size, payload.battleship.hitCounter);
          // console.log('VALID PLACEMENT', validPlacement);
          }
          // console.log('VALID PLACEMENT', validPlacement);
          // if(!validPlacement){
          //   return prompt();
          // }
          return true;
          // return prompt();
        },
      })
        .then(answer => {
          shipSetup.direction= answer.shipDirection;
          console.log('setup', shipSetup);
          console.log(payload.playerBoard.size);
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

function displayShipHorizontal(start, direction, gameboard, shipLength){
  let index;
  let i;
  // let indexLoopCounter = 0;
  for (i = 0; i < gameboard.length; i++) {
    let array1 = gameboard[i];
    index = gameboard[i].indexOf(start);
    // if invalid index is selected, will loop through gameboard adding 1 to counter. When it has gone through max times. it will return error
    // if (indexLoopCounter < 9) {
    if (index === -1) {
      // indexLoopCounter++;
      continue;
    }
    // } else if (indexLoopCounter > 9) {
    //   if (index === -1) {
    // return 'Error, invalid coordinates';
    //   }
    // }
    // console.log(index);
    // array1[index] = '$';
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
    } else if (direction.toLowerCase() === 'l') {
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

function displayShipDown(start, direction, gameboard, shipLength){
  let index;
  let i;
  let banana;
  let right = true;
  let wrong = false;
  // let indexLoopCounter = 0;
  // console.log('What coordinate?',start);
  // console.log('direction', direction);
  // console.log('gameboard', gameboard);
  // console.log('shiplength', shipLength);
  for (i = 0; i < gameboard.length; i++) {
    console.log('I AM BANANA', banana);
    index = gameboard[i].indexOf(start);
    // console.log(index);
    // if invalid index is selected, will loop through gameboard adding 1 to counter. When it has gone through max times. it will return error
    // if (indexLoopCounter < 9) {
    if (index === -1) {
      // indexLoopCounter++;
      continue;
    }else{
      banana = i;
      break;
    }
  }
  // console.log('What is I', banana);
  // console.log('GAMEBOARd', gameboard);
  // console.log('GAMEBOARD AT BANANA', gameboard[banana]);
  // console.log('GAMEBOARd BANANA I', gameboard[banana][index]);
  // console.log('WHAT IS INDEX', index);
  if (direction.toLowerCase() === 'd' && banana + shipLength > 9) {

    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return prompt();
  }else if(direction.toLowerCase() === 'd'){
    for(let j = banana; j <(banana + shipLength); j++){
      console.log('GAMEBOARd BANANA I', gameboard[j][index]);
      gameboard[j][index] = '$';
    }
    return true;
  }
}

function displayShipUp(start, direction, gameboard, shipLength){
  let index;
  let i;
  let banana;
  let right = true;
  let wrong = false;
  // let indexLoopCounter = 0;
  // console.log('What coordinate?',start);
  // console.log('direction', direction);
  // console.log('gameboard', gameboard);
  // console.log('shiplength', shipLength);
  for (i = 0; i < gameboard.length; i++) {
    console.log('I AM UP BANANA', banana);
    index = gameboard[i].indexOf(start);
    // console.log(index);
    // if invalid index is selected, will loop through gameboard adding 1 to counter. When it has gone through max times. it will return error
    // if (indexLoopCounter < 9) {
    if (index === -1) {
      // indexLoopCounter++;
      continue;
    }else{
      banana = i;
      break;
    }
  }
  // console.log('What is I', banana);
  // console.log('GAMEBOARd', gameboard);
  // console.log('GAMEBOARD AT BANANA', gameboard[banana]);
  // console.log('GAMEBOARd BANANA I', gameboard[banana][index]);
  // console.log('WHAT IS INDEX', index);

  if(direction.toLowerCase() === 'u' && banana - shipLength < 0){
    console.log('\n Not enough room. Choose a different starting position, or choose to place your ship in different direction.');
    return prompt();
  }else if(direction.toLowerCase() === 'u'){
    for(let j = banana ; j > (banana - shipLength); j--){
      gameboard[j][index] = '$';
    }
    return true;
  }
}