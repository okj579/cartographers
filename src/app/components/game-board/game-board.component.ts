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

    const diffXToMiddle = Math.floor((this.currentShapeToPlace.baseShape.width - 0.1) / 2);
    const diffYToMiddle = Math.floor((this.currentShapeToPlace.baseShape.height - 0.1) / 2);

    const centeredX = x - diffXToMiddle;
    const centeredY = y - diffYToMiddle;

    const diffXToNotOverflow = Math.min(0, BOARD_SIZE - this.currentShapeToPlace.baseShape.width - centeredX);
    const diffYToNotOverflow = Math.min(0, BOARD_SIZE - this.currentShapeToPlace.baseShape.height - centeredY);

    const xToPlace = Math.max(0, centeredX + diffXToNotOverflow);
    const yToPlace = Math.max(0, centeredY + diffYToNotOverflow);

    this.positionChange.emit({ x: xToPlace, y: yToPlace });
  }
}
