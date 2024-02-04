import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { GoalCategory } from '../../../../models/goals';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
  selector: 'app-score-tile',
  standalone: true,
  imports: [FormatNumberPipe],
  template: '<span>{{ score | formatNumber }}</span>',
  styleUrl: './score-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreTileComponent {
  @Input({ required: true }) score: number = 0;

  @Input({ required: true })
  @HostBinding('attr.data-category')
  goalCategory!: GoalCategory | 'monster';

  @Input()
  @HostBinding('class.is-on-board')
  isOnBoard: boolean = false;

  @HostBinding('class.is-big')
  get isBig(): boolean {
    return this.score > 9;
  }
}
