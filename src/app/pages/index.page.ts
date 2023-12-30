import { Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
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
  untouchedBoardState: BoardTile[][] = getInitialBoardTiles();
  currentBoardState: BoardTile[][] = [...this.untouchedBoardState];
  nextLandscapeShape: PlacedLandscapeShape | undefined;

  hasConflict: boolean = false;

  mockShapes: PlacedLandscapeShape[] = [...MOCK_PLACED_SHAPES];

  constructor() {
    this.onNextShapeChange(this.mockShapes.shift());
  }

  onNextShapeChange(shape: PlacedLandscapeShape | undefined): void {
    this.nextLandscapeShape = shape;
    this.updateShapeInBoard(true);
  }

  submitShape() {
    this.updateShapeInBoard(false);
    this.untouchedBoardState = this.currentBoardState;
    this.onNextShapeChange(this.mockShapes.shift());
  }

  updateShapeInBoard(isTemporary: boolean) {
    if (this.nextLandscapeShape) {
      const placeResult = tryPlaceShapeOnBoard(this.untouchedBoardState, this.nextLandscapeShape as PlacedLandscapeShape, isTemporary);
      this.currentBoardState = placeResult.updatedBoard;
      this.hasConflict = placeResult.hasConflict;
    }
  }
}
