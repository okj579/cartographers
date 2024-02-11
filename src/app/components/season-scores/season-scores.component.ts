import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { NgForOf } from '@angular/common';
import { Season } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { getSeasonScore } from '../../../game-logic/functions';
import { GoalHighlighterDirective } from '../../directives/goal-highlighter.directive';

@Component({
  selector: 'app-season-scores',
  standalone: true,
  imports: [GoalIdComponent, NgForOf, GoalHighlighterDirective],
  templateUrl: './season-scores.component.html',
  styleUrl: './season-scores.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.narrow]': 'narrow',
  },
})
export class SeasonScoresComponent {
  @Input({ required: true }) currentSeason!: Season;
  @Input({ required: true }) goals: Goal[] = [];

  @Input() isFinalScore: boolean = false;
  @Input({ transform: booleanAttribute }) narrow: boolean = false;

  @Input() scores: number[] | undefined = [];

  @Output() goalHover = new EventEmitter<number>();

  get totalSeasonScore(): number | undefined {
    return this.scores ? getSeasonScore(this.currentSeason, this.scores) : undefined;
  }
}
