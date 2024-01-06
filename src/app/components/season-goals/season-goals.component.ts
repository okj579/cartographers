import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Season } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from '../goal-area/index-to-char.pipe';
import { GoalEmojisPipe } from './goal-emojis.pipe';
import { getSeasonScore } from '../../../game-logic/functions';

@Component({
  selector: 'app-season-goals',
  standalone: true,
  imports: [NgForOf, IndexToCharPipe, GoalEmojisPipe, NgIf, NgClass],
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

  @Input() coins: number = 0;
  @Input() scores: number[] = [];

  @Output() startSeason = new EventEmitter<void>();
  @Output() endSeason = new EventEmitter<void>();

  protected showAllGoals: boolean = false;
  protected monsterScoreIndex: number = 4;

  get totalSeasonScore(): number {
    return getSeasonScore(this.currentSeason, this.scores, this.coins);
  }

  toggleShowAllGoals(): void {
    this.showAllGoals = !this.showAllGoals;
  }
}
