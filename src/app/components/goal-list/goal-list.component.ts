import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { GoalIdComponent } from '../goal-area/goal-id/goal-id.component';
import { NgForOf, NgIf } from '@angular/common';
import { Goal, isDefaultGoal } from '../../../models/goals';
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

  protected highlightedGoalIndex: number = -1;

  @HostBinding('class.has-highlighted-goal')
  get hasHighlightedGoal(): boolean {
    return this.highlightedGoalIndex >= 0;
  }

  showGoal(index: number, goal: Goal): boolean {
    if (isDefaultGoal(goal)) {
      return this.showDefaultGoals;
    }

    return !this.goalIndices.length || this.goalIndices.includes(index);
  }

  highlightGoal(index: number): void {
    this.highlightedGoalIndex = index;
    this.goalHover.emit(index);
  }
}
