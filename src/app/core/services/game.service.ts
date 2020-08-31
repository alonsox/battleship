import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

import { MessageService } from './message.service';
import { PlayerType, GamePhase, MessageStatus, Direction } from '../enums';
import {
  Credential,
  IGridPoint,
  IShipSpec,
  GameUser,
  IBoardCell,
  IAttackReport,
} from '../interfaces';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { KeyGeneratorService } from './key-generator.service';
import { Player } from '../game/player';
import { ComputerPlayer } from '../game/computer-player';
import { Gameboard } from '../game/gameboard';
import { PlayerError, BoardError } from '../game/game-errors';
import { ShipType } from '../game/ship-type';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private users: GameUser[] = [];

  private currentPlayerIndex: number;
  private gamePhase: GamePhase;
  private roundsPlayed: number;

  private loser$ = new Subject<number>();
  private winner$ = new Subject<number>();
  private currentPlayer$ = new Subject<number>();
  private gamePhase$ = new BehaviorSubject<GamePhase>(GamePhase.NotPlaying);
  private attackReport$ = new Subject<IAttackReport>();

  constructor(
    private messageService: MessageService,
    private keyGeneratorService: KeyGeneratorService,
  ) {}

  /**
   * Creates a new player.
   *
   * @param name The name of the player.
   * @param playerType The type of the player. Defaults to person.
   */
  createPlayer(name: string, playerType = PlayerType.Person): Credential {
    // VALIDATE INPUT
    if (!playerType) {
      this.messageService.send({
        body: 'The player type is null',
        status: MessageStatus.Error,
      });
      return null;
    }

    // CHECK THAT THE NAME IS NOT ALREADY IN USE
    if (this.users.find((user: GameUser) => user.player.name === name)) {
      this.messageService.send({
        body: `The name "${name}" is already in use`,
        status: MessageStatus.Warning,
      });
      return null;
    }

    // CREATE NEW USER
    // Create player first
    let newPlayer: Player;
    try {
      /* NOTE: The player's constructor validates for null, undefined, and
       * empty string */
      switch (playerType as PlayerType) {
        case PlayerType.Person:
          newPlayer = new Player(name);
          break;
        case PlayerType.Computer:
          newPlayer = new ComputerPlayer(name);
          break;
        default:
          throw new PlayerError('Unknown player type');
      }
    } catch (e) {
      this.messageService.send({
        body: (e as PlayerError).message,
        status: MessageStatus.Error,
      });
      return null;
    }

    // the user
    const newUser: GameUser = {
      key: this.keyGeneratorService.newKey(),
      player: newPlayer,
      board: new Gameboard(),
      playerType: playerType,
    };

    // ACKNOWLEDGE OTHER PLAYERS
    this.users.forEach((user) => {
      // Other players acknowledge new player (if applies)
      if (user.playerType === PlayerType.Computer) {
        (user.player as ComputerPlayer).acknowledgeEnemy(newUser.player.id);
      }
      // New player acknoledges existing players (if applies)
      if (newUser.playerType === PlayerType.Computer) {
        (newUser.player as ComputerPlayer).acknowledgeEnemy(user.player.id);
      }
    });

    // ADD PLAYER TO THE ARRAY OF PLAYERS
    this.users.push(newUser);

    // CREATE SHIPS FOR A COMPUTER PLAYER
    if (newUser.playerType === PlayerType.Computer) {
      this.createComputerPlayerShips(newUser);
    }

    // NOTIFY ABOUT THE NEW USER
    this.messageService.send({
      body: `${name} has just joined the game`,
      status: MessageStatus.OK,
    });

    // RETURN USER
    return { id: newUser.player.id, key: newUser.key };
  }

  private createComputerPlayerShips(user: GameUser): void {
    ShipType.ALL_SHIPS.forEach((type) => {
      let shipAdded: boolean;
      do {
        const row = Math.floor(Math.random() * user.board.height);
        const col = Math.floor(Math.random() * user.board.height);
        const direction = this.getRandomDirection();

        try {
          user.board.addShip({
            shipType: type,
            position: { row, col },
            direction,
          });
          shipAdded = true;
        } catch (e) {
          shipAdded = false;
        }
      } while (!shipAdded);
    });
  }

  private getRandomDirection(): Direction {
    const number = Math.random();
    if (number >= 0 && number < 0.25) {
      return Direction.Up;
    } else if (number >= 0.25 && number < 0.5) {
      return Direction.Down;
    } else if (number >= 0.5 && number < 0.75) {
      return Direction.Left;
    } else {
      return Direction.Right;
    }
  }

  /** @returns The name of the player that has the indicated ID or null if said
   * player does not exist.
   */
  getPlayerName(playerId: number): string {
    const user = this.users.find(
      (user: GameUser) => user.player.id === playerId,
    );

    return user ? user.player.name : null;
  }

  /** Gets the board of a player */
  getPlayerBoard(credential: Credential): IBoardCell[][] {
    const user = this.findUser(credential);

    return user ? user.board.getBoardCopy() : null;
  }

  /**
   * Adds a new to a board.
   *
   * Reports error in the message service. It does not report if a ship was
   * added.
   *
   * @param credential The user's ID and key.
   * @param shipSpec The details about the ship being added.
   */
  addShip(credential: Credential, shipSpec: IShipSpec): void {
    // VERIFY WE ARE IN THE ColdWar PHASE, IF NOT => DO NOTHING
    // if (this.gamePhase !== GamePhase.ColdWar) {
    //   return;
    // }

    // VALIDATE FOR NULL AND UNDEFINED
    if (!credential) {
      this.messageService.send({
        body: 'The credentials are null or undefined',
        status: MessageStatus.Error,
      });
      return;
    }

    // VALIDATE CREDENTIALS
    const user = this.findUser(credential);
    if (!user) {
      this.messageService.send({
        body: 'Cannot add ship to not existing user',
        status: MessageStatus.Error,
      });
      return;
    }

    // DOES NOT ADD SHIPS TO COMPUTER PLAYERS
    if (user.playerType === PlayerType.Computer) {
      this.messageService.send({
        body: 'Cannot add ship to computer player',
        status: MessageStatus.Error,
      });
      return;
    }

    // CHECK EACH PLAYER HAS THE CORRECT NUMBER AND TYPE OF SHIPS
    /* NOTE: This also covers the case in which there are already the five types
     * of ships in the board. */
    if (user.board.hasShip(shipSpec.shipType)) {
      this.messageService.send({
        body: `There is already a "${shipSpec.shipType.type}" in the board`,
        status: MessageStatus.Error,
      });
      return;
    }

    // ADD SHIP
    try {
      /* NOTE: This function checks that the ship specification is valid. */
      user.board.addShip(shipSpec);
    } catch (e) {
      this.messageService.send({
        body: (e as BoardError).message,
        status: MessageStatus.Error,
      });
      return;
    }
  }

  private findUser(credential: Credential): GameUser {
    if (!credential) {
      return undefined;
    }

    return this.users.find(
      (user) => user.player.id === credential.id && user.key === credential.key,
    );
  }

  /**
   * Attacks a player.
   *
   * The attacked is carried out only if the current player's ID is the same as
   * the attacking player.
   *
   * @param attackerId The ID of the attacking player.
   * @param victimId The ID of the player being attacked.
   * @param attackPoint The point to attack.
   */
  attack(attackerId: number, victimId: number, attackPoint: IGridPoint): void {
    // VERIFY WE ARE IN THE War PHASE, IF NOT => DO NOTHING
    // if (this.gamePhase !== GamePhase.War) {
    //   return;
    // }

    // VALIDATE THE ATTACKER AND VICTIM'S ID
    const attacker = this.users.find((user) => user.player.id === attackerId);
    if (!attacker) {
      this.messageService.send({
        body: 'The attacking player does not exists',
        status: MessageStatus.Error,
      });
      return;
    }

    const victim = this.users.find((user) => user.player.id === victimId);
    if (!victim) {
      this.messageService.send({
        body: 'The attacked player does not exists',
        status: MessageStatus.Error,
      });
      return;
    }

    // Both ID's are the same => do nothing
    if (attacker.player.id === victim.player.id) {
      return;
    }

    // THE ATTACKER MUST BE THE CURRENT PLAYER
    if (attacker.player.id !== this.users[this.currentPlayerIndex].player.id) {
      return;
    }

    // DO NOT ATTACK NOR CHANGE PLAYER IF THE CELL WAS ATTACKED
    if (victim.board.wasCellAttacked(attackPoint)) {
      this.messageService.send({
        body: 'This cell was already attacked',
        status: MessageStatus.Warning,
      });
      return;
    }

    // ATTACK
    try {
      /* This will validate the attack point*/
      victim.board.receiveAttack(attackPoint);
    } catch (e) {
      this.messageService.send({
        body: (e as BoardError).message,
        status: MessageStatus.Error,
      });
      return;
    }

    // REPORT ATTACK
    const attackReport: IAttackReport = {
      hasVictimLost: victim.board.areAllShipsSunk(),
      victimId,
      attackPoint: cloneDeep(attackPoint),
    };

    // To computer player
    this.users
      .filter((user) => user.playerType === PlayerType.Computer)
      .forEach((user) =>
        (user.player as ComputerPlayer).receiveAttackReport(attackReport),
      );

    // To outside
    this.attackReport$.next(attackReport);

    // DETECT IF THERE IS WINNER
    const aliveUsers = this.users.filter(
      (user) => !user.board.areAllShipsSunk(),
    );
    if (aliveUsers.length === 1) {
      this.winner$.next(aliveUsers[0].player.id);
      this.changeGamePhase(GamePhase.NotPlaying);
    }

    // DETECT IF THE ATTACKED PLAYER LOST
    if (victim.board.areAllShipsSunk()) {
      this.loser$.next(victim.player.id);
    }

    // CHANGE CURRENT PLAYER
    this.changeCurrentPlayer();

    const currentUser = this.users[this.currentPlayerIndex];
    if (currentUser.playerType === PlayerType.Computer) {
      const attack = (currentUser.player as ComputerPlayer).attack();
      this.attack(currentUser.player.id, attack.victimId, attack.attackPoint);
    }
  }

  /** Starts a new game, game enters in War phase */
  startGame(): void {
    if (this.gamePhase === GamePhase.Playing) {
      return;
    }

    // Should be at least 2 players before starting
    if (this.users.length < 2) {
      this.messageService.send({
        body: 'There must be at least 2 players to start a game',
        status: MessageStatus.Error,
      });
      return;
    }

    // CHANGE PHASE TO Playing
    this.changeGamePhase(GamePhase.Playing);

    // CHECK ALL PLAYERS HAVE THE CORRECT TYPE OF SHIPS
    if (!this.playersHaveAllShips()) {
      this.messageService.send({
        body: 'A player does not have all the ships',
        status: MessageStatus.Error,
      });
      return;
    }

    // Set the current player
    this.changeCurrentPlayer();
  }

  /** Resets boards but no scores, games enter in ColdWar phase */
  newRound(): void {
    // Reset boards of all the players (in computer players call resetBoard(), not reset())
    this.users.forEach((user) => {
      user.board.reset();

      if (user.playerType === PlayerType.Computer) {
        (user.player as ComputerPlayer).resetEnemyTracking();
        this.createComputerPlayerShips(user);
      }
    });

    // Change phase to NotPlaying
    this.changeGamePhase(GamePhase.NotPlaying);
  }

  /** Resets scores and boards, game enters in ColdWar phase */
  newGame(): void {
    // RESET BOARDS AND SCORES OF ALL PLAYERS
    this.users.forEach((user) => {
      user.board.reset();
      if (user.playerType === PlayerType.Computer) {
        (user.player as ComputerPlayer).reset();
        this.createComputerPlayerShips(user);
      } else {
        user.player.reset();
      }
    });

    // CHANGE PHASE TO NotPlaying
    this.changeGamePhase(GamePhase.NotPlaying);
  }

  private changeGamePhase(phase: GamePhase) {
    this.gamePhase = phase;
    this.gamePhase$.next(phase);
  }

  private playersHaveAllShips(): boolean {
    let result = true;
    this.users.forEach((user) => {
      ShipType.ALL_SHIPS.forEach((shipType) => {
        if (!user.board.hasShip(shipType)) {
          result = false;
        }
      });
    });
    return result;
  }

  private changeCurrentPlayer() {
    if (typeof this.currentPlayerIndex === 'undefined') {
      // -1, so then it gets changed to 0
      this.currentPlayerIndex = -1;
    }

    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.users.length;
    this.currentPlayer$.next(this.users[this.currentPlayerIndex].player.id);
  }

  /** Informs about an attack that was made. */
  getAttackReport(): Observable<IAttackReport> {
    return this.attackReport$.asObservable();
  }

  /** The observable's value is the current player's ID. */
  getCurrentPlayer(): Observable<number> {
    return this.currentPlayer$.asObservable();
  }

  /** The observable's value is the ID of a player that just had lost. */
  getLoserPlayer(): Observable<number> {
    return this.loser$.asObservable();
  }

  /** The observable's value is the winner player's ID. */
  getWinner(): Observable<number> {
    return this.winner$.asObservable();
  }

  /** The observable's value is the last score of the game. */
  // getScore(): Observable<IGameScore> {}

  /** The observable's value is the current game phase. */
  getGamePhase(): Observable<GamePhase> {
    return this.gamePhase$.asObservable();
  }
}
