'use strict';

const help = require('../src/client/helpers/client-helpers.js');
const gameBoard = require('../src/server/game.js');

describe('You should be able to create a new board and display it', () => {
  const board = new gameBoard.Normal();

  it('Should create a gameboard 10x10 in size', () => {
    expect(board.size[0][1]).toEqual('A1');
    expect(board.size[5][5]).toEqual('F5');
    expect(board.size[9][9]).toEqual('J9');
  });

  it('should display the gameboard', () => {
    const test = help.displayBoard(board);
    expect(test).toBeTruthy();
  });

  describe('testing functionality of the displayShipHorizontally function', () => {
    it('should display a ship horizontally left or right', () => {
      help.displayShipHorizontal('A1', 'r', board.size, 5);
      expect(board.size[0][1]).toEqual('$');
      expect(board.size[0][2]).toEqual('$');
      expect(board.size[0][3]).toEqual('$');
      expect(board.size[0][4]).toEqual('$');
      expect(board.size[0][5]).toEqual('$');
    });
  });

  describe('testing functionality of the displayShipDown function', () => {
    it('should display a ship vertically down', () => {
      help.displayShipDown('B1', 'd', board.size, 5);
      expect(board.size[1][1]).toEqual('$');
      expect(board.size[2][1]).toEqual('$');
      expect(board.size[3][1]).toEqual('$');
      expect(board.size[4][1]).toEqual('$');
      expect(board.size[5][1]).toEqual('$');
    });
  });

  describe('testing functionality of the displayShipUp function', () => {

    it('should display a ship vertically up', () => {
      help.displayShipUp('J9', 'u', board.size, 5);
      expect(board.size[5][9]).toEqual('$');
      expect(board.size[6][9]).toEqual('$');
      expect(board.size[7][9]).toEqual('$');
      expect(board.size[8][9]).toEqual('$');
      expect(board.size[9][9]).toEqual('$');
    });
  });

  describe('testing functionality of the checkBoard function', () => {
    it('should return falsy an already chosen shot', () => {
      board.size[0][9] = 'X';
      const test = help.checkBoard(board, 'A9');
      expect(test).toBeFalsy();
    });

    it('should set the status to `Hit` on a hit shot', () => {
      board.size[0][8] = '$';
      const test = help.checkBoard(board, 'A8');
      expect(test.status).toEqual('Hit');
    });

    it('should set the status to `Miss` on a hit shot', () => {
      board.size[0][7] = 'A7';
      const test = help.checkBoard(board, 'A7');
      expect(test.status).toEqual('Miss');
    });
  });

  describe('Testing initial coordinate check function', () => {
    it('Should check that a coordinate is already taken and return false', () => {
      let board = new gameBoard.Normal();
      board.size[0][5] = '$';
      expect(help.initialCoordinateCheck(board, 'A5')).toBeFalsy;
    });

    it('Should check that a coordinate is not already taken and return true', () => {
      let board = new gameBoard.Normal();
      board.size[0][4] = '$';
      expect(help.initialCoordinateCheck(board, 'A5')).toBeFalsy;
    });
  });
});
