import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Season } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from '../goal-area/index-to-char.pipe';
import { GoalEmojisPipe } from './goal-emojis.pipe';
import { getSeasonScore } from '../../../game-logic/functions';
import { MONSTER_SCORE_INDEX } from '../../../game-logic/constants';

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
  protected monsterScoreIndex: number = MONSTER_SCORE_INDEX;

  protected readonly coinDescription: string = 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes.';
  protected readonly monsterScoreDescription: string = 'One minus point for each empty tile that is adjacent to at least one monster tile';
  protected readonly coinEmojiDescription: string = '1🎖️ / 💎';
  protected readonly monsterEmojiDescription: string = '-1🎖️ / 🔲⏭️😈';

  get totalSeasonScore(): number {
    return getSeasonScore(this.currentSeason, this.scores, this.coins);
  }

  toggleShowAllGoals(): void {
    this.showAllGoals = !this.showAllGoals;
  }
}
