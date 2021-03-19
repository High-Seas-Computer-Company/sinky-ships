'use strict';

const help = require('../src/client/helpers/client-helpers.js');
const gameBoard = require('../src/server/game.js');
const chalk = require('chalk');
const error = chalk.bold.red;
const figlet = require('figlet');
//console.log = jest.fn();
//const log = console.log;

//console.log(board);
//console.log(board.size[0][1]);
//describe('Testing figlet', () => {
//   it('Should create a ascii text of game over', async () => {
//     console.log = jest.fn();
//     const log = console.log;
//     await help.printFiglet('green');

//     expect(console.log).toHaveBeenCalledWith('green');
//     expect(console.log).toHaveBeenCalled();
//   });

// });

describe('All the functionality of the game board and ship placement', () => {
  const board = new gameBoard.Normal();
  const ship1 = new gameBoard.Ship('thePirateRowBoat', 2, 'A1');

  console.log(ship1);
  it('Should create a gameboard 10x10 in size', () => {
    expect(board.size[0][1]).toEqual('A1');
    expect(board.size[5][5]).toEqual('F5');
    expect(board.size[9][9]).toEqual('J9');
  });

  it('Should create a gameboard 10x10 in size', async () => {
    expect(board.size[0][2]).toEqual('A2');
    expect(board.size[9][8]).toEqual('J8');
  });

  it('Should create a gameboard 10x10 in size', async () => {
    expect(board.size[0][3]).toEqual('A3');
    expect(board.size[9][7]).toEqual('J7');
  });

  it('should display the gameboard', () => {
    const test = help.displayBoard(board);

    expect(test).toBeTruthy();
  });

  it('should display a ship horizontally', () => {
    //console.log = jest.fn();
    console.log('xxxxxxxxxxxxxxxx: ', help.displayShipHorizontal('A1', 'l', board, 5));
    help.displayShipHorizontal('A1', 'r', board.size, 5);
    //console.log(help.displayShipHorizontal('A1', 'r', board.size, 5));
    //console.log('BOARD', board);

    //expect(shipHorizontalNoRoom).toContain('Not enough room. Choose a different starting position, or direction.');
    expect(board.size[0][1]).toEqual('$');
    expect(board.size[0][2]).toEqual('$');
    expect(board.size[0][3]).toEqual('$');
    expect(board.size[0][4]).toEqual('$');
    expect(board.size[0][5]).toEqual('$');
    //expect(shipHorizontalRoom).toBeTruthy();
  });

  it('should display a ship vertically down', () => {
    help.displayShipDown('B1', 'd', board.size, 5);
    expect(board.size[1][1]).toEqual('$');
    expect(board.size[2][1]).toEqual('$');
    expect(board.size[3][1]).toEqual('$');
    expect(board.size[4][1]).toEqual('$');
    expect(board.size[5][1]).toEqual('$');
  });

  it('should display a ship vertically up', () => {
    help.displayShipUp('J9', 'u', board.size, 5);
    console.log('wtf?: ', board);

    expect(board.size[5][9]).toEqual('$');
    expect(board.size[6][9]).toEqual('$');
    expect(board.size[7][9]).toEqual('$');
    expect(board.size[8][9]).toEqual('$');
    expect(board.size[9][9]).toEqual('$');
  });

  it('should return a string', () => {

  });
});
