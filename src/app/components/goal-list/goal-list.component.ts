import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { NgForOf, NgIf } from '@angular/common';
import { Goal } from '../../../models/goals';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [GoalIdComponent, NgForOf, NgIf],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  @Input({ required: true }) goals: Goal[] = [];
  @Input() goalIndices: number[] = [];
  @Input({ transform: booleanAttribute }) showDefaultGoals: boolean = false;

  protected readonly coinDescription: string = 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes.';
  protected readonly monsterScoreDescription: string = 'One minus point for each empty tile that is adjacent to at least one monster tile';
  protected readonly coinEmojiDescription: string = '1🎖️ / 💎';
  protected readonly monsterEmojiDescription: string = '-1🎖️ / 🔲⏭️😈';

  showGoal(index: number): boolean {
    return !this.goalIndices.length || this.goalIndices.includes(index);
  }
}
