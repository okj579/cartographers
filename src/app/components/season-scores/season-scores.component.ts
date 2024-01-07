import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MONSTER_SCORE_INDEX } from '../../../game-logic/constants';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { NgForOf } from '@angular/common';
import { Season } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { getSeasonScore } from '../../../game-logic/functions';

@Component({
  selector: 'app-season-scores',
  standalone: true,
  imports: [GoalIdComponent, NgForOf],
  templateUrl: './season-scores.component.html',
  styleUrl: './season-scores.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonScoresComponent {
  @Input({ required: true }) currentSeason!: Season;
  @Input({ required: true }) goals: Goal[] = [];

  @Input() isFinalScore: boolean = false;

  @Input() coins: number = 0;
  @Input() scores: number[] = [];

  protected readonly monsterScoreIndex = MONSTER_SCORE_INDEX;

  get totalSeasonScore(): number {
    return getSeasonScore(this.currentSeason, this.scores, this.coins);
  }
}
