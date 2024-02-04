import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  findPlayerIndex,
  getPlacedShapeFromMove,
  getTempPlayerStateWithShape,
  stateToCurrentState,
} from '../../../game-logic/game-state-functions';
import { GameSetupInfoComponent } from '../game-setup-info/game-setup-info.component';
import { getCurrentUserId } from '../../data/util';
import { AnyMove, initialMove, Move } from '../../../models/move';
import { ExampleBoardComponent } from '../example-board/example-board.component';

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
    ExampleBoardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameViewComponent implements OnChanges {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly currentPlayerId: string = getCurrentUserId();

  @Output() endSeason = new EventEmitter<void>();
  @Output() submitMove = new EventEmitter<AnyMove>();
  @Output() backToMyGame = new EventEmitter<void>();

  @Input() playerIdToShow: string = this.currentPlayerId;

  @Input({ required: true })
  gameState!: GameState;

  currentGameState?: CurrentGameState;
  tempPlayerState?: TempPlayerGameState;

  isStartOfGame: boolean = true;
  isStartOfSeason: boolean = true;

  currentMove: Move | undefined;

  get currentShapeToPlace(): PlacedLandscapeShape | undefined {
    if (!this.currentMove || !this.playerState?.cardToPlace || !this.isCurrentPlayer) return undefined;

    return getPlacedShapeFromMove(this.currentMove, this.playerState.cardToPlace);
  }

  get isCurrentPlayer(): boolean {
    return this.playerIdToShow === this.currentPlayerId;
  }

  get showCurrentShape(): boolean {
    return this.isCurrentPlayer && !!this.currentShapeToPlace && !this.isStartOfSeason;
  }

  get playerIndex(): number {
    return findPlayerIndex(this.currentGameState?.playerStates ?? [], this.playerIdToShow);
  }

  get playerState(): CurrentPlayerGameState | undefined {
    return this.currentGameState?.playerStates[this.playerIndex];
  }

  get visiblePlayerState(): TempPlayerGameState | undefined {
    if (!this.playerState) return undefined;

    return this.isStartOfSeason || !this.tempPlayerState || this.playerState.isEndOfGame
      ? { ...this.playerState, conflictedCellIndices: [], hasConflict: false, newMinedMountainTiles: [] }
      : this.tempPlayerState;
  }

  get totalEndScore(): number {
    return this.playerState?.seasonScores.reduce((sum, score) => sum + score.totalScore, 0) ?? 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameState']) {
      this.currentGameState = stateToCurrentState(this.gameState, this.currentPlayerId);
      this.isStartOfGame = this.playerState?.moveHistory.length === 0;
      this.isStartOfSeason = this.playerState?.isStartOfSeason ?? true;
      this.currentMove = { ...initialMove };
    }

    if (this.currentShapeToPlace && this.isCurrentPlayer) {
      this.updateShapeInBoard(this.currentShapeToPlace);
    }
  }

  startSeason(): void {
    this.isStartOfSeason = false;
  }

  submitShape(): void {
    if (!this.tempPlayerState || this.tempPlayerState.hasConflict || !this.currentMove) return;

    this.submitMove.emit(this.currentMove);
    this.currentMove = undefined;
  }

  onPositionChange(position: Coordinates): void {
    if (!this.currentMove) return;

    this.currentMove = { ...this.currentMove, position };
    this.updateShapeInBoard(this.currentShapeToPlace);
  }

  onMoveChange(move: Move): void {
    this.currentMove = move;
    this.updateShapeInBoard(this.currentShapeToPlace);
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined) {
    if (shape && this.playerState) {
      this.tempPlayerState = getTempPlayerStateWithShape(this.gameState, this.playerState, shape);
    }
  }
}
