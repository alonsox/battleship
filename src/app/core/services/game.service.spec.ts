import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';
import { MessageService } from './message.service';
import { PlayerType, Direction, GamePhase } from '../enums';
import { Credential, IShipSpec, IAttackReport } from '../interfaces';
import { ShipType } from '../game/ship-type';
import { Subscription } from 'rxjs';
import { KeyGeneratorService } from './key-generator.service';

describe('GameService', () => {
  let gameService: GameService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['send', 'receive']);

    TestBed.configureTestingModule({
      providers: [GameService, { provide: MessageService, useValue: spy }],
    });

    gameService = TestBed.inject(GameService);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<
      MessageService
    >;
  });

  describe('Player Creation', () => {
    it("Returns null when the player's name is null, undefined or an empty string", () => {
      // NORMAL PLAYER
      expect(gameService.createPlayer(null)).toBeNull(
        'Expected null in person player',
      );
      expect(gameService.createPlayer(undefined)).toBeNull(
        'Expected null in person player',
      );
      expect(gameService.createPlayer('')).toBeNull(
        'Expected null in person player',
      );

      // COMPUTER PLAYER
      expect(gameService.createPlayer('computer player', null)).toBeNull(
        'Expected null in computer player',
      );
    });

    it('Creates a player', () => {
      // SET UP
      const playerName = 'player name';
      const newPlayer = gameService.createPlayer(playerName);

      // ASSERT
      expect(newPlayer).not.toBeNull();
      expect(gameService.getPlayerName(newPlayer.id)).toBe(playerName);
    });
  });

  describe("Recovering players' names", () => {
    it('#getPlayerName returns null when the ID does not exist', () => {
      // SET UP
      const randomID = 3434;
      expect(gameService.getPlayerName(null)).toBeNull();
      expect(gameService.getPlayerName(undefined)).toBeNull();
      expect(gameService.getPlayerName(randomID)).toBeNull();
    });

    it('#getPlayerName returns the name when the ID exists', () => {
      // SET UP
      const p1Name = 'player 1';
      const p2Name = 'player 2';
      const p1 = gameService.createPlayer(p1Name);
      const p2 = gameService.createPlayer(p2Name);

      // ASSERT
      expect(gameService.getPlayerName(p1.id)).toBe(p1Name);
      expect(gameService.getPlayerName(p2.id)).toBe(p2Name);
    });
  });

  describe("Recovering a player's board", () => {
    it('#getPlayerBoard returns null when the credentials are invalid', () => {
      expect(gameService.getPlayerBoard(null)).toBeNull('Credentials are null');

      expect(gameService.getPlayerBoard(undefined)).toBeNull(
        'Credentials are undefined',
      );

      expect(gameService.getPlayerBoard({ id: -1, key: 'a' })).toBeNull(
        'User does not exist',
      );
    });

    it('#getPlayerBoard returns the board when the credentials are valid', () => {
      // SETUP
      const player1 = gameService.createPlayer('player 1');

      // Add other players
      gameService.createPlayer('player 2');
      gameService.createPlayer('player 3');
      gameService.createPlayer('player 4');

      // TODO: Make some attacks to player 1

      // ASSERT
      expect(gameService.getPlayerBoard(player1)).not.toBeNull();
      // TODO: validate that the attacks were carried out and corresponds to player 1
    });
  });

  describe('Adding ships', () => {
    let badCredential: Credential;
    let badShipSpec: IShipSpec;

    beforeEach(() => {
      badCredential = { id: -1, key: 'sad' };

      badShipSpec = {
        shipType: ShipType.DESTROYER,
        direction: Direction.Right,
        position: { row: -4, col: -3 }, // Outside the grid
      };
    });

    it('Sends error when adding ship with null or undefined parameters', () => {
      /* NOTE: Here badCredential and badShipSpec are used only to pass
       * something not null */

      gameService.addShip(null, null); // +1 call to MessageService
      gameService.addShip(badCredential, null); // +1 call to MessageService
      gameService.addShip(null, badShipSpec); // +1 call to MessageService

      gameService.addShip(undefined, undefined); // +1 call to MessageService
      gameService.addShip(badCredential, undefined); // +1 call to MessageService
      gameService.addShip(undefined, badShipSpec); // +1 call to MessageService

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(
        6,
        'Calls message service with null or undefined parameters',
      );
    });

    it('Sends error when the credential is bad', () => {
      gameService.addShip(badCredential, {
        shipType: ShipType.DESTROYER,
        direction: Direction.Right,
        position: { row: 0, col: 0 },
      });

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(
        1,
        'Only the credentials are invalid',
      );
    });

    it('Sends error when with invalid ship specification parameters', () => {
      // This player is to make the credentials valid
      const player = gameService.createPlayer('player'); // +1 call to MessageService

      gameService.addShip(player, badShipSpec); // +1 call to MessageService

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(
        2,
        'Calls message service when the ship spec is  invalid',
      );
    });

    it('Sends error when ships overlaps', () => {
      // This player is to make the credentials valid
      const player = gameService.createPlayer('player'); // +1 call to MessageService

      // This is OK
      gameService.addShip(player, {
        shipType: ShipType.CARRIER,
        direction: Direction.Right,
        position: { row: 0, col: 0 },
      });

      // +1 call to MessageService
      gameService.addShip(player, {
        shipType: ShipType.BATTLESHIP,
        direction: Direction.Right,
        position: { row: 0, col: 2 },
      });

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(2, 'Ships overlap');
    });

    it('Does not allow to add the same ship twice', () => {
      // This player is to make the credentials valid
      const player = gameService.createPlayer('player'); // +1 call to MessageService

      // This is OK
      gameService.addShip(player, {
        shipType: ShipType.CARRIER,
        direction: Direction.Right,
        position: { row: 0, col: 0 },
      });

      // +1 call to MessageService
      gameService.addShip(player, {
        shipType: ShipType.CARRIER,
        direction: Direction.Right,
        position: { row: 2, col: 0 },
      });

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(
        2,
        'Adding the same ship twice',
      );
    });

    it('Allows at most 5 ships in the board', () => {
      // This player is to make the credentials valid
      const player = gameService.createPlayer('player'); // Error: +1 call to MessageService
      const ships = ShipType.ALL_SHIPS;

      // Add one ship of each type
      ships.forEach((ship, index) => {
        gameService.addShip(player, {
          shipType: ship,
          direction: Direction.Right,
          position: { row: index, col: 0 },
        });
      });

      // Error: +1 call to MessageService
      gameService.addShip(player, {
        shipType: ShipType.DESTROYER,
        direction: Direction.Right,
        position: { row: 6, col: 0 },
      });

      // ASSERT
      expect(messageServiceSpy.send.calls.count()).toBe(
        2,
        'Adding the same ship twice',
      );
    });

    it('Sends error when adding ships for computer players', () => {
      // +1 call
      const computerPlayer = gameService.createPlayer(
        'pc',
        PlayerType.Computer,
      );

      // +1 call
      gameService.addShip(computerPlayer, {
        shipType: ShipType.DESTROYER,
        direction: Direction.Right,
        position: { row: 0, col: 0 },
      });

      expect(messageServiceSpy.send.calls.count()).toBe(
        2,
        'Does not add ships to computer  players',
      );
    });
  });

  describe('Attacking ships', () => {
    let player1: Credential;
    let player2: Credential;

    beforeEach(() => {
      player1 = gameService.createPlayer('player 1', PlayerType.Person);
      player2 = gameService.createPlayer('player 2', PlayerType.Person);

      // Add ships
      /* Ships positiones like this in the left-top corner
       * +++++
       * ++++
       * +++
       * +++
       * ++
       */
      gameService.addShip(player1, {
        shipType: ShipType.CARRIER,
        position: { row: 0, col: 0 },
        direction: Direction.Right,
      });
      gameService.addShip(player1, {
        shipType: ShipType.BATTLESHIP,
        position: { row: 1, col: 0 },
        direction: Direction.Right,
      });
      gameService.addShip(player1, {
        shipType: ShipType.CRUISER,
        position: { row: 2, col: 0 },
        direction: Direction.Right,
      });
      gameService.addShip(player1, {
        shipType: ShipType.SUBMARINE,
        position: { row: 3, col: 0 },
        direction: Direction.Right,
      });
      gameService.addShip(player1, {
        shipType: ShipType.DESTROYER,
        position: { row: 4, col: 0 },
        direction: Direction.Right,
      });

      /* Ships positiones like this in the left-top corner
       * +++++
       * +++++
       * ++++
       * ++
       * +
       */
      gameService.addShip(player2, {
        shipType: ShipType.CARRIER,
        position: { row: 0, col: 0 },
        direction: Direction.Down,
      });
      gameService.addShip(player2, {
        shipType: ShipType.BATTLESHIP,
        position: { row: 0, col: 1 },
        direction: Direction.Down,
      });
      gameService.addShip(player2, {
        shipType: ShipType.CRUISER,
        position: { row: 0, col: 2 },
        direction: Direction.Down,
      });
      gameService.addShip(player2, {
        shipType: ShipType.SUBMARINE,
        position: { row: 0, col: 3 },
        direction: Direction.Down,
      });
      gameService.addShip(player2, {
        shipType: ShipType.DESTROYER,
        position: { row: 0, col: 4 },
        direction: Direction.Down,
      });
    });

    it('Attacks and receives attack report', (done: DoneFn) => {
      // SETUP
      const row = 0;
      const col = 0;

      const sub: Subscription = gameService
        .getAttackReport()
        .subscribe((report: IAttackReport) => {
          // ASSERT
          expect(report.attackPoint.row).toBe(row);
          expect(report.attackPoint.col).toBe(col);
          expect(report.victimId).toBe(player2.id);
          expect(report.hasVictimLost).toBeFalse();
          done();
        });

      // ATTACK
      gameService.startGame();
      gameService.attack(player1.id, player2.id, { row, col });

      // CLEAN UP
      sub.unsubscribe();
    });

    it('Gets attacked by a computer player', (done: DoneFn) => {
      // SET UP
      const newGameService = new GameService(
        messageServiceSpy,
        new KeyGeneratorService(),
      );

      const p1 = newGameService.createPlayer('p1', PlayerType.Person);
      newGameService.addShip(p1, {
        shipType: ShipType.CARRIER,
        position: { row: 0, col: 0 },
        direction: Direction.Right,
      });
      newGameService.addShip(p1, {
        shipType: ShipType.BATTLESHIP,
        position: { row: 1, col: 0 },
        direction: Direction.Right,
      });
      newGameService.addShip(p1, {
        shipType: ShipType.CRUISER,
        position: { row: 2, col: 0 },
        direction: Direction.Right,
      });
      newGameService.addShip(p1, {
        shipType: ShipType.SUBMARINE,
        position: { row: 3, col: 0 },
        direction: Direction.Right,
      });
      newGameService.addShip(p1, {
        shipType: ShipType.DESTROYER,
        position: { row: 4, col: 0 },
        direction: Direction.Right,
      });

      const pc = newGameService.createPlayer('pc', PlayerType.Computer);

      // ASSERT
      const attacksId = [pc.id, p1.id, pc.id, p1.id];
      let index = 0;
      const sub: Subscription = newGameService
        .getAttackReport()
        .subscribe((report: IAttackReport) => {
          expect(report.victimId).toBe(attacksId[index]);
          index++;
          if (index === 3) {
            done();
          }
        });

      // ATTACK
      newGameService.startGame();
      newGameService.attack(p1.id, pc.id, { row: 0, col: 0 });
      // PC attacks automatically
      newGameService.attack(p1.id, pc.id, { row: 2, col: 4 });
      // PC attacks automatically

      // CLEAN UP
      sub.unsubscribe();
    });

    it('Gets the loser', (done: DoneFn) => {
      // SET UP

      // ASSERT
      const sub: Subscription = gameService
        .getLoserPlayer()
        .subscribe((loserID: number) => {
          expect(loserID).toBe(player2.id);
          done();
        });

      // ATTACK
      /* Since all the ships are in the top left corner and there are at most 5
       * ships with the largest one using 5 spaces, P1 attacks the top left
       * corner of P2 while P2 attacks other part without sinking the ships of
       * P1, therefore ensuring that P1 will be the winner and P2 the looser.
       */
      gameService.startGame();
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          gameService.attack(player1.id, player2.id, { row: i, col: j });

          gameService.attack(player2.id, player1.id, {
            row: 3 + i,
            col: 3 + j,
          });
        }
      }

      // CLEAN UP
      sub.unsubscribe();
    });

    it('Gets the winner', (done: DoneFn) => {
      // SET UP

      // ASSERT
      const sub: Subscription = gameService
        .getWinner()
        .subscribe((winnerID: number) => {
          expect(winnerID).toBe(player1.id);
          done();
        });

      // ATTACK
      /* Since all the ships are in the top left corner and there are at most 5
       * ships with the largest one using 5 spaces, P1 attacks the top left
       * corner of P2 while P2 attacks other part without sinking the ships of
       * P1, therefore ensuring that P1 will be the winner and P2 the looser.
       */
      gameService.startGame();
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          gameService.attack(player1.id, player2.id, { row: i, col: j });

          gameService.attack(player2.id, player1.id, {
            row: 3 + i,
            col: 3 + j,
          });
        }
      }

      // CLEAN UP
      sub.unsubscribe();
    });

    xit('Sends error when the game is not in War phase', () => {
      // TODO: implement
    });
  });

  describe('Game Phases', () => {
    let player1: Credential;
    let player2: Credential;

    beforeEach(() => {
      player1 = gameService.createPlayer('player 1', PlayerType.Person);
      player2 = gameService.createPlayer('player 2', PlayerType.Person);

      // Add ships
      ShipType.ALL_SHIPS.forEach((ship, index) => {
        gameService.addShip(player1, {
          shipType: ship,
          position: { row: index, col: 0 },
          direction: Direction.Right,
        });
        gameService.addShip(player2, {
          shipType: ship,
          position: { row: 0, col: index },
          direction: Direction.Down,
        });
      });
    });

    it('Game in ColdWar phase when nothing has been done', (done: DoneFn) => {
      const sub = gameService.getGamePhase().subscribe((phase: GamePhase) => {
        expect(phase).toBe(GamePhase.NotPlaying);
        done();
      });
      // TODO: Convert the subkect into a behavioural subject and emit a value in the constructor

      sub.unsubscribe();
    });

    it('Changes game phase when the game starts', (done: DoneFn) => {
      // On creation the GameService sends the cold war phase, so we need to
      // ignore that
      const phases = [GamePhase.NotPlaying, GamePhase.Playing];

      let index = 0;
      const sub: Subscription = gameService
        .getGamePhase()
        .subscribe((gamePhase: GamePhase) => {
          expect(gamePhase).toBe(phases[index]);
          index++;
          if (index === 2) {
            done();
          }
        });

      // ADD PLAYERS AND START GAME
      gameService.startGame();

      // CLEAN UP
      sub.unsubscribe();
    });

    it("Changes the game's phase when preparing for a new round", (done: DoneFn) => {
      const sub = gameService.getGamePhase().subscribe((phase: GamePhase) => {
        expect(phase).toBe(GamePhase.NotPlaying);
        done();
      });

      gameService.newRound();

      // CLEAN UP
      sub.unsubscribe();
    });
  });

  describe('Game loop', () => {
    let player1: Credential;
    let player2: Credential;

    beforeEach(() => {
      player1 = gameService.createPlayer('player 1', PlayerType.Person);
      player2 = gameService.createPlayer('player 2', PlayerType.Person);

      // Add ships
      ShipType.ALL_SHIPS.forEach((ship, index) => {
        /* Ships positiones like this in the left-top corner
         * +++++
         * ++++
         * +++
         * +++
         * ++
         */
        gameService.addShip(player1, {
          shipType: ship,
          position: { row: index, col: 0 },
          direction: Direction.Right,
        });

        /* Ships positiones like this in the left-top corner
         * +++++
         * +++++
         * ++++
         * ++
         * +
         */
        gameService.addShip(player2, {
          shipType: ship,
          position: { row: 0, col: index },
          direction: Direction.Down,
        });
      });
    });

    it('Sets the first player as the current player when the game starts', (done: DoneFn) => {
      const sub = gameService
        .getCurrentPlayer()
        .subscribe((currentPlayerId: number) => {
          expect(currentPlayerId).toBe(player1.id);
          done();
        });

      gameService.startGame();

      // CLEAN UP
      sub.unsubscribe();
    });

    it('Changes current player with every attack', (done: DoneFn) => {
      const currentPlayersId = [player1.id, player2.id, player1.id, player2.id];

      let index = 0;
      const sub = gameService
        .getCurrentPlayer()
        .subscribe((currentPlayerId: number) => {
          expect(currentPlayerId).toBe(currentPlayersId[index]);
          index++;
          if (index === 4) {
            done();
          }
        });

      // ATTACK
      gameService.startGame();
      gameService.attack(player1.id, player2.id, { row: 0, col: 0 });
      gameService.attack(player2.id, player1.id, { row: 0, col: 0 });
      gameService.attack(player1.id, player2.id, { row: 3, col: 4 });

      // CLEAN UP
      sub.unsubscribe();
    });
  });
});
