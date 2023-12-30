import { Component, Input } from '@angular/core';
import { BoardTile } from '../../../models/board-tile';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-board-tile',
  standalone: true,
  imports: [NgIf],
  template: `<div *ngIf="tile.destroyed" class="destroyed"></div>`,
  styleUrl: './board-tile.component.scss',
  host: {
    '[style.grid-column]': 'tile.position.x + 1',
    '[style.grid-row]': 'tile.position.y + 1',
    '[attr.data-landscape]': 'tile.landscape',
    '[class.conflicted]': 'tile.conflicted',
    '[class.hero-star]': 'tile.heroStar',
    '[class.base]': 'tile.isBase',
  },
})
export class BoardTileComponent {
  @Input({ required: true }) tile!: BoardTile;
}
