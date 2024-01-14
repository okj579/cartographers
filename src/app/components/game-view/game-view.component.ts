import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GameBoardComponent } from '../game-board/game-board.component';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';
import { NextShapeComponent } from '../next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { GoalAreaComponent } from '../goal-area/goal-area.component';
import { SeasonInfoComponent } from '../season-info/season-info.component';
import { SeasonGoalsComponent } from '../season-goals/season-goals.component';
import { Coordinates } from '../../../models/simple-types';
import { CurrentGameState, CurrentPlayerGameState, GameState, TempPlayerGameState } from '../../../models/game-state';
import {
  endSeason,
  findPlayerIndex,
  getTempPlayerStateWithShape,
  startSeason,
  stateToCurrentState,
  updatePlayerState,
} from '../../../game-logic/game-state-functions';
import { GameSetupInfoComponent } from '../game-setup-info/game-setup-info.component';
import { getCurrentUserId } from '../../data/util';

@Component({
  selector: 'app-game-view',
  standalone: true,
  templateUrl: './game-view.component.html',
  styleUrl: './game-view.component.scss',
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
export class GameViewComponent {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly currentPlayerId: string;

  @Output() gameStateChange = new EventEmitter<GameState>();

  @Input({ required: true })
  set gameState(value: GameState) {
    this._gameState = value;
    this.currentGameState = stateToCurrentState(this._gameState, this.currentPlayerId);
    this.isStartOfGame = this.currentPlayerState.currentSeasonIndex === 0 && this.currentPlayerState.currentCardIndex === -1;

    if (this.currentShapeToPlace) {
      this.updateShapeInBoard(this.currentShapeToPlace);
    } else {
      this.tempPlayerState = { ...this.currentPlayerState, hasConflict: false, conflictedCellIndices: [] };
    }
  }

  get gameState(): GameState {
    return this._gameState;
  }

  private _gameState!: GameState;
  currentGameState!: CurrentGameState;
  tempPlayerState!: TempPlayerGameState;

  isStartOfGame: boolean = true;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  get playerIndex(): number {
    return findPlayerIndex(this.currentGameState.playerStates, this.currentPlayerId);
  }

  get currentPlayerState(): CurrentPlayerGameState {
    return this.currentGameState.playerStates[this.playerIndex];
  }

  get totalEndScore(): number {
    return this.currentPlayerState.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  constructor(private _cdr: ChangeDetectorRef) {
    this.currentPlayerId = getCurrentUserId();
  }

  startSeason(): void {
    const newGameState = startSeason(this.gameState, this.currentPlayerId);
    this.gameStateChange.emit(newGameState);
  }

  endSeason(): void {
    const newGameState = endSeason(this.gameState, this.currentGameState, this.currentPlayerId);
    this.gameStateChange.emit(newGameState);
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.tempPlayerState.hasConflict) return;

    this.updateShapeInBoard(shape);
    const newGameState = updatePlayerState(this.gameState, {
      ...this.tempPlayerState,
      currentCardIndex: this.currentPlayerState.currentCardIndex + 1,
    });

    this.gameStateChange.emit(newGameState);
    this.currentShapeToPlace = undefined;
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
}
