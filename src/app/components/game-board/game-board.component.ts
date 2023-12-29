import { Component, Input } from '@angular/core';
import { LandscapeType, PlacedLandscapeShape, ShapeBitMap } from '../../../models/shape';
import { NgForOf } from '@angular/common';
import { BoardTile, BoardTileComponent } from './board-tile.component';
import { PlacedLandscapeTileComponent } from './placed-landscape-tile.component';
import { MOCK_DESTROYED_TILES, MOCK_PLACED_SHAPES } from '../../../mock-data/mock-data';

const boardSize = 11;

function getRandomLandscapeType(): LandscapeType {
  const landscapeTypes = Object.values(LandscapeType);
  const randomIndex = Math.floor(Math.random() * landscapeTypes.length);

  return landscapeTypes[randomIndex];
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, PlacedLandscapeTileComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  @Input() placedShapes: PlacedLandscapeShape[] = MOCK_PLACED_SHAPES;
  @Input() destroyedTiles: BoardTile[] = MOCK_DESTROYED_TILES;

  readonly baseTiles: BoardTile[] = [];
  readonly mountainTiles: BoardTile[] = [
    { position: { x: 1, y: 1 }, landscape: LandscapeType.MOUNTAIN },
    { position: { x: 3, y: 5 }, landscape: LandscapeType.MOUNTAIN },
    { position: { x: 5, y: 9 }, landscape: LandscapeType.MOUNTAIN },
    { position: { x: 8, y: 3 }, landscape: LandscapeType.MOUNTAIN },
    { position: { x: 9, y: 8 }, landscape: LandscapeType.MOUNTAIN },
  ];

  get allTiles(): BoardTile[] {
    return [...this.baseTiles, ...this.mountainTiles, ...this.destroyedTiles];
  }

  constructor() {
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const tile: BoardTile = { position: { x, y }, isBase: true };
        this.baseTiles.push(tile);
      }
    }
  }
}
