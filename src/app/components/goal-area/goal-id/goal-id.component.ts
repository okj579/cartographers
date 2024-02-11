import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Goal } from '../../../../models/goals';
import { IndexToCharPipe } from '../index-to-char.pipe';

@Component({
  selector: 'app-goal-id',
  standalone: true,
  imports: [IndexToCharPipe],
  template: '{{ goal.goalEmoji ?? (index | indexToChar) }}',
  styleUrl: './goal-id.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-category]': 'goal.category',
  },
})
export class GoalIdComponent {
  @Input({ required: true }) goal!: Goal;
  @Input({ required: true }) index: number = 0;
}
