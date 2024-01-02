import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Season, SEASONS } from '../../../models/season';
import { LandscapeCard } from '../../../models/landscape-card';
import { SeasonProgressBarComponent } from './season-progress-bar/season-progress-bar.component';
import { getCurrentTimeProgress } from '../../../game-logic/functions';

@Component({
  selector: 'app-season-info',
  standalone: true,
  imports: [SeasonProgressBarComponent],
  templateUrl: './season-info.component.html',
  styleUrl: './season-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonInfoComponent {
  @Input() currentSeason: Season = SEASONS[0];
  @Input() playedCards: LandscapeCard[] = [];

  get currentSeasonProgress(): number {
    return getCurrentTimeProgress(this.playedCards);
  }

  get isLastRound(): boolean {
    return this.currentSeasonProgress >= this.currentSeason.duration;
  }
}
