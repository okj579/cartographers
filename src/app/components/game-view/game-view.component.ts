import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
export class GameViewComponent implements OnChanges {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  readonly currentPlayerId: string = getCurrentUserId();

  @Output() gameStateChange = new EventEmitter<GameState>();
  @Output() backToMyGame = new EventEmitter<void>();

  @Input() playerIdToShow: string = this.currentPlayerId;

  @Input({ required: true })
  gameState!: GameState;

  currentGameState!: CurrentGameState;
  tempPlayerState!: TempPlayerGameState;

  isStartOfGame: boolean = true;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  get isCurrentPlayer(): boolean {
    return this.playerIdToShow === this.currentPlayerId;
  }

  get playerIndex(): number {
    return findPlayerIndex(this.currentGameState.playerStates, this.playerIdToShow);
  }

  get playerState(): CurrentPlayerGameState {
    return this.currentGameState.playerStates[this.playerIndex];
  }

  get totalEndScore(): number {
    return this.playerState.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playerIdToShow'] || changes['gameState']) {
      this._calculateCurrentGameState();
    }
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
      currentCardIndex: this.playerState.currentCardIndex + 1,
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

  private _calculateCurrentGameState(): void {
    this.currentGameState = stateToCurrentState(this.gameState, this.playerIdToShow);
    this.isStartOfGame = this.playerState.currentSeasonIndex === 0 && this.playerState.currentCardIndex === -1;

    if (this.currentShapeToPlace && this.isCurrentPlayer) {
      this.updateShapeInBoard(this.currentShapeToPlace);
    } else {
      this.tempPlayerState = { ...this.playerState, hasConflict: false, conflictedCellIndices: [] };
    }
  }
}
