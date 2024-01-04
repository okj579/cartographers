import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { BoardTile } from '../../models/board-tile';
import { getInitialBoardTiles } from '../../game-logic/constants';
import { PlacedLandscapeShape } from '../../models/landscape-shape';
import { getCurrentTimeProgress, getSeasonScore, getShuffledCards, tryPlaceShapeOnBoard } from '../../game-logic/functions';
import { NextShapeComponent } from '../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { LandscapeCard } from '../../models/landscape-card';
import { GoalAreaComponent } from '../components/goal-area/goal-area.component';
import { Goal, GOALS } from '../../models/goals';
import { SeasonInfoComponent } from '../components/season-info/season-info.component';
import { Season, SEASONS, SeasonScore } from '../../models/season';
import { SeasonGoalsComponent } from '../components/season-goals/season-goals.component';
import { Coordinates } from '../../models/simple-types';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [GameBoardComponent, NextShapeComponent, NgIf, GoalAreaComponent, SeasonInfoComponent, SeasonGoalsComponent, NgForOf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  @ViewChild(NextShapeComponent) nextShapeComponent!: NextShapeComponent;

  untouchedBoardState: BoardTile[][] = getInitialBoardTiles();
  temporaryBoardState: BoardTile[][] = [...this.untouchedBoardState];
  cardDeck: LandscapeCard[] = getShuffledCards();
  goals: Goal[] = GOALS;
  currentSeasonIndex: number = 0;
  coins: number = 0;
  newCoins: number = 0;
  temporaryScores: number[] = [];
  scores: number[] = [];

  seasonScores: SeasonScore[] = [];

  currentShapeToPlace: PlacedLandscapeShape | undefined;

  hasConflict: boolean = false;
  conflictedCellIndices: number[] = [];

  protected currentCardIndex: number = -1;
  protected seasons: Season[] = SEASONS;

  protected isEndOfSeason: boolean = false;

  get isStartOfSeason(): boolean {
    return this.currentCardIndex === -1 && !!this.currentSeason;
  }

  get currentCard(): LandscapeCard | undefined {
    return this.cardDeck[this.currentCardIndex];
  }

  get playedCards(): LandscapeCard[] {
    return this.cardDeck.slice(0, this.currentCardIndex + 1);
  }

  get currentSeason(): Season | undefined {
    return this.seasons[this.currentSeasonIndex];
  }

  get totalEndScore(): number {
    return this.seasonScores.reduce((sum, score) => sum + score.totalScore, 0);
  }

  startSeason(): void {
    this.currentCardIndex = 0;
  }

  endSeason(): void {
    if (!!this.currentSeason) {
      this.seasonScores.push({
        season: this.currentSeason,
        goalScores: this.scores,
        coins: this.coins,
        totalScore: getSeasonScore(this.currentSeason, this.scores, this.coins),
      });
    }

    this.currentSeasonIndex++;
    this.currentCardIndex = -1;
    this.isEndOfSeason = false;

    if (this.currentSeason) {
      this.cardDeck = getShuffledCards();
    } else {
      this.cardDeck = [];
    }
  }

  submitShape(shape: PlacedLandscapeShape): void {
    if (this.hasConflict) return;

    this.updateShapeInBoard(shape, false);
    this.untouchedBoardState = this.temporaryBoardState;
    this.currentShapeToPlace = undefined;
    this.coins += this.newCoins;
    this.newCoins = 0;

    this.scores = [...this.temporaryScores];

    this._startNewSeasonIfApplicable();
  }

  onPositionChange(position: Coordinates): void {
    if (!this.currentShapeToPlace) return;

    this.nextShapeComponent.updatePositionFromOutside(position);
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

      this._updateScores();
    }
  }

  private _startNewSeasonIfApplicable(): void {
    if (this.currentSeason && getCurrentTimeProgress(this.playedCards) < this.currentSeason.duration) {
      this.currentCardIndex++;
      return;
    }

    this.isEndOfSeason = true;
  }

  private _updateScores(): void {
    this.scores = this.goals.map((goal) => {
      return goal.scoreAlgorithm(this.untouchedBoardState);
    });

    if (this.hasConflict) {
      this.temporaryScores = this.scores;
      return;
    }

    this.temporaryScores = this.goals.map((goal) => {
      return goal.scoreAlgorithm(this.temporaryBoardState);
    });
  }
}
