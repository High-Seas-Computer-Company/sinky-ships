'use strict';

const computerGuessesMade = [];
const shipPlacements = [];
let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const serverFunctions = require('../src/server/helpers/server-helpers.js');
const game = require('../src/server/game.js');

const GameObject = game.GameObject;
const Ship = game.Ship;
const Normal = game.Normal;

const regexPlacement = /^[a-j-A-J]\d$/;

const computerShips = serverFunctions.computerShips;
const generateComputerGuess = serverFunctions.generateComputerGuess;
const validateComputerGuess = serverFunctions.validateComputerGuess;
const validateShipPlacement = serverFunctions.validateShipPlacement;
const winChecker = serverFunctions.winChecker;
const checkBoard = serverFunctions.checkBoard;
const createShips = serverFunctions.createShips;

describe('Testing createShips function', () =>{
  it ('should create an array of ships with specific properties', () => {
    const ships = createShips();

    expect(Array.isArray(ships)).toBeTruthy();
    expect(ships[0].name).toEqual('Spanish Galleon');
    expect(ships[2].hitCounter).toEqual(3);
    expect(ships[4].coordinates).toEqual([]);
  });
});

describe('Testing adding ships to the payload', () =>{
  it ('should add each ship to the payload', () => {
    const ships = createShips();
    const payload = {};
    ships.forEach(ship => {
      payload[ship.name] = ship;
    });
    expect(payload['Spanish Galleon'].name).toEqual('Spanish Galleon');
    expect(payload['Dutch Fleut'].hitCounter).toEqual(4);
    expect(payload['Sloop'].coordinates).toEqual([]);
  });
});

describe('Testing generateComputerGuess function', () =>{
  it ('should create a new guess with valid coordinates', () => {
    let guess = generateComputerGuess();
    expect(guess.match(regexPlacement)).toBeTruthy();
  });
});

describe('Testing validateComputerGuess function', () =>{
  it ('should create a new guess with valid coordinates', () => {
    let guess = validateComputerGuess();
    expect(guess.match(regexPlacement)).toBeTruthy();
  });
  it('should create a guess that is different from the last guess', () => {
    let guess = validateComputerGuess();
    let guessTwo = validateComputerGuess();
    expect(guess.match(regexPlacement)).toBeTruthy();
    expect(guess === guessTwo).toBeFalsy();
  });
});

describe('Testing validateShipPlacement function', () =>{
  it ('should create a new placement with valid coordinates', () => {
    let guess = validateShipPlacement();
    expect(guess.match(regexPlacement)).toBeTruthy();
  });
  it('should create a new placement that is different from the last placement', () => {
    let guess = validateShipPlacement();
    let guessTwo = validateShipPlacement();
    expect(guess.match(regexPlacement)).toBeTruthy();
    expect(guess === guessTwo).toBeFalsy();
  });
});

describe('Testing checkboard function', () =>{
  it('should determine if a guess has been a hit', () => {
    let guess = 'A5';
    let board = new Normal();
    board.size[0][5] = '$';
    let missile = checkBoard(board, guess);
    expect(missile.status).toEqual('Hit');
  });
  it('should determine if a guess has been a miss', () => {
    let guess = 'A4';
    let board = new Normal();
    board.size[0][5] = '$';
    let missile = checkBoard(board, guess);
    expect(missile.status).toEqual('Miss');
  });
});

describe('Testing winChecker function', () =>{
  it('should determine that a game has been won if no $ are present', () => {
    let board = new Normal();

    expect(winChecker(board.size)).toBeTruthy();
  });
  it('should determine that a game has not been won if $ are present', () => {
    let board = new Normal();
    board.size[0][5] = '$';
    expect(winChecker(board.size)).toBeFalsy();
  });
});

describe('Testing computerShips Function', () =>{
  it('should be able to place five ships on the board resulting in 16 $', () => {
    let count = 0;
    let board = new Normal();
    let ships = createShips();
    ships.forEach(ship => {
      computerShips(board, ship);
    });
    for(let i = 0; i < 10; i++){
      for(let j = 0; j < 10; j++){
        if(board.size[i][j] === '$'){
          count ++;
        }
      }
    }
    expect(count).toEqual(16);
  });
});
