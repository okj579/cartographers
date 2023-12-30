import { Component, Input } from '@angular/core';
import { BoardTileComponent } from './board-tile.component';
import { NgForOf } from '@angular/common';
import { BoardTile } from '../../../models/board-tile';
import { LandscapeType } from '../../../models/landscape-type';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';

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

    for (let cell of shape.baseShape.filledCells) {
      const isHeroShape = shape.type === LandscapeType.HERO;
      const isHeroPosition = isHeroShape && shape.heroPosition && cell.x === shape.heroPosition.x && cell.y === shape.heroPosition.y;
      const isHeroStar = isHeroShape && !isHeroPosition;

      boardTiles.push({
        position: { x: position.x + cell.x, y: position.y + cell.y },
        landscape: isHeroStar ? undefined : shape.type,
        heroStar: isHeroStar,
      });
    }

    return boardTiles;
  }
}
