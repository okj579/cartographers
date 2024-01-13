import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { getCurrentTimeProgress } from '../../game-logic/functions';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { LandscapeCard } from '../../models/landscape-card';
import { GoalAreaComponent } from '../components/goal-area/goal-area.component';
import { SeasonInfoComponent } from '../components/season-info/season-info.component';
import { SeasonGoalsComponent } from '../components/season-goals/season-goals.component';
import { Coordinates } from '../../models/simple-types';
import { CurrentGameState, CurrentPlayerGameState, GameState, TempPlayerGameState } from '../../models/game-state';
import {
  createNewGame,
  endSeason,
  getTempPlayerStateWithShape,
  startSeason,
  stateToCurrentState,
  updatePlayerState,
} from '../../game-logic/game-state-functions';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [GameBoardComponent, NextShapeComponent, NgIf, GoalAreaComponent, SeasonInfoComponent, SeasonGoalsComponent, NgForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly playerIndex: number = 0;

  get gameState(): GameState {
    return this._gameState;
  }

  set gameState(value: GameState) {
    this._gameState = value;
    this.currentGameState = stateToCurrentState(this._gameState);
  }

  private _gameState: GameState = createNewGame();
  currentGameState: CurrentGameState = stateToCurrentState(this._gameState);
  tempPlayerState: TempPlayerGameState = { ...this.currentPlayerState, hasConflict: false, conflictedCellIndices: [] };

  newCoins: number = 0;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  protected isEndOfSeason: boolean = false;

  get currentPlayerState(): CurrentPlayerGameState {
    return this.currentGameState.playerStates[this.playerIndex];
  }

  get isStartOfSeason(): boolean {
    return this.currentPlayerState.currentCardIndex === -1 && !!this.currentGameState.season;
  }

  get playedCards(): LandscapeCard[] {
    return this.currentGameState.cardDeck.slice(0, this.currentPlayerState.currentCardIndex + 1);
  }

  get totalEndScore(): number {
    return this.currentPlayerState.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  startSeason(): void {
    this.gameState = startSeason(this.gameState);
  }

  endSeason(): void {
    this.gameState = endSeason(this.gameState);
    this.isEndOfSeason = false;
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.tempPlayerState.hasConflict) return;

    this.updateShapeInBoard(shape);
    this.gameState = updatePlayerState(this.gameState, this.tempPlayerState);

    this.currentShapeToPlace = undefined;
    this.newCoins = 0;

    this._handleSeasonEndIfApplicable();
  }

  onPositionChange(position: Coordinates): void {
    if (!this.currentShapeToPlace) return;

    this.nextShapeComponent.updatePositionFromOutside(position);
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined) {
    if (shape) {
      this.currentShapeToPlace = shape;

      this.tempPlayerState = getTempPlayerStateWithShape(this.gameState, shape);
      this.newCoins = this.tempPlayerState.coins - this.currentPlayerState.coins;
    }
  }

  private _handleSeasonEndIfApplicable(): void {
    if (this.currentGameState.season && getCurrentTimeProgress(this.playedCards) < this.currentGameState.season.duration) {
      this.gameState = updatePlayerState(this.gameState, {
        ...this.currentPlayerState,
        currentCardIndex: this.currentPlayerState.currentCardIndex + 1,
      });
      return;
    }

    this.isEndOfSeason = true;
  }
}
