import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf, NgIf } from '@angular/common';
import { MONSTER_MAP } from '../../../models/monster';
import { SeasonBadgeComponent } from './season-badge/season-badge.component';

@Component({
  selector: 'app-board-tile',
  standalone: true,
  imports: [NgIf, SeasonBadgeComponent, NgForOf],
  template: ` <div *ngIf="monsterEmoji" class="monster-emoji">{{ monsterEmoji }}</div>
    <div *ngIf="tile.destroyed" class="destroyed"></div>
    <div *ngIf="tile.monsterType" class="monster-type">{{ tile.monsterType }}</div>
    <div
      *ngIf="tile.hasCoin || tile.wasScoreCoin"
      class="coin"
      [class.coin-was-removed]="tile.wasScoreCoin"
      [class.will-be-removed]="coinWillBeRemoved"
      [class.is-dragon]="tile.monsterType"
    ></div>`,
  styleUrl: './board-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.grid-column]': 'tile.position.x + 1',
    '[style.grid-row]': 'tile.position.y + 1',
    '[attr.data-landscape]': 'tile.landscape',
    '[class.conflicted]': 'tile.conflicted',
    '[class.hero-star]': 'tile.heroStar',
    '[class.base]': '!tile.landscape',
    '[class.has-monster-type]': '!!tile.monsterType',
  },
})
export class BoardTileComponent {
  @Input({ required: true }) tile!: BoardTile;

  @Input() coinWillBeRemoved: boolean = false;

  get monsterEmoji(): string | undefined {
    return this.tile.monsterType ? MONSTER_MAP[this.tile.monsterType].emoji : undefined;
  }
}
