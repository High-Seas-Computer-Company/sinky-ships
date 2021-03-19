'use strict';

const gameMaster = require('../src/server/game.js');
const playerHelper = require('../src/client/helpers/client-helpers.js');

const Ship = gameMaster.Ship;
const Normal = gameMaster.Normal;
const GameObject = gameMaster.GameObject;

describe('creating a new ship', () => {
  it ('should instantiate a new ship with ship object properties', () => {
    const battleship = new Ship('battleship', 5, 'A5');

    expect(battleship.name).toEqual('battleship');
    expect(battleship.hitCounter).toEqual(5);
    expect(battleship.coordinates).toEqual('A5');
    //revisit coordinate testing - will need x/y positioning
  });

});

describe('creating a new normal gameboard', () => {
  it ('should instantiate a new normal sized gameboard', () => {
    const board = new Normal(10);
    // console.log('this is board', board);

    expect(board.size[0][5]).toEqual('A5');
    expect(board.size[3][8]).toEqual('D8');
    expect(board.size[9][9]).toEqual('J9');
  });


});

describe('creating a new gameobject', () => {
  it ('should instantiate a new game object', () => {
    const gameObject = new GameObject('socketId', 'ships', 'gameboard');

    expect(gameObject).toBeTruthy();
    expect(gameObject.id).toEqual('socketId');
    expect(gameObject.ships).toEqual('ships');
    expect(gameObject.gameboard).toEqual('gameboard');
  });

  it ('should instantiate a new socketid in the game object', () => {
    const gameObject = new GameObject('3', 'ships', 'gameboard');

    expect(gameObject.id).toEqual('3');
  });

  it ('should instantiate a new ship in the game object', () => {
    const battleship = new Ship('battleship', 5, 'A5');
    const gameObject = new GameObject('socketId', battleship, 'gameboard');

    expect(gameObject.ships.name).toEqual('battleship');
    expect(gameObject.ships.hitCounter).toEqual(5);
    expect(gameObject.ships.coordinates).toEqual('A5');
    //revisit coordinate testing - will need x/y positioning
  });

  it ('should instantiate a new gameboard in the game object', () => {
    const board = new Normal(10);
    const gameObject = new GameObject('socketId', 'ship', board);

    expect(gameObject.gameboard.size[0][5]).toEqual('A5');
    expect(gameObject.gameboard.size[3][8]).toEqual('D8');
    expect(gameObject.gameboard.size[9][9]).toEqual('J9');
  });

});

describe('testing display board function', () => {
  it ('should output a console ready gameboard', () => {
    const board = new Normal(10);
    const displayBoard = playerHelper.displayBoard(board);


    expect(displayBoard.includes('\n')).toBeTruthy();
    expect(displayBoard.includes('A')).toBeTruthy();
    expect(displayBoard.includes('1')).toBeTruthy();
    expect(displayBoard.includes('*')).toBeTruthy();
  });

});