import { Component } from '@angular/core';
import { Coordinates, LandscapeType } from '../../../models/shape';
import { NgForOf } from '@angular/common';

interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  heroStar?: boolean;
}

const boardSize = 11;

function getRandomLandscapeType(): LandscapeType {
  const landscapeTypes = Object.values(LandscapeType);
  const randomIndex = Math.floor(Math.random() * landscapeTypes.length);

  return landscapeTypes[randomIndex];
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoardComponent {
  readonly boardTiles: BoardTile[] = [];

  constructor() {
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const tile: BoardTile = { position: { x, y } };

        if (Math.random() > 0.4) {
          tile.landscape = getRandomLandscapeType();
        }

        if (Math.random() > 0.8) {
          tile.destroyed = true;
        }

        if (Math.random() > 0.8) {
          tile.heroStar = true;
        }

        this.boardTiles.push(tile);
      }
    }
  }
}
