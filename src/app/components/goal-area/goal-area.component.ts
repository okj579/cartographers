import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Goal } from '../../../models/goals';
import { NgForOf, NgIf } from '@angular/common';
import { IndexToCharPipe } from './index-to-char.pipe';
import { Season } from '../../../models/season';
import { getSeasonScore } from '../../../game-logic/functions';
import { MONSTER_SCORE_INDEX } from '../../../game-logic/constants';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { GoalIdComponent } from './goal-id/goal-id.component';
import { GoalHighlighterDirective } from '../../directives/goal-highlighter.directive';

@Component({
  selector: 'app-goal-area',
  standalone: true,
  imports: [NgForOf, NgIf, IndexToCharPipe, FormatNumberPipe, GoalIdComponent, GoalHighlighterDirective],
  templateUrl: './goal-area.component.html',
  styleUrl: './goal-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalAreaComponent {
  @Input() goals: Goal[] = [];
  @Input() currentSeason: Season | undefined = undefined;
  @Input() coins: number = 0;
  @Input() temporaryCoins: number = 0;

  @Input() temporaryScores: number[] = [];
  @Input() previousScores: number[] = [];

  @Input()
  isEndOfSeason: boolean = false;

  @Output() goalHover = new EventEmitter<number>();

  protected monsterScoreIndex: number = MONSTER_SCORE_INDEX;

  coinDescription: string = 'Collect 💎 by surrounding mountains on the 4 edges, and from some of the landscape shapes.';
  monsterScoreDescription: string = 'One minus point for each empty tile that is adjacent to at least one monster tile';

  get coinDiff(): number {
    return this.temporaryCoins - this.coins;
  }

  get totalScoreDiff(): number {
    return this.temporaryScores.reduce((acc, score) => acc + score, 0) + this.temporaryCoins - this.totalPreviousScore;
  }

  get totalPreviousScore(): number {
    return this.previousScores.reduce((acc, score) => acc + score, 0) + this.coins;
  }

  get totalSeasonScore(): number {
    return this.currentSeason ? getSeasonScore(this.currentSeason, this.temporaryScores, this.temporaryCoins) : 0;
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

  showCoinsDescription(): void {
    window.alert(this.coinDescription);
  }
}
