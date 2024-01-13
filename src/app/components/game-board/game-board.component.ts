import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { TemporaryPlacedLandscapeShapeComponent } from './temporary-placed-landscape-shape.component';
import { BoardTile } from '../../../models/board-tile';
import { getShapeDimensions, LandscapeShape, PlacedLandscapeShape } from '../../../models/landscape-shape';
import { Coordinates, Direction, getNeighborCoordinates, includesCoordinates } from '../../../models/simple-types';
import { BOARD_SIZE } from '../../../game-logic/constants';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, TemporaryPlacedLandscapeShapeComponent, NgIf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  @Input() currentBoardState: BoardTile[][] = [];
  @Input() currentShapeToPlace: PlacedLandscapeShape | undefined;
  @Input() conflictedCellIndices: number[] = [];

  @Output() positionChange: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();

  get allowPlacing(): boolean {
    return this.currentShapeToPlace !== undefined;
  }

  trackByIndex(index: number): number {
    return index;
  }

  isSameAreaAsNeighbor(direction: Direction, tile: BoardTile): boolean {
    if (!tile.landscape) return false;

    const { x, y } = tile.position;
    const neighbor = this._getNeighbor(direction, tile.position);

    if (!neighbor) return false;

    return neighbor.landscape === this.currentBoardState[x][y].landscape;
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
}
