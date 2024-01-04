import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { BoardTileComponent } from './board-tile.component';
import { TemporaryPlacedLandscapeShapeComponent } from './temporary-placed-landscape-shape.component';
import { BoardTile } from '../../../models/board-tile';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';
import { Coordinates } from '../../../models/simple-types';
import { BOARD_SIZE } from '../../../game-logic/constants';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [NgForOf, BoardTileComponent, TemporaryPlacedLandscapeShapeComponent, NgIf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  @Input() currentBoardState: BoardTile[][] = [];
  @Input() currentShapeToPlace: PlacedLandscapeShape | undefined;
  @Input() conflictedCellIndices: number[] = [];

  @Output() positionChange: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();

  get allowPlacing(): boolean {
    return this.currentShapeToPlace !== undefined;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onTileClick(x: number, y: number): void {
    if (!this.allowPlacing || !this.currentShapeToPlace) return;

    const diffXToNotOverflow = Math.min(0, BOARD_SIZE - this.currentShapeToPlace.baseShape.width - x);
    const diffYToNotOverflow = Math.min(0, BOARD_SIZE - this.currentShapeToPlace.baseShape.height - y);

    this.positionChange.emit({ x: x + diffXToNotOverflow, y: y + diffYToNotOverflow });
  }
}
