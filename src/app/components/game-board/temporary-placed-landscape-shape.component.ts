import { Component, Input, OnChanges } from '@angular/core';
import { BoardTileComponent } from './board-tile.component';
import { NgForOf } from '@angular/common';
import { BoardTile } from '../../../models/board-tile';
import { LandscapeType } from '../../../models/landscape-type';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';
import { Coordinates, Direction, getNeighborCoordinates, includesCoordinates } from '../../../models/simple-types';
import { isOutOfBoard } from '../../../game-logic/functions';

interface TemporaryBoardTile extends BoardTile {
  isOutOfBounds: boolean;
  positionWithinBaseShape: Coordinates;
}

@Component({
  selector: 'app-temporary-placed-landscape-shape',
  standalone: true,
  imports: [BoardTileComponent, NgForOf],
  template: ` <app-board-tile
    *ngFor="let tile of boardTiles; trackBy: trackByIndexAndShapeSize"
    [tile]="tile"
    [class.base]="false"
    [class.sibling-is-outside]="hasOutOfBoardTiles"
    [class.is-outside]="tile.isOutOfBounds"
    [class.has-neighbor-top]="isSameAreaAsNeighbor('top', tile)"
    [class.has-neighbor-right]="isSameAreaAsNeighbor('right', tile)"
    [class.has-neighbor-bottom]="isSameAreaAsNeighbor('bottom', tile)"
    [class.has-neighbor-left]="isSameAreaAsNeighbor('left', tile)"
  />`,
  styleUrl: './temporary-placed-landscape-shape.component.scss',
})
export class TemporaryPlacedLandscapeShapeComponent implements OnChanges {
  @Input({ required: true }) placedShape!: PlacedLandscapeShape;
  @Input() conflictedCellIndices: number[] = [];

  boardTiles: TemporaryBoardTile[] = [];
  hasOutOfBoardTiles: boolean = false;

  trackByIndexAndShapeSize = (index: number): number => {
    return index + 10 * this.boardTiles.length + (this.hasOutOfBoardTiles ? 100 : 0);
  };

  ngOnChanges() {
    this.boardTiles = this._shapeToBoardTiles(this.placedShape);
    this.hasOutOfBoardTiles = this.boardTiles.some((tile) => tile.isOutOfBounds && !tile.heroStar);
  }

  isSameAreaAsNeighbor(direction: Direction, tile: TemporaryBoardTile): boolean {
    const neighborCoordinates = getNeighborCoordinates(direction, tile.positionWithinBaseShape);

    return includesCoordinates(neighborCoordinates, this.placedShape.baseShape.filledCells);
  }

  private _shapeToBoardTiles(shape: PlacedLandscapeShape): TemporaryBoardTile[] {
    const boardTiles: TemporaryBoardTile[] = [];
    const position = shape.position;

    for (let i = 0; i < shape.baseShape.filledCells.length; i++) {
      let cell = shape.baseShape.filledCells[i];
      const isHeroShape = shape.type === LandscapeType.HERO;
      const isHeroPosition = isHeroShape && shape.heroPosition && cell.x === shape.heroPosition.x && cell.y === shape.heroPosition.y;
      const isHeroStar = isHeroShape && !isHeroPosition;

      const tilePosition: Coordinates = { x: position.x + cell.x, y: position.y + cell.y };
      let isOutOfBounds = isOutOfBoard(tilePosition);

      boardTiles.push({
        position: tilePosition,
        positionWithinBaseShape: cell,
        landscape: isHeroStar ? undefined : shape.type,
        heroStar: isHeroStar,
        monsterType: shape.monsterType,
        conflicted: this.conflictedCellIndices.includes(i),
        isOutOfBounds,
      });
    }

    return boardTiles;
  }
}
