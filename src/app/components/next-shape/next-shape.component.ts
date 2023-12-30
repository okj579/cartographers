import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LandscapeShape } from '../../../models/landscape-shape';
import { getHeroInformation, mirrorShape, rotateShape } from '../../../game-logic/functions';
import { BaseShape } from '../../../models/base-shape';
import { BoardTileComponent } from '../game-board/board-tile.component';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-next-shape',
  standalone: true,
  imports: [BoardTileComponent, NgForOf],
  templateUrl: './next-shape.component.html',
  styleUrl: './next-shape.component.scss',
})
export class NextShapeComponent {
  @Input({ required: true }) landscapeShape!: LandscapeShape;

  @Output() landscapeShapeChange: EventEmitter<LandscapeShape> = new EventEmitter<LandscapeShape>();

  get boardTiles(): BoardTile[] {
    return this.landscapeShape.baseShape.filledCells.map((cell) => {
      const { isHeroStar } = getHeroInformation(this.landscapeShape, cell);

      return {
        position: { x: cell.x, y: cell.y },
        landscape: isHeroStar ? undefined : this.landscapeShape.type,
        heroStar: isHeroStar,
      };
    });
  }

  rotate() {
    const baseShape: BaseShape = rotateShape(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  mirror() {
    const baseShape: BaseShape = mirrorShape(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }
}