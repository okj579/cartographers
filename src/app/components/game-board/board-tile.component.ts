import { Component, Input } from '@angular/core';
import { Coordinates, LandscapeType } from '../../../models/shape';

export interface BoardTile {
  position: Coordinates;
  landscape?: LandscapeType;
  destroyed?: boolean;
  heroStar?: boolean;
  isBase?: boolean;
}

@Component({
  selector: 'app-board-tile',
  standalone: true,
  imports: [],
  template: ``,
  styleUrl: './board-tile.component.scss',
  host: {
    '[style.grid-column]': 'tile.position.x + 1',
    '[style.grid-row]': 'tile.position.y + 1',
    '[attr.data-landscape]': 'tile.landscape',
    '[class.destroyed]': 'tile.destroyed',
    '[class.hero-star]': 'tile.heroStar',
    '[class.base]': 'tile.isBase',
  },
})
export class BoardTileComponent {
  @Input({ required: true }) tile!: BoardTile;
}
