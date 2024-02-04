import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { NgForOf, NgIf } from '@angular/common';
import { Goal } from '../../../models/goals';
import { MONSTER_SCORE_INDEX } from '../../../game-logic/constants';
import { GoalHighlighterDirective } from '../../directives/goal-highlighter.directive';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [GoalIdComponent, NgForOf, NgIf, GoalHighlighterDirective],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  @Input({ required: true }) goals: Goal[] = [];
  @Input() goalIndices: number[] = [];
  @Input({ transform: booleanAttribute }) showDefaultGoals: boolean = false;

  @Output() goalHover = new EventEmitter<number>();

  protected readonly coinDescription: string = 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes.';
  protected readonly monsterScoreDescription: string = 'One minus point for each empty tile that is adjacent to at least one monster tile';
  protected readonly coinEmojiDescription: string = '1🎖️ / 💎';
  protected readonly monsterEmojiDescription: string = '-1🎖️ / 🔲⏭️😈';

  protected highlightedGoalIndex: number = -1;

  @HostBinding('class.has-highlighted-goal')
  get hasHighlightedGoal(): boolean {
    return this.highlightedGoalIndex >= 0;
  }

  showGoal(index: number): boolean {
    return !this.goalIndices.length || this.goalIndices.includes(index);
  }

  highlightGoal(index: number): void {
    this.highlightedGoalIndex = index;
    this.goalHover.emit(index);
  }

  protected readonly MONSTER_SCORE_INDEX = MONSTER_SCORE_INDEX;
}
