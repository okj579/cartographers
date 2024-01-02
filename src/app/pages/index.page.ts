import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { getCurrentTimeProgress, getShuffledCards, tryPlaceShapeOnBoard } from '../../game-logic/functions';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgIf } from '@angular/common';
import { LandscapeCard } from '../../models/landscape-card';
import { GoalAreaComponent } from '../components/goal-area/goal-area.component';
import { Goal, GOALS } from '../../models/goals';
import { SeasonInfoComponent } from '../components/season-info/season-info.component';
import { Season, SEASONS } from '../../models/season';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [GameBoardComponent, NextShapeComponent, NgIf, GoalAreaComponent, SeasonInfoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  untouchedBoardState: BoardTile[][] = getInitialBoardTiles();
  temporaryBoardState: BoardTile[][] = [...this.untouchedBoardState];
  cardDeck: LandscapeCard[] = getShuffledCards();
  goals: Goal[] = GOALS;
  currentSeasonIndex: number = 0;
  coins: number = 0;
  newCoins: number = 0;

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  hasConflict: boolean = false;
  conflictedCellIndices: number[] = [];

  protected currentCardIndex: number = 0;
  protected seasons: Season[] = SEASONS;

  get currentCard(): LandscapeCard | undefined {
    return this.cardDeck[this.currentCardIndex];
  }

  get playedCards(): LandscapeCard[] {
    return this.cardDeck.slice(0, this.currentCardIndex + 1);
  }

  get currentSeason(): Season {
    return this.seasons[this.currentSeasonIndex];
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.hasConflict) return;

    this.updateShapeInBoard(shape, false);
    this.untouchedBoardState = this.temporaryBoardState;
    this.currentShapeToPlace = undefined;
    this.coins += this.newCoins;
    this.newCoins = 0;

    this.startNewSeasonIfApplicable();
  }

  updateShapeInBoard(shape: PlacedLandscapeShape | undefined, isTemporary: boolean) {
    if (shape) {
      this.currentShapeToPlace = shape;
      this.newCoins = shape.baseShape.hasCoin ? 1 : 0;
      const placeResult = tryPlaceShapeOnBoard(this.untouchedBoardState, shape, isTemporary);
      this.newCoins += placeResult.newCoins;
      this.temporaryBoardState = placeResult.updatedBoard;
      this.hasConflict = placeResult.conflictedCellIndices.length > 0;
      this.conflictedCellIndices = placeResult.conflictedCellIndices;

      if (this.hasConflict) {
        this.newCoins = 0;
      }
    }
  }

  startNewSeasonIfApplicable(): void {
    if (getCurrentTimeProgress(this.playedCards) < this.currentSeason.duration) {
      this.currentCardIndex++;
      return;
    }

    this.currentSeasonIndex++;
    this.currentCardIndex = 0;

    if (this.currentSeason) {
      this.cardDeck = getShuffledCards();
    } else {
      this.cardDeck = [];
    }
  }
}
