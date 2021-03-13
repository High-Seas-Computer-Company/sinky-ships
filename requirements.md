# Project Prep 4 - Software Requirements

## Vision

- **What is the vision of this product?** A npm library that allows a user to play a game of battleship against a computer opponent. The game will be interactive through the command line terminal and work with randomly generated battleships.
- **What pain point does this project solve?** Allows for a novel way to enjoy your free time.
- **Why should we care about your product?** Takes a classic game and makes it more enjoyable and dynamic.

## Scope In/Out

### In

- Use enquirer npm package to create visually appealing terminal output that is able to intake user input.
- Utilize socket.io to publish and subscribe player movements to main server
- Give computer ability to make randomized choices and also ability to aim for ships once they have been hit once
- Publish the application to the npm public library upon completion
- Create an algorithm for computer selection of targets on the board

### Out

- Machine Learning
- Won't be accessible through a front-end/website
- Won't be player to player/peer to peer

## Minimum Viable Product (MVP)

- Downloadable npm library, utilizing socket.io. Randomly generated battlefield with ships. Create tests to prove functionality of game. Application is deployed live.
- Stretch goals: database for high scores, premium content (extra ships), expandable battlefield/playfield, extra game mechanics (mines, torpedos), terminal introduction screen

## Functional Requirements

- As a user I would like to be able to interact with the game and have it be visually appealing because I would find it more engaging
- As a user I want the application to be able to notify the server of my movements and send me the output after my opponent has moved and vice versa so that I can play the game
- As a player I want the computer to be able to prove a worthy adversary because that will be more fun
- As a user I want to be able to download the application as an npm package because it will be easier to use that way
- As a user I would like to play against a computer opponent that is better than just choosing random selections and is harder to play against because it uses an algorithm for selecting targets

### Data Flow

![image](/assets/Sinky_Ship_DOM.jpg)

## Non-Functional Requirements

- Security: open source
- Usability: npm package available for install, use through terminal, minimal setup, documentation
- Testability:
  - Utilize jest to test ability for user input and also console log spy to test console output
  - Use jest to test emitting and publishing of messages with socket.io
  - Create jest test to be able to make sure the computer can aim for a space next to a ship once it has been detected
  - Make sure one is able to successfully download and use the application using npm install
  - Computer using algorithm should be more effective at game than when using random selection