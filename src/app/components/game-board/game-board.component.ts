import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { PlacedLandscapeTileComponent } from './placed-landscape-tile.component';
import { BoardTile } from '../../../models/board-tile';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, PlacedLandscapeTileComponent, NgIf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  @Input() currentBoardState: BoardTile[][] = [];
  @Input() currentShapeToPlace: PlacedLandscapeShape | undefined;
  @Input() conflictedCellIndices: number[] = [];

  trackByIndex(index: number): number {
    return index;
  }
}
