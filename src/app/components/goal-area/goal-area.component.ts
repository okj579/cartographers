import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Goal } from '../../../models/goals';
import { NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from './index-to-char.pipe';
import { getStillRelevantGoalIndices, Season } from '../../../models/season';
import { getSeasonScore } from '../../../game-logic/functions';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { GoalIdComponent } from './goal-id/goal-id.component';
import { GoalHighlighterDirective } from '../../directives/goal-highlighter.directive';

@Component({
  selector: 'app-goal-area',
  standalone: true,
  imports: [NgForOf, NgIf, IndexToCharPipe, FormatNumberPipe, GoalIdComponent, GoalHighlighterDirective],
  templateUrl: './goal-area.component.html',
  styleUrl: './goal-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalAreaComponent {
  @Input() goals: Goal[] = [];
  @Input() currentSeason: Season | undefined = undefined;

  @Input() temporaryScores: number[] = [];
  @Input() previousScores: number[] = [];

  @Input()
  isEndOfSeason: boolean = false;

  @Output() goalHover = new EventEmitter<number>();

  get totalScoreDiff(): number {
    return this.temporaryScores.reduce((acc, score) => acc + score, 0) - this.totalPreviousScore;
  }

  get totalPreviousScore(): number {
    return this.previousScores.reduce((acc, score) => acc + score, 0);
  }

  get totalSeasonScore(): number {
    return this.currentSeason ? getSeasonScore(this.currentSeason, this.temporaryScores) : 0;
  }

  get totalSeasonPreviousScore(): number {
    return this.currentSeason ? getSeasonScore(this.currentSeason, this.previousScores) : 0;
  }

  get totalSeasonScoreDiff(): number {
    return this.totalSeasonScore - this.totalSeasonPreviousScore;
  }

  isIrrelevantGoal(index: number): boolean {
    if (!this.currentSeason) {
      return false;
    }

    return !getStillRelevantGoalIndices(this.currentSeason).includes(index);
  }

  getScoreDiff(index: number): number {
    return this.temporaryScores[index] - this.previousScores[index];
  }
}
