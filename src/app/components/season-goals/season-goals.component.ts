import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Season } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from '../goal-area/index-to-char.pipe';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { GoalListComponent } from '../goal-list/goal-list.component';
import { SeasonScoresComponent } from '../season-scores/season-scores.component';

@Component({
  selector: 'app-season-goals',
  standalone: true,
  imports: [NgForOf, IndexToCharPipe, NgIf, NgClass, GoalIdComponent, GoalListComponent, SeasonScoresComponent],
  templateUrl: './season-goals.component.html',
  styleUrl: './season-goals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonGoalsComponent {
  @Input({ required: true }) currentSeason!: Season;
  @Input({ required: true }) goals: Goal[] = [];

  @Input() isStartOfSeason: boolean = false;
  @Input() isEndOfSeason: boolean = false;
  @Input() isEndOfGame: boolean = false;

  @Input() scores: number[] = [];

  @Output() startSeason = new EventEmitter<void>();
  @Output() endSeason = new EventEmitter<void>();
  @Output() goalHover = new EventEmitter<number>();

  get isFinalScore(): boolean {
    return this.isEndOfGame || this.isEndOfSeason;
  }
}
