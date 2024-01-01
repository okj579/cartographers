import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlacedLandscapeShape } from '../../../models/landscape-shape';
import { getHeroInformation, mirrorShape, rotateShapeClockwise, rotateShapeCounterClockwise } from '../../../game-logic/functions';
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
  @Input({ required: true }) landscapeShape!: PlacedLandscapeShape;

  @Output() landscapeShapeChange: EventEmitter<PlacedLandscapeShape> = new EventEmitter<PlacedLandscapeShape>();

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

  rotateClockwise() {
    const baseShape: BaseShape = rotateShapeClockwise(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  rotateCounterClockwise() {
    const baseShape: BaseShape = rotateShapeCounterClockwise(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  mirror() {
    const baseShape: BaseShape = mirrorShape(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  moveUp() {
    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, y: this.landscapeShape.position.y - 1 },
    });
  }

  moveDown() {
    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, y: this.landscapeShape.position.y + 1 },
    });
  }

  moveLeft() {
    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, x: this.landscapeShape.position.x - 1 },
    });
  }

  moveRight() {
    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, x: this.landscapeShape.position.x + 1 },
    });
  }
}
