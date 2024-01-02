import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { PlacedLandscapeTileComponent } from './placed-landscape-tile.component';
import { BoardTile } from '../../../models/board-tile';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, PlacedLandscapeTileComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  @Input() currentBoardState: BoardTile[][] = [];

  trackByIndex(index: number): number {
    return index;
  }
}
