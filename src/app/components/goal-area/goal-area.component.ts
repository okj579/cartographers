import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Goal } from '../../../models/goals';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-goal-area',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './goal-area.component.html',
  styleUrl: './goal-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalAreaComponent implements OnChanges {
  @Input() goals: Goal[] = [];
  @Input() previousBoardState: BoardTile[][] = [];
  @Input() boardState: BoardTile[][] = [];

  protected scores: number[] = [];
  protected previousScores: number[] = [];

  get totalScoreDiff(): number {
    return this.scores.reduce((acc, score) => acc + score, 0) - this.totalPreviousScore;
  }

  get totalPreviousScore(): number {
    return this.previousScores.reduce((acc, score) => acc + score, 0);
  }

  ngOnChanges() {
    this.scores = this.goals.map((goal) => {
      return goal.scoreAlgorithm(this.boardState);
    });

    this.previousScores = this.goals.map((goal) => {
      return goal.scoreAlgorithm(this.previousBoardState);
    });
  }

  getScoreDiff(index: number): number {
    return this.scores[index] - this.previousScores[index];
  }

  showDescription(index: number): void {
    window.alert(this.goals[index].description);
  }
}
