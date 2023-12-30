import { Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { MOCK_PLACED_SHAPES } from '../../mock-data/mock-data';
import { tryPlaceShapeOnBoard } from '../../game-logic/functions';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h2>Cartographers</h2>

    <app-game-board [currentBoardState]="currentBoardState" />

    <button (click)="increment()">Mock next state</button>
  `,
  styles: [
    `
      app-game-board {
        margin: 32px auto;
      }
    `,
  ],
  imports: [GameBoardComponent],
})
export default class HomeComponent {
  currentBoardState: BoardTile[][] = getInitialBoardTiles();

  mockShapes: PlacedLandscapeShape[] = [...MOCK_PLACED_SHAPES];

  increment() {
    this.currentBoardState = tryPlaceShapeOnBoard(this.currentBoardState, this.mockShapes.shift()).updatedBoard;
  }
}
