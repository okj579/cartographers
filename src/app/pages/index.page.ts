import { Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { LandscapeShape, PlacedLandscapeShape } from '../../models/landscape-shape';
import { MOCK_PLACED_SHAPES } from '../../mock-data/mock-data';
import { tryPlaceShapeOnBoard } from '../../game-logic/functions';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [GameBoardComponent, NextShapeComponent, NgIf],
})
export default class HomeComponent {
  currentBoardState: BoardTile[][] = getInitialBoardTiles();
  nextLandscapeShape: LandscapeShape | undefined;

  mockShapes: PlacedLandscapeShape[] = [...MOCK_PLACED_SHAPES];

  increment() {
    if (this.nextLandscapeShape) {
      const placeResult = tryPlaceShapeOnBoard(this.currentBoardState, this.nextLandscapeShape as PlacedLandscapeShape);
      this.currentBoardState = placeResult.updatedBoard;

      if (placeResult.hasConflict) {
        console.warn('conflict!');
      }
    }

    this.nextLandscapeShape = this.mockShapes.shift();
  }
}
