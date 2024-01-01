import { Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { getShuffledCards, tryPlaceShapeOnBoard } from '../../game-logic/functions';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgIf } from '@angular/common';
import { LandscapeCard } from '../../models/landscape-card';
import { GoalAreaComponent } from '../components/goal-area/goal-area.component';
import { Goal, GOALS } from '../../models/goals';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [GameBoardComponent, NextShapeComponent, NgIf, GoalAreaComponent],
})
export default class HomeComponent {
  untouchedBoardState: BoardTile[][] = getInitialBoardTiles();
  currentBoardState: BoardTile[][] = [...this.untouchedBoardState];
  cardDeck: LandscapeCard[] = getShuffledCards();
  goals: Goal[] = GOALS;

  hasConflict: boolean = false;

  protected currentCardIndex: number = 0;

  get currentCard(): LandscapeCard | undefined {
    return this.cardDeck[this.currentCardIndex];
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.hasConflict) return;

    this.updateShapeInBoard(shape, false);
    this.untouchedBoardState = this.currentBoardState;
    this.currentCardIndex++;
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined, isTemporary: boolean) {
    if (shape) {
      const placeResult = tryPlaceShapeOnBoard(this.untouchedBoardState, shape, isTemporary);
      this.currentBoardState = placeResult.updatedBoard;
      this.hasConflict = placeResult.hasConflict;
    }
  }
}
