import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { GameBoardComponent } from '../../components/game-board/game-board.component';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';
import { NextShapeComponent } from '../../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { GoalAreaComponent } from '../../components/goal-area/goal-area.component';
import { SeasonInfoComponent } from '../../components/season-info/season-info.component';
import { SeasonGoalsComponent } from '../../components/season-goals/season-goals.component';
import { Coordinates } from '../../../models/simple-types';
import { CurrentGameState, CurrentPlayerGameState, GameState, TempPlayerGameState } from '../../../models/game-state';
import {
  addPlayer,
  createNewGame,
  endSeason,
  findPlayerIndex,
  getTempPlayerStateWithShape,
  startSeason,
  stateToCurrentState,
  updatePlayerState,
} from '../../../game-logic/game-state-functions';
import { GameSetupInfoComponent } from '../../components/game-setup-info/game-setup-info.component';
import { addGameToMyGames, getCurrentUserId } from '../../data/util';
import { ApiService } from '../../api.service';
import { generateId } from '../../../utils/general-util';
import { Router } from '@angular/router';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GameIdPage implements OnInit {
  @Input() gameId: string | undefined;

  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly currentPlayerId: string;

  set gameState(value: GameState) {
    this._gameState = value;
    this.currentGameState = stateToCurrentState(this._gameState, this.currentPlayerId);
    this.tempPlayerState = { ...this.currentPlayerState, hasConflict: false, conflictedCellIndices: [] };
  }

  get gameState(): GameState {
    return this._gameState;
  }

  private _gameState!: GameState;
  currentGameState!: CurrentGameState;
  tempPlayerState!: TempPlayerGameState;

  isStartOfGame: boolean = true;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  get isOnlineGame(): boolean {
    return this.gameId !== 'new';
  }

  get playerIndex(): number {
    return findPlayerIndex(this.currentGameState.playerStates, this.currentPlayerId);
  }

  get currentPlayerState(): CurrentPlayerGameState {
    return this.currentGameState.playerStates[this.playerIndex];
  }

  get totalEndScore(): number {
    return this.currentPlayerState.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  isSyncing: WritableSignal<boolean> = signal(false);
  isAutoSync: WritableSignal<boolean> = signal(false);

  private _gameIds: string[] = [];

  constructor(
    private _api: ApiService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
  ) {
    this.currentPlayerId = getCurrentUserId();
    this.gameState = createNewGame();
  }

  ngOnInit() {
    if (this.isOnlineGame) {
      this.loadGame();
    }
  }

  async syncGame(): Promise<void> {
    this.isSyncing.set(true);
    if (this.isOnlineGame && this.gameId) {
      this.gameState = await this._api.updateGame(this.gameId, this.currentPlayerState);
      this._cdr.markForCheck();
    } else {
      this.gameId = generateId();
      await this._api.createGame(this.gameId, this.gameState);
      addGameToMyGames(this.gameId);
      void this._router.navigate(['game', this.gameId], { replaceUrl: true });
    }
    this.isSyncing.set(false);
    this._cdr.detectChanges(); // todo - why is this needed?
  }

  goHome(): void {
    void this._router.navigate(['']);
  }

  loadGame(): void {
    const gameId = this.gameId ?? prompt(`Enter game id to load - available:\n ${this._gameIds.join('\n')}`);
    if (!gameId) return;

    void this._api.getGame(gameId).then((gameState) => {
      this.currentShapeToPlace = undefined;
      const currentPlayerIndex = findPlayerIndex(gameState.playerStates, this.currentPlayerId);
      if (currentPlayerIndex > -1) {
        this.gameState = gameState;
      } else {
        this.gameState = addPlayer(gameState);
      }

      this.isStartOfGame = this.currentPlayerState.currentSeasonIndex === 0 && this.currentPlayerState.currentCardIndex === -1;
      this.gameId = gameId;
      this._cdr.markForCheck();
      addGameToMyGames(gameId);
    });
  }

  startSeason(): void {
    this.gameState = startSeason(this.gameState, this.currentPlayerId);
    void this._syncGameIfApplicable();
  }

  endSeason(): void {
    this.gameState = endSeason(this.gameState, this.currentGameState, this.currentPlayerId);
    void this._syncGameIfApplicable();
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.tempPlayerState.hasConflict) return;

    this.updateShapeInBoard(shape);
    this.gameState = updatePlayerState(this.gameState, {
      ...this.tempPlayerState,
      currentCardIndex: this.currentPlayerState.currentCardIndex + 1,
    });

    this.currentShapeToPlace = undefined;
    void this._syncGameIfApplicable();
  }

  onPositionChange(position: Coordinates): void {
    if (!this.currentShapeToPlace) return;

    this.nextShapeComponent.updatePositionFromOutside(position);
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined) {
    if (shape) {
      this.currentShapeToPlace = shape;
      this.tempPlayerState = getTempPlayerStateWithShape(this.gameState, shape, this.currentPlayerId);
    }
  }

  private async _syncGameIfApplicable(): Promise<void> {
    if (this.isOnlineGame) {
      this.isAutoSync.set(true);
      await this.syncGame();
      this.isAutoSync.set(false);
      this._cdr.detectChanges(); // todo - why is this needed?
    }
  }
}
