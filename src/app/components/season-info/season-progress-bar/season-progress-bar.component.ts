import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LandscapeCard } from '../../../../models/landscape-card';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-season-progress-bar',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './season-progress-bar.component.html',
  styleUrl: './season-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--column-count]': 'seasonLength',
  },
})
export class SeasonProgressBarComponent {
  @Input() seasonLength: number = 0;
  @Input() playedCards: LandscapeCard[] = [];

  getPreviousTimeProgress(index: number): number {
    return this.playedCards.slice(0, index).reduce((acc, card) => acc + card.timeValue, 0);
  }
}
