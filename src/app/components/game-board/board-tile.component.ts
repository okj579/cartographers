import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf, NgIf } from '@angular/common';
import { MONSTER_MAP } from '../../../models/monster';

@Component({
  selector: 'app-board-tile',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './board-tile.component.html',
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
