import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Goal } from '../../../../models/goals';
import { IndexToCharPipe } from '../index-to-char.pipe';

@Component({
  selector: 'app-goal-id',
  standalone: true,
  imports: [IndexToCharPipe],
  template: '{{ index | indexToChar }}',
  styleUrl: './goal-id.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-category]': 'goal.category',
  },
})
export class GoalIdComponent {
  @Input({ required: true }) goal!: Goal;
  @Input({ required: true }) index: number = 0;

  @Output() goalHover = new EventEmitter<number>();

  @HostListener('mouseover', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseEnter(event: MouseEvent) {
    event?.preventDefault();

    this.goalHover.emit(this.index);
  }

  @HostListener('mouseout', ['$event'])
  @HostListener('touchend', ['$event'])
  onMouseLeave(event: MouseEvent) {
    event?.preventDefault();

    this.goalHover.emit(-1);
  }
}
