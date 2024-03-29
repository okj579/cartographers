import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { GameBoardComponent } from '../../components/game-board/game-board.component';
import { NextShapeComponent } from '../../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { GoalAreaComponent } from '../../components/goal-area/goal-area.component';
import { SeasonInfoComponent } from '../../components/season-info/season-info.component';
import { SeasonGoalsComponent } from '../../components/season-goals/season-goals.component';
import { CurrentGameState, CurrentPlayerGameState, GameState, Player } from '../../../models/game-state';
import {
  addMoveToGame,
  addPlayer,
  createNewGame,
  endSeason,
  findPlayerIndex,
  stateToCurrentState,
  updatePlayerState,
} from '../../../game-logic/game-state-functions';
import { GameSetupInfoComponent } from '../../components/game-setup-info/game-setup-info.component';
import { addGameToMyGames, getCurrentUserId, getUserName } from '../../data/util';
import { ApiService } from '../../api.service';
import { generateId } from '../../../utils/general-util';
import { Router } from '@angular/router';
import { GameViewComponent } from '../../components/game-view/game-view.component';
import { Route } from '../../data/routes';
import { AnyMove, isRegularMove } from '../../../models/move';
import { getPlacingMonsterEffect } from '../../../game-logic/monster-effects';

@Component({
  selector: 'app-game-page',
  standalone: true,
  templateUrl: './game.page.html',
  styleUrl: './game.page.scss',
  imports: [
    GameBoardComponent,
    NextShapeComponent,
    NgIf,
    GoalAreaComponent,
    SeasonInfoComponent,
    SeasonGoalsComponent,
    NgForOf,
    GameSetupInfoComponent,
    GameViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GameIdPage implements OnInit {
  @Input() gameId: string | undefined;

  readonly currentPlayerId: string = getCurrentUserId();
  playerToShowId: string = this.currentPlayerId;

  gameState: WritableSignal<GameState | undefined> = signal(undefined);

  get isOnlineGame(): boolean {
    return this.gameId !== 'new';
  }

  get currentGameState(): CurrentGameState | undefined {
    const gameState = this.gameState();
    if (!gameState) return;

    return stateToCurrentState(gameState, this.currentPlayerId);
  }

  isSyncing: WritableSignal<boolean> = signal(false);
  isAutoSync: WritableSignal<boolean> = signal(false);

  get allPlayers(): Player[] {
    return this.gameState()?.playerStates.map((playerState) => playerState.player) ?? [];
  }

  get playerState(): CurrentPlayerGameState | undefined {
    return this.currentGameState?.playerStates.find((playerState) => playerState.player.id === this.playerToShowId);
  }

  get currentPlayerState(): CurrentPlayerGameState | undefined {
    return this.currentGameState?.playerStates.find((playerState) => playerState.player.id === this.currentPlayerId);
  }

  getPlayerState(playerId: string): CurrentPlayerGameState | undefined {
    return this.currentGameState?.playerStates.find((playerState) => playerState.player.id === playerId);
  }

  getPlayerInfoString(playerId: string): string {
    const playerState = this.getPlayerState(playerId);
    if (!playerState || (this.currentPlayerState?.season && this.currentPlayerState.moveHistory.length <= playerState.moveHistory.length))
      return '';

    if (!playerState?.season) {
      const totalScore = playerState?.seasonScores.reduce((sum, score) => sum + score.totalScore, 0) ?? 0;
      return ` 🎖️${totalScore}`;
    }

    return ` ${playerState.season.emoji} ${playerState.playedSeasonCards.reduce((sum, card) => sum + card.timeValue, 0)}/${
      playerState.season.duration
    }`;
  }

  constructor(
    private _api: ApiService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
  ) {}

  ngOnInit() {
    if (this.isOnlineGame) {
      this.loadGame();
    } else {
      this.gameState.set(createNewGame());
    }
  }

  submitMove(move: AnyMove): void {
    const gameState = this.gameState();
    if (!gameState || !this.playerState?.cardToPlace || this.playerToShowId !== this.currentPlayerId) return;

    let newGameState = addMoveToGame(gameState, move, this.playerToShowId);

    const currentMonster = this.playerState.cardToPlace.monster;
    if (currentMonster && isRegularMove(move)) {
      const newCurrentGameState = stateToCurrentState(newGameState, this.currentPlayerId);
      const playerState = newCurrentGameState.playerStates.find((playerState) => playerState.player.id === this.playerToShowId);
      if (playerState) {
        const monsterMove = getPlacingMonsterEffect(playerState.boardState, currentMonster.type);
        if (monsterMove) {
          newGameState = addMoveToGame(newGameState, monsterMove, this.playerToShowId);
        }
      }
    }

    void this.triggerGameStateSync(newGameState);
  }

  endSeason(): void {
    const gameState = this.gameState();
    if (!gameState || !this.currentGameState) return;

    void this.triggerGameStateSync(endSeason(gameState, this.currentGameState, this.currentPlayerId));
  }

  async triggerGameStateSync(newGameState: GameState): Promise<void> {
    this.gameState.set(newGameState);

    if (this.isOnlineGame) {
      this.isAutoSync.set(true);
      await this.syncGame(newGameState);
      this.isAutoSync.set(false);
    }
  }

  async syncGame(gameState: GameState | undefined = this.gameState()): Promise<void> {
    if (!gameState) return;

    const currentPlayerState = gameState.playerStates[findPlayerIndex(gameState.playerStates, this.currentPlayerId)];
    if (!currentPlayerState) {
      console.error('Could not find current player state');
      return;
    }

    this.isSyncing.set(true);
    if (this.isOnlineGame && this.gameId) {
      this.gameState.set(await this._api.updateGame(this.gameId, currentPlayerState));
    } else {
      this.gameId = generateId();
      const onlineUserName = getUserName(true);
      const stateToPersist = updatePlayerState(gameState, {
        ...currentPlayerState,
        player: { id: this.currentPlayerId, name: onlineUserName },
      });
      this.gameState.set(await this._api.createGame(this.gameId, stateToPersist));
      addGameToMyGames(this.gameId);
      void this._router.navigate([Route.Game, this.gameId], { replaceUrl: true });
    }
    this.isSyncing.set(false);
    this._cdr.detectChanges(); // todo - why is this needed?
  }

  goHome(): void {
    void this._router.navigate(['']);
  }

  selectPlayerToShow(playerId: string): void {
    this.playerToShowId = playerId;
    this._cdr.detectChanges(); // todo - why is this needed?
  }

  loadGame(): void {
    const gameId = this.gameId ?? prompt(`Enter game id to load`);
    if (!gameId) return;

    void this._api.getGame(gameId).then((gameState) => {
      const currentPlayerIndex = findPlayerIndex(gameState.playerStates, this.currentPlayerId);
      if (currentPlayerIndex > -1) {
        this.gameState.set(gameState);
      } else {
        this.gameState.set(addPlayer(gameState));
      }

      this.gameId = gameId;
      addGameToMyGames(gameId);
    });
  }
}
