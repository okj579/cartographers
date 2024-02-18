import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { TemporaryPlacedLandscapeShapeComponent } from './temporary-placed-landscape-shape.component';
import { BoardTile, tilesToCoordinates } from '../../../models/board-tile';
import { getShapeDimensions, LandscapeShape, PlacedLandscapeShape } from '../../../models/landscape-shape';
import { Coordinates, Direction, getNeighborCoordinates, includesCoordinates } from '../../../models/simple-types';
import { BOARD_SIZE } from '../../../game-logic/constants';
import { IndexToCharPipe } from '../goal-area/index-to-char.pipe';
import { doesScoreIndicatorAppearInScoreInfos, Goal, GoalCategory, ScoreIndicator, ScoreInfo } from '../../../models/goals';
import { ScoreTileComponent } from './score-tile/score-tile.component';
import { LandscapeType } from '../../../models/landscape-type';
import { getStillRelevantGoalIndices, Season } from '../../../models/season';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, TemporaryPlacedLandscapeShapeComponent, NgIf, IndexToCharPipe, ScoreTileComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  @Input() currentBoardState: BoardTile[][] = [];
  @Input() nextBoardState: BoardTile[][] = [];
  @Input() currentShapeToPlace: PlacedLandscapeShape | undefined;
  @Input() conflictedCellIndices: number[] = [];
  @Input() scoreInfos: ScoreInfo[] = [];
  @Input() nextScoreInfos: ScoreInfo[] = [];
  @Input() goals: Goal[] = [];
  @Input() season: Season | undefined;
  @Input() specialHighlightGoal: Goal | undefined;

  @HostBinding('class.is-end-of-season')
  @Input()
  isEndOfSeason: boolean = false;

  @HostBinding('class.is-end-of-game')
  @Input()
  isEndOfGame: boolean = false;

  @Output() positionChange: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();

  protected readonly BOARD_SIZE = BOARD_SIZE;

  @HostBinding('class.has-highlighted-goal')
  get hasSpecialHighlightGoal(): boolean {
    return !!this.specialHighlightGoal;
  }

  @HostBinding('class.has-highlighted-coin-goal')
  get hasHighlightedCoinGoal(): boolean {
    return !!this.specialHighlightGoal ? this.specialHighlightGoal.category === GoalCategory.COIN : this.isEndOfSeason;
  }

  get allowPlacing(): boolean {
    return this.currentShapeToPlace !== undefined;
  }

  get scoredTiles(): BoardTile[] {
    return this.scoreInfos.filter((scoreInfo) => this.isScoreRelevant(scoreInfo)).flatMap((scoreInfo) => scoreInfo.scoredTiles);
  }

  get scoreRelatedTiles(): BoardTile[] {
    return this.scoreInfos.filter((scoreInfo) => this.isScoreRelevant(scoreInfo)).flatMap((scoreInfo) => scoreInfo.relatedTiles ?? []);
  }

  willCoinBeRemoved(tile: BoardTile): boolean {
    return !!tile.hasCoin && (this.nextBoardState[tile.position.x]?.[tile.position.y]?.wasScoreCoin ?? false);
  }

  isNewScore(scoreInfo: ScoreInfo, scoreIndicator: ScoreIndicator) {
    return !doesScoreIndicatorAppearInScoreInfos(this.scoreInfos, scoreInfo, scoreIndicator);
  }

  isRemovedScore(scoreInfo: ScoreInfo, scoreIndicator: ScoreIndicator) {
    return !doesScoreIndicatorAppearInScoreInfos(this.nextScoreInfos, scoreInfo, scoreIndicator);
  }

  isScoreRelevant(scoreInfo: ScoreInfo): boolean {
    if (!!this.specialHighlightGoal) {
      return scoreInfo.goalCategory === this.specialHighlightGoal.category;
    }

    const goalIndex = this.goals.findIndex((goal) => goal.category === scoreInfo.goalCategory);

    return !this.season || this.season.goalIndices.includes(goalIndex);
  }

  isScoreIrrelevant(scoreInfo: ScoreInfo): boolean {
    if ((!!this.specialHighlightGoal && scoreInfo.goalCategory === this.specialHighlightGoal.category) || !this.season) {
      return false;
    }

    const goalIndex = this.goals.findIndex((goal) => goal.category === scoreInfo.goalCategory);
    const relevantGoalIndices = getStillRelevantGoalIndices(this.season);

    return !relevantGoalIndices.includes(goalIndex);
  }

  isScoredTile(tile: BoardTile): boolean {
    return includesCoordinates(tile.position, tilesToCoordinates(this.scoredTiles));
  }

  isScoreRelatedTile(tile: BoardTile): boolean {
    return includesCoordinates(tile.position, tilesToCoordinates(this.scoreRelatedTiles));
  }

  isDefeatedMonster(tile: BoardTile): boolean {
    return tile.landscape === LandscapeType.MONSTER && !this._isMonsterRelevantForScore(tile);
  }

  shouldAddHighlightBorder(tile: BoardTile): boolean {
    return this.isScoredTile(tile) && this._isEmptyTileRelevantForAreaScore(tile);
  }

  trackByIndex(index: number): number {
    return index;
  }

  isSameAreaAsNeighbor(direction: Direction, tile: BoardTile): boolean {
    if (!tile.landscape || tile.destroyed) return false;

    const neighbor = this._getNeighbor(direction, tile.position);

    if (!neighbor || neighbor.destroyed) return false;

    return neighbor.landscape === tile.landscape && neighbor.monsterType === tile.monsterType;
  }

  onTileClick(x: number, y: number): void {
    if (!this.allowPlacing || !this.currentShapeToPlace) return;

    const targetPosition = this._getTargetPositionWithinBaseShape(this.currentShapeToPlace);
    const targetX = x - targetPosition.x;
    const targetY = y - targetPosition.y;

    const shapeDimensions = getShapeDimensions(this.currentShapeToPlace);

    const diffXToNotOverflow = Math.min(0, BOARD_SIZE - shapeDimensions.width - targetX);
    const diffYToNotOverflow = Math.min(0, BOARD_SIZE - shapeDimensions.height - targetY);

    const minVal = !!this.currentShapeToPlace.heroPosition ? -7 : 0;

    const xToPlace = Math.max(minVal, targetX + diffXToNotOverflow);
    const yToPlace = Math.max(minVal, targetY + diffYToNotOverflow);

    this.positionChange.emit({ x: xToPlace, y: yToPlace });
  }

  private _getTargetPositionWithinBaseShape(shape: LandscapeShape): Coordinates {
    if (shape.heroPosition) return shape.heroPosition;

    const baseShape = shape.baseShape;

    for (let x = 0; x < baseShape.width; x++) {
      for (let y = 0; y < baseShape.height; y++) {
        if (includesCoordinates({ x, y }, baseShape.filledCells)) {
          return { x, y };
        }
      }
    }

    return { x: 0, y: 0 };
  }

  private _getNeighbor(direction: Direction, position: Coordinates): BoardTile | undefined {
    const neighborCoordinates = getNeighborCoordinates(direction, position);

    return this.currentBoardState[neighborCoordinates.x]?.[neighborCoordinates.y];
  }

  private _isMonsterRelevantForScore(tile: BoardTile): boolean {
    const monsterTiles = this.scoreInfos
      .filter((scoreInfo) => scoreInfo.goalCategory === GoalCategory.MONSTER)
      .flatMap((scoreInfo) => scoreInfo.relatedTiles ?? []);
    return includesCoordinates(tile.position, tilesToCoordinates(monsterTiles));
  }

  private _isEmptyTileRelevantForAreaScore(tile: BoardTile): boolean {
    return (
      tile.landscape === undefined &&
      this.scoreInfos
        .filter((scoreInfo) => this.isScoreRelevant(scoreInfo))
        .some(
          (scoreInfo) =>
            scoreInfo.goalCategory === GoalCategory.GLOBAL &&
            includesCoordinates(tile.position, tilesToCoordinates(scoreInfo.scoredTiles ?? [])),
        )
    );
  }
}
