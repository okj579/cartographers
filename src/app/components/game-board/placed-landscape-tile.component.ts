import { Component, Input } from '@angular/core';
import { coordinateContainsBit, LandscapeType, PlacedLandscapeShape, SHAPE_SIZE } from '../../../models/shape';
import { BoardTile, BoardTileComponent } from './board-tile.component';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-placed-landscape-tile',
  standalone: true,
  imports: [BoardTileComponent, NgForOf],
  template: `<app-board-tile *ngFor="let tile of boardTiles" [tile]="tile" />`,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class PlacedLandscapeTileComponent {
  @Input() set placedShape(shape: PlacedLandscapeShape) {
    this.boardTiles = this._shapeToBoardTiles(shape);
  }

  boardTiles: BoardTile[] = [];

  private _shapeToBoardTiles(shape: PlacedLandscapeShape): BoardTile[] {
    const boardTiles: BoardTile[] = [];
    const position = shape.position;

    for (let x = 0; x < SHAPE_SIZE; x++) {
      for (let y = 0; y < SHAPE_SIZE; y++) {
        if (coordinateContainsBit(shape.shapeBitMap, { x, y })) {
          const isHeroShape = shape.type === LandscapeType.HERO;
          const isHeroPosition = isHeroShape && shape.heroPosition && x === shape.heroPosition.x && y === shape.heroPosition.y;
          const isHeroStar = isHeroShape && !isHeroPosition;

          boardTiles.push({
            position: { x: position.x + x, y: position.y + y },
            landscape: isHeroStar ? undefined : shape.type,
            heroStar: isHeroStar,
          });
        }
      }
    }

    return boardTiles;
  }
}
