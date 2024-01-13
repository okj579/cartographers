import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
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
import { GameSetupInfoComponent } from '../components/game-setup-info/game-setup-info.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
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
export default class HomeComponent {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly playerIndex: number = 0;

  set gameState(value: GameState) {
    this._gameState = value;
    this.currentGameState = stateToCurrentState(this._gameState);
    this.tempPlayerState = { ...this.currentPlayerState, hasConflict: false, conflictedCellIndices: [] };
  }

  get gameState(): GameState {
    return this._gameState;
  }

  private _gameState: GameState = createNewGame();
  currentGameState: CurrentGameState = stateToCurrentState(this._gameState);
  tempPlayerState: TempPlayerGameState = { ...this.currentPlayerState, hasConflict: false, conflictedCellIndices: [] };

  isStartOfGame: boolean = true;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  get currentPlayerState(): CurrentPlayerGameState {
    return this.currentGameState.playerStates[this.playerIndex];
  }

  get totalEndScore(): number {
    return this.currentPlayerState.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  startSeason(): void {
    this.gameState = startSeason(this.gameState);
  }

  endSeason(): void {
    this.gameState = endSeason(this.gameState, this.currentGameState);
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.tempPlayerState.hasConflict) return;

    this.updateShapeInBoard(shape);
    this.gameState = updatePlayerState(this.gameState, {
      ...this.tempPlayerState,
      currentCardIndex: this.currentPlayerState.currentCardIndex + 1,
    });

    this.currentShapeToPlace = undefined;
  }

  onPositionChange(position: Coordinates): void {
    if (!this.currentShapeToPlace) return;

    this.nextShapeComponent.updatePositionFromOutside(position);
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined) {
    if (shape) {
      this.currentShapeToPlace = shape;
      this.tempPlayerState = getTempPlayerStateWithShape(this.gameState, shape);
    }
  }
}
