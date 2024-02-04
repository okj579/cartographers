import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { TemporaryPlacedLandscapeShapeComponent } from './temporary-placed-landscape-shape.component';
import { BoardTile, tilesToCoordinates } from '../../../models/board-tile';
import { getShapeDimensions, LandscapeShape, PlacedLandscapeShape } from '../../../models/landscape-shape';
import { Coordinates, Direction, getNeighborCoordinates, includesCoordinates } from '../../../models/simple-types';
import { BOARD_SIZE } from '../../../game-logic/constants';
import { IndexToCharPipe } from '../goal-area/index-to-char.pipe';
import { Goal, ScoreInfo } from '../../../models/goals';
import { ScoreTileComponent } from './score-tile/score-tile.component';
import { LandscapeType } from '../../../models/landscape-type';

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
  @Input() currentShapeToPlace: PlacedLandscapeShape | undefined;
  @Input() conflictedCellIndices: number[] = [];
  @Input() scoreInfos: ScoreInfo[] = [];
  @Input() seasonGoals: Goal[] = [];
  @Input() newMinedMonsterTiles: BoardTile[] = [];

  @HostBinding('class.is-end-of-season')
  @Input()
  isEndOfSeason: boolean = false;

  @Output() positionChange: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();

  protected readonly BOARD_SIZE = BOARD_SIZE;

  get allowPlacing(): boolean {
    return this.currentShapeToPlace !== undefined;
  }

  get scoreInfosWithScore(): ScoreInfo[] {
    return this.scoreInfos.filter((scoreInfo) => scoreInfo.scoreIndicatorPositions.length > 0);
  }

  get scoredTiles(): BoardTile[] {
    return this.scoreInfos.filter((scoreInfo) => this.isScoreRelevant(scoreInfo)).flatMap((scoreInfo) => scoreInfo.scoredTiles);
  }

  get scoreRelatedTiles(): BoardTile[] {
    return this.scoreInfos.filter((scoreInfo) => this.isScoreRelevant(scoreInfo)).flatMap((scoreInfo) => scoreInfo.relatedTiles ?? []);
  }

  willCoinBeRemoved(tile: BoardTile): boolean {
    return !!tile.hasCoin && includesCoordinates(tile.position, tilesToCoordinates(this.newMinedMonsterTiles));
  }

  isScoreRelevant(scoreInfo: ScoreInfo): boolean {
    return (
      scoreInfo.goalCategory === 'monster' ||
      !this.seasonGoals.length ||
      this.seasonGoals.some((goal) => goal.category === scoreInfo.goalCategory)
    );
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
      .filter((scoreInfo) => scoreInfo.goalCategory === 'monster')
      .flatMap((scoreInfo) => scoreInfo.relatedTiles ?? []);
    return includesCoordinates(tile.position, tilesToCoordinates(monsterTiles));
  }
}
