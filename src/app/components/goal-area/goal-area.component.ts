import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Goal } from '../../../models/goals';
import { NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from './index-to-char.pipe';
import { Season } from '../../../models/season';
import { getSeasonScore } from '../../../game-logic/functions';
import { MONSTER_SCORE_INDEX } from '../../../game-logic/constants';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { GoalIdComponent } from './goal-id/goal-id.component';

@Component({
  selector: 'app-goal-area',
  standalone: true,
  imports: [NgForOf, NgIf, IndexToCharPipe, FormatNumberPipe, GoalIdComponent],
  templateUrl: './goal-area.component.html',
  styleUrl: './goal-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalAreaComponent {
  @Input() goals: Goal[] = [];
  @Input() currentSeason: Season | undefined = undefined;
  @Input() coins: number = 0;
  @Input() newCoins: number = 0;

  @Input() temporaryScores: number[] = [];
  @Input() previousScores: number[] = [];

  protected monsterScoreIndex: number = MONSTER_SCORE_INDEX;

  coinDescription: string = 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes.';
  monsterScoreDescription: string = 'One minus point for each empty tile that is adjacent to at least one monster tile';

  get totalScoreDiff(): number {
    return this.temporaryScores.reduce((acc, score) => acc + score, 0) + this.coins + this.newCoins - this.totalPreviousScore;
  }

  get totalPreviousScore(): number {
    return this.previousScores.reduce((acc, score) => acc + score, 0) + this.coins;
  }

  get totalSeasonScore(): number {
    return this.currentSeason ? getSeasonScore(this.currentSeason, this.temporaryScores, this.coins + this.newCoins) : 0;
  }

  get totalSeasonPreviousScore(): number {
    return this.currentSeason ? getSeasonScore(this.currentSeason, this.previousScores, this.coins) : 0;
  }

  get totalSeasonScoreDiff(): number {
    return this.totalSeasonScore - this.totalSeasonPreviousScore;
  }

  getScoreDiff(index: number): number {
    return this.temporaryScores[index] - this.previousScores[index];
  }

  showDescription(index: number): void {
    window.alert(this.goals[index].name + ': ' + this.goals[index].description);
  }

  showCoinsDescription(): void {
    window.alert(this.coinDescription);
  }

  showMonsterScoreDescription(): void {
    window.alert(this.monsterScoreDescription);
  }
}
