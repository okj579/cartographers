import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { getShapeDimensions, PlacedLandscapeShape, ShapeDimensions } from '../../../models/landscape-shape';
import { getHeroInformation, mirrorShape, rotateShapeClockwise, rotateShapeCounterClockwise } from '../../../game-logic/functions';
import { BaseShape } from '../../../models/base-shape';
import { BoardTileComponent } from '../game-board/board-tile.component';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf } from '@angular/common';
import { BOARD_SIZE } from '../../../game-logic/constants';

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

  get shapeDimensions(): ShapeDimensions {
    return getShapeDimensions(this.landscapeShape);
  }

  get disableLeft(): boolean {
    return this.shapeDimensions.x === 0;
  }

  get disableRight(): boolean {
    return this.shapeDimensions.x + this.shapeDimensions.width === BOARD_SIZE;
  }

  get disableUp(): boolean {
    return this.shapeDimensions.y === 0;
  }

  get disableDown(): boolean {
    return this.shapeDimensions.y + this.shapeDimensions.height === BOARD_SIZE;
  }

  @HostListener('window:keydown.r', ['$event'])
  @HostListener('window:keydown.e', ['$event'])
  rotateClockwise() {
    const baseShape: BaseShape = rotateShapeClockwise(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  @HostListener('window:keydown.l', ['$event'])
  @HostListener('window:keydown.q', ['$event'])
  rotateCounterClockwise() {
    const baseShape: BaseShape = rotateShapeCounterClockwise(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  @HostListener('window:keydown.m', ['$event'])
  @HostListener('window:keydown.x', ['$event'])
  mirror() {
    const baseShape: BaseShape = mirrorShape(this.landscapeShape.baseShape);
    this.landscapeShapeChange.emit({ ...this.landscapeShape, baseShape });
  }

  @HostListener('window:keydown.ArrowUp', ['$event'])
  @HostListener('window:keydown.w', ['$event'])
  moveUp() {
    if (this.disableUp) return;

    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, y: this.landscapeShape.position.y - 1 },
    });
  }

  @HostListener('window:keydown.ArrowDown', ['$event'])
  @HostListener('window:keydown.s', ['$event'])
  moveDown() {
    if (this.disableDown) return;

    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, y: this.landscapeShape.position.y + 1 },
    });
  }

  @HostListener('window:keydown.ArrowLeft', ['$event'])
  @HostListener('window:keydown.a', ['$event'])
  moveLeft() {
    if (this.disableLeft) return;

    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, x: this.landscapeShape.position.x - 1 },
    });
  }

  @HostListener('window:keydown.ArrowRight', ['$event'])
  @HostListener('window:keydown.d', ['$event'])
  moveRight() {
    if (this.disableRight) return;

    this.landscapeShapeChange.emit({
      ...this.landscapeShape,
      position: { ...this.landscapeShape.position, x: this.landscapeShape.position.x + 1 },
    });
  }
}
