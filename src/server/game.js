'use strict';

class GameObject {
  constructor(socketId, ships, gameboard) {
    this.id = socketId;
    this.ships = ships;
    this.gameboard = gameboard;
  }
}

class Ship {
  constructor(name, hitCounter, coordinates) {
    this.name = name;
    this.hitCounter = hitCounter;
    this.coordinates = coordinates;
  }
}



class GameBoard {
  constructor(size) {
    this.size = size;
  }
  displayBoard() {
    let horizontalGuide = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let verticalGuide = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let output = '\n' + '   ';
    for (let i = 0; i < horizontalGuide.length; i++) {
      output += horizontalGuide[i] + '  ';
    }
    output += '\n';
    for (let i = 0; i < this.size.length; i++) {
      output += ' ' + verticalGuide[i] + ' ';
      for (let j = 0; j < this.size[i].length; j++) {
        // output += ' ' + board.size[i][j]; 
        output += ' ' + '* ';
      }
      output += '\n';
    }
    return output;
  }

  displayShip(start, direction, gameboard, shipLength) {
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
      if (direction === 'right') {
        let temp = index;

        if (index + shipLength > 9) {

          console.log('Not enough room. Choose a different starting position, or choose to place your ship to the left.');

        } else {

          while (index < temp + shipLength) {
            array1[index] = '$';
            index++;
          }
        }
      } else if (direction === 'left') {
        let temp = index;

        if (index - shipLength < 0) {

          console.log('Not enough room. Choose a different starting position, or choose to place your ship to the right.');

        } else {

          while (index > temp - shipLength) {
            array1[index] = '$';
            index--;
          }
        }
      } else if (direction === 'down') {
        return 'do stuff';
      } else if (direction === 'up') {
        return 'do stuff';
      }
    }
  }

  displayShot(coord) {

  }
}

class Normal extends GameBoard {
  constructor(size) {
    super([
      ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'],
      ['B0', 'B1', 'B1', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'],
      ['C0', 'C1', 'C1', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
      ['D0', 'D1', 'D1', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
      ['E0', 'E1', 'E1', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9'],
      ['F0', 'F1', 'F1', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'],
      ['G0', 'G1', 'G1', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9'],
      ['H0', 'H1', 'H1', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9'],
      ['I0', 'I1', 'I1', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9'],
      ['J0', 'J1', 'J1', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9'],
    ]);
  }
}

module.exports = {
  GameObject,
  Ship,
  GameBoard,
  Normal,
};