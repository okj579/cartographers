import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GoalListComponent } from '../goal-list/goal-list.component';
import { NgForOf, NgIf } from '@angular/common';
import { SEASONS, SeasonScore } from '../../../models/season';
import { Goal } from '../../../models/goals';
import { SeasonScoresComponent } from '../season-scores/season-scores.component';

@Component({
  selector: 'app-game-setup-info',
  standalone: true,
  imports: [GoalListComponent, NgIf, SeasonScoresComponent, NgForOf],
  templateUrl: './game-setup-info.component.html',
  styleUrl: './game-setup-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSetupInfoComponent {
  @Input() goals: Goal[] = [];
  @Input() seasonScores: SeasonScore[] = [];
  @Input() isStartOfGame: boolean = false;

  @Output() startGame = new EventEmitter<void>();

  readonly seasons = SEASONS;
}
