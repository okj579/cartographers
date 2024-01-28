import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { getShapeDimensions, LandscapeShape, PlacedLandscapeShape, ShapeDimensions } from '../../../models/landscape-shape';
import { findFirstPositionForShape, FindPositionResult, getHeroInformation } from '../../../game-logic/functions';
import { BoardTileComponent } from '../game-board/board-tile.component';
import { BoardTile } from '../../../models/board-tile';
import { NgForOf, NgIf } from '@angular/common';
import { BOARD_SIZE } from '../../../game-logic/constants';
import { getPortalCard, LandscapeCard } from '../../../models/landscape-card';
import { Coordinates } from '../../../models/simple-types';
import { LandscapeType } from '../../../models/landscape-type';
import {
  flipLandscapeShape,
  rotateLandscapeShapeClockwise,
  rotateLandscapeShapeCounterClockwise,
} from '../../../game-logic/transformation-functions';
import { MONSTER_EFFECTS, MonsterEffect } from '../../../game-logic/monster-effects';
import { Move, normalizeRotations } from '../../../models/move';
import { getLandscapeFromMove } from '../../../game-logic/game-state-functions';
import { ShapeName, SHAPES } from '../../../models/base-shape';

@Component({
  selector: 'app-next-shape',
  standalone: true,
  imports: [BoardTileComponent, NgForOf, NgIf],
  templateUrl: './next-shape.component.html',
  styleUrl: './next-shape.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextShapeComponent implements OnChanges {
  @Input({ required: true }) landscapeCard!: LandscapeCard;
  @Input({ required: true }) move!: Move;

  @Input() untouchedBoardState: BoardTile[][] = [];
  @Input() hasConflict: boolean = false;

  @Output() moveChange: EventEmitter<Move> = new EventEmitter<Move>();
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();

  protected variantLists: LandscapeShape[][] = [];
  protected boardTilesPerVariant: BoardTile[][] = [];

  get allVariants(): LandscapeShape[] {
    const allVariants: LandscapeShape[] = [];

    for (let variantList of this.variantLists) {
      allVariants.push(...variantList);
    }

    return allVariants;
  }

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['landscapeCard'] || changes['move']) {
      this.variantLists = this._getVariantLists(this.landscapeCard, this.move);
      this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    }
  }

  get currentMonsterEffect(): MonsterEffect | undefined {
    const monsterType = this.currentVariant?.monsterType;

    return monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  }

  get currentVariant(): PlacedLandscapeShape | undefined {
    const currentShape = this.variantLists[this.move.selectedShapeIndex][this.move.selectedLandscapeIndex];

    if (!currentShape) return undefined;

    return { ...currentShape, position: this.move.position };
  }

  get shapeDimensions(): ShapeDimensions | undefined {
    return this.currentVariant && getShapeDimensions(this.currentVariant);
  }

  get disableLeft(): boolean {
    return !this.shapeDimensions || this.shapeDimensions.x <= 0;
  }

  get disableRight(): boolean {
    return !this.shapeDimensions || this.shapeDimensions.x + this.shapeDimensions.width >= BOARD_SIZE;
  }

  get disableUp(): boolean {
    return !this.shapeDimensions || this.shapeDimensions.y <= 0;
  }

  get disableDown(): boolean {
    return !this.shapeDimensions || this.shapeDimensions.y + this.shapeDimensions.height >= BOARD_SIZE;
  }

  getIndicesFromIndex(index: number): { selectedLandscapeIndex: number; selectedShapeIndex: number } {
    const selectedShapeIndex = Math.floor(index / this.landscapeCard.landscapeTypes.length);
    const selectedLandscapeIndex = index % this.landscapeCard.landscapeTypes.length;

    return { selectedLandscapeIndex, selectedShapeIndex };
  }

  getVariantIndex(selectedShapeIndex: number, selectedLandscapeIndex: number): number {
    return selectedShapeIndex * this.landscapeCard.landscapeTypes.length + selectedLandscapeIndex;
  }

  @HostListener('window:keydown', ['$event'])
  selectVariantListener(event: KeyboardEvent) {
    try {
      const key = parseInt(event.key);

      if (isNaN(key) || key > this.allVariants.length) return;

      const { selectedLandscapeIndex, selectedShapeIndex } = this.getIndicesFromIndex(key - 1);

      this.selectVariant(selectedShapeIndex, selectedLandscapeIndex);
    } catch (e) {
      return;
    }
  }

  selectVariant(selectedShapeIndex: number, selectedLandscapeIndex: number) {
    this.moveChange.emit({ ...this.move, selectedLandscapeIndex, selectedShapeIndex });
  }

  @HostListener('window:keydown.Enter', ['$event'])
  @HostListener('window:keydown.Space', ['$event'])
  submitShape(event?: KeyboardEvent) {
    event?.preventDefault();

    if (this.hasConflict || !this.currentVariant) return;

    this.submit.emit();
  }

  @HostListener('window:keydown.r', ['$event'])
  @HostListener('window:keydown.e', ['$event'])
  rotateClockwise() {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    const rotatedHero = previousHeroPosition ? rotateLandscapeShapeClockwise(this.allVariants[0]) : undefined;
    const position = this._getCoordinatesAfterHeroTransformation(previousHeroPosition, rotatedHero?.heroPosition);

    this.moveChange.emit(
      normalizeRotations({ ...this.move, numberOfClockwiseRotations: this.move.numberOfClockwiseRotations + 1, position }),
    );
  }

  @HostListener('window:keydown.l', ['$event'])
  @HostListener('window:keydown.q', ['$event'])
  rotateCounterClockwise() {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    const rotatedHero = previousHeroPosition ? rotateLandscapeShapeCounterClockwise(this.allVariants[0]) : undefined;
    const position = this._getCoordinatesAfterHeroTransformation(previousHeroPosition, rotatedHero?.heroPosition);

    this.moveChange.emit(
      normalizeRotations({ ...this.move, numberOfCounterClockwiseRotations: this.move.numberOfCounterClockwiseRotations + 1, position }),
    );
  }

  @HostListener('window:keydown.m', ['$event'])
  @HostListener('window:keydown.x', ['$event'])
  flip() {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    const flippedHero = previousHeroPosition ? flipLandscapeShape(this.allVariants[0]) : undefined;
    const position = this._getCoordinatesAfterHeroTransformation(previousHeroPosition, flippedHero?.heroPosition);

    this.moveChange.emit({ ...this.move, isFlipped: !this.move.isFlipped, position });
  }

  @HostListener('window:keydown.ArrowUp', ['$event'])
  @HostListener('window:keydown.w', ['$event'])
  moveUp() {
    if (this.disableUp) return;

    this.moveChange.emit({ ...this.move, position: { ...this.move.position, y: this.move.position.y - 1 } });
  }

  @HostListener('window:keydown.ArrowDown', ['$event'])
  @HostListener('window:keydown.s', ['$event'])
  moveDown() {
    if (this.disableDown) return;

    this.moveChange.emit({ ...this.move, position: { ...this.move.position, y: this.move.position.y + 1 } });
  }

  @HostListener('window:keydown.ArrowLeft', ['$event'])
  @HostListener('window:keydown.a', ['$event'])
  moveLeft() {
    if (this.disableLeft) return;

    this.moveChange.emit({ ...this.move, position: { ...this.move.position, x: this.move.position.x - 1 } });
  }

  @HostListener('window:keydown.ArrowRight', ['$event'])
  @HostListener('window:keydown.d', ['$event'])
  moveRight() {
    if (this.disableRight) return;

    this.moveChange.emit({ ...this.move, position: { ...this.move.position, x: this.move.position.x + 1 } });
  }

  findAvailablePosition(): void {
    if (!this.currentVariant) return;

    let selectedShapeIndex = this.move.selectedShapeIndex;
    let findPositionResult: FindPositionResult = findFirstPositionForShape(
      this.untouchedBoardState,
      this.landscapeCard.baseShapes[selectedShapeIndex],
    );

    if (!findPositionResult.position && this.landscapeCard.baseShapes.length > 1) {
      selectedShapeIndex = (selectedShapeIndex + 1) % this.landscapeCard.baseShapes.length;
      findPositionResult = findFirstPositionForShape(this.untouchedBoardState, this.landscapeCard.baseShapes[selectedShapeIndex]);
    }

    const { position, isFlipped, numberOfRotations } = findPositionResult;

    if (position) {
      this.moveChange.emit(
        normalizeRotations(
          normalizeRotations({
            ...this.move,
            position,
            selectedShapeIndex,
            isFlipped: this.move.isFlipped !== isFlipped,
            numberOfClockwiseRotations: this.move.numberOfClockwiseRotations + numberOfRotations,
          }),
        ),
      );
    } else {
      findPositionResult = findFirstPositionForShape(this.untouchedBoardState, SHAPES[ShapeName.DOT]);
      const isHero = this.currentVariant?.type === LandscapeType.HERO;
      let position = findPositionResult.position ?? { x: 0, y: 0 };
      position = isHero
        ? this._getCoordinatesAfterHeroTransformation(this.currentVariant?.heroPosition, findPositionResult.position, position)
        : position;
      this.moveChange.emit({
        ...this.move,
        position,
        selectedShapeIndex: isHero ? 0 : this.landscapeCard.baseShapes.length,
        selectedLandscapeIndex: 0,
      });
    }
  }

  private _getVariantLists(card: LandscapeCard, move: Move): LandscapeShape[][] {
    const landscapeShapeLists: LandscapeShape[][] = [];

    for (let shapeIndex = 0; shapeIndex < card.baseShapes.length; shapeIndex++) {
      const landscapeShapes: LandscapeShape[] = [];

      for (let landscapeIndex = 0; landscapeIndex < card.landscapeTypes.length; landscapeIndex++) {
        const landscapeShape = getLandscapeFromMove(
          { ...move, selectedShapeIndex: shapeIndex, selectedLandscapeIndex: landscapeIndex },
          card,
        );
        landscapeShapes.push(landscapeShape);
      }

      landscapeShapeLists.push(landscapeShapes);
    }

    if (move?.selectedShapeIndex === card.baseShapes.length) {
      landscapeShapeLists.push(...this._getVariantLists(getPortalCard(card.landscapeTypes[0]), { ...move, selectedShapeIndex: 0 }));
    }

    return landscapeShapeLists;
  }

  private _getBoardTiles(variant: LandscapeShape): BoardTile[] {
    return variant.baseShape.filledCells.map((cell) => {
      const { isHeroStar } = getHeroInformation(variant, cell);

      return {
        position: { x: cell.x, y: cell.y },
        landscape: isHeroStar ? undefined : variant.type,
        heroStar: isHeroStar,
        monsterType: variant.monsterType,
      };
    });
  }

  private _getCoordinatesAfterHeroTransformation(
    previousHeroPosition: Coordinates | undefined,
    newHeroPosition: Coordinates | undefined,
    currentMovePosition: Coordinates = this.move.position,
  ): Coordinates {
    if (previousHeroPosition) {
      if (newHeroPosition) {
        return {
          x: currentMovePosition.x + (previousHeroPosition.x - newHeroPosition.x),
          y: currentMovePosition.y + (previousHeroPosition.y - newHeroPosition.y),
        };
      }
    }

    return this.move.position;
  }
}
