import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Season, SEASONS } from '../../../models/season';
import { LandscapeCard } from '../../../models/landscape-card';
import { SeasonProgressBarComponent } from './season-progress-bar/season-progress-bar.component';
import { getCurrentTimeProgress } from '../../../game-logic/functions';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-season-info',
  standalone: true,
  imports: [SeasonProgressBarComponent, NgIf, NgForOf],
  templateUrl: './season-info.component.html',
  styleUrl: './season-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonInfoComponent {
  @Input() currentSeason: Season | undefined = undefined;
  @Input() playedCards: LandscapeCard[] = [];
  @Input() isEndOfSeason: boolean = false;

  protected seasons: Season[] = SEASONS;

  get currentSeasonProgress(): number {
    return getCurrentTimeProgress(this.playedCards);
  }

  get isLastRound(): boolean {
    return !!this.currentSeason && this.currentSeasonProgress >= this.currentSeason.duration;
  }
}
