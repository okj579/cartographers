import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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

@Component({
  selector: 'app-next-shape',
  standalone: true,
  imports: [BoardTileComponent, NgForOf, NgIf],
  templateUrl: './next-shape.component.html',
  styleUrl: './next-shape.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextShapeComponent {
  @Input({ required: true }) set landscapeCard(card: LandscapeCard) {
    if (this._landscapeCard?.name === card.name) return;
    console.debug('NextShapeComponent.landscapeCard', card);

    this._resetValues();
    this.allVariants = this._getAllVariants(card);
    this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    this._hasDifferentShapes = card.baseShapes.length > 1;
    this._landscapeCard = card;

    setTimeout(() => this.selectVariant(0));
  }

  @Input() untouchedBoardState: BoardTile[][] = [];
  @Input() hasConflict: boolean = false;

  @Output() landscapeShapeChange: EventEmitter<PlacedLandscapeShape> = new EventEmitter<PlacedLandscapeShape>();
  @Output() submit: EventEmitter<PlacedLandscapeShape> = new EventEmitter<PlacedLandscapeShape>();

  protected allVariants: LandscapeShape[] = [];
  protected boardTilesPerVariant: BoardTile[][] = [];

  protected selectedVariant: number = -1;
  protected currentPosition: Coordinates = { x: 0, y: 0 };

  private _hasDifferentShapes: boolean = false;

  private _landscapeCard: LandscapeCard | undefined;

  constructor() {
    this._resetValues();
  }

  get currentMonsterEffect(): MonsterEffect | undefined {
    const monsterType = this.currentVariant?.monsterType;

    return monsterType ? MONSTER_EFFECTS[monsterType] : undefined;
  }

  get currentVariant(): PlacedLandscapeShape | undefined {
    const currentShape = this.allVariants[this.selectedVariant];

    if (!currentShape) return undefined;

    return { ...currentShape, position: this.currentPosition };
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

  @HostListener('window:keydown', ['$event'])
  selectVariantListener(event: KeyboardEvent) {
    try {
      const key = parseInt(event.key);

      if (isNaN(key) || key > this.allVariants.length) return;

      this.selectVariant(key - 1);
    } catch (e) {
      return;
    }
  }

  selectVariant(index: number) {
    this.selectedVariant = index;
    this._emitCurrentVariant();
  }

  @HostListener('window:keydown.Enter', ['$event'])
  @HostListener('window:keydown.Space', ['$event'])
  submitShape(event?: KeyboardEvent) {
    event?.preventDefault();

    if (this.hasConflict || !this.currentVariant) return;

    this.submit.emit(this.currentVariant);
  }

  @HostListener('window:keydown.r', ['$event'])
  @HostListener('window:keydown.e', ['$event'])
  rotateClockwise(shouldEmit: boolean = true) {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    this.allVariants = this.allVariants.map((variant) => ({
      ...rotateLandscapeShapeClockwise(variant),
    }));
    this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    this._updateCoordinatesAfterHeroTransformation(previousHeroPosition);

    if (shouldEmit) this._emitCurrentVariant();
  }

  @HostListener('window:keydown.l', ['$event'])
  @HostListener('window:keydown.q', ['$event'])
  rotateCounterClockwise() {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    this.allVariants = this.allVariants.map((variant) => ({
      ...rotateLandscapeShapeCounterClockwise(variant),
    }));
    this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    this._updateCoordinatesAfterHeroTransformation(previousHeroPosition);

    this._emitCurrentVariant();
  }

  @HostListener('window:keydown.m', ['$event'])
  @HostListener('window:keydown.x', ['$event'])
  flip(shouldEmit: boolean = true) {
    const previousHeroPosition = this.currentVariant?.heroPosition;
    this.allVariants = this.allVariants.map((variant) => ({
      ...flipLandscapeShape(variant),
    }));
    this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    this._updateCoordinatesAfterHeroTransformation(previousHeroPosition);

    if (shouldEmit) this._emitCurrentVariant();
  }

  @HostListener('window:keydown.ArrowUp', ['$event'])
  @HostListener('window:keydown.w', ['$event'])
  moveUp() {
    if (this.disableUp) return;

    this.currentPosition = { ...this.currentPosition, y: this.currentPosition.y - 1 };
    this._emitCurrentVariant();
  }

  @HostListener('window:keydown.ArrowDown', ['$event'])
  @HostListener('window:keydown.s', ['$event'])
  moveDown() {
    if (this.disableDown) return;

    this.currentPosition = { ...this.currentPosition, y: this.currentPosition.y + 1 };
    this._emitCurrentVariant();
  }

  @HostListener('window:keydown.ArrowLeft', ['$event'])
  @HostListener('window:keydown.a', ['$event'])
  moveLeft() {
    if (this.disableLeft) return;

    this.currentPosition = { ...this.currentPosition, x: this.currentPosition.x - 1 };
    this._emitCurrentVariant();
  }

  @HostListener('window:keydown.ArrowRight', ['$event'])
  @HostListener('window:keydown.d', ['$event'])
  moveRight() {
    if (this.disableRight) return;

    this.currentPosition = { ...this.currentPosition, x: this.currentPosition.x + 1 };
    this._emitCurrentVariant();
  }

  findAvailablePosition(): void {
    if (!this.currentVariant) return;

    let findPositionResult: FindPositionResult = findFirstPositionForShape(this.untouchedBoardState, this.currentVariant.baseShape);

    if (!findPositionResult.position && this._hasDifferentShapes) {
      const nextVariant = (this.selectedVariant + 1) % 2;
      this.selectVariant(nextVariant);
      findPositionResult = findFirstPositionForShape(this.untouchedBoardState, this.currentVariant.baseShape);
    }

    this._updateAfterFindingPosition(findPositionResult);
  }

  updatePositionFromOutside(position: Coordinates): void {
    this.currentPosition = { ...position };
    this._emitCurrentVariant();
  }

  private _updateAfterFindingPosition(result: FindPositionResult) {
    if (result.position) {
      this.currentPosition = { ...result.position };

      if (result.isFlipped) {
        this.flip(false);
      }

      for (let i = 0; i < result.numberOfRotations; i++) {
        this.rotateClockwise(false);
      }

      this._emitCurrentVariant();
    } else if (this.currentVariant?.type !== LandscapeType.HERO) {
      this._addPortalCard();
    }
  }

  private _addPortalCard(): void {
    this._resetValues();
    const previousLength = this.allVariants.length;
    this.allVariants = [...this.allVariants, ...this._getAllVariants(getPortalCard(this.currentVariant?.type))];
    this.boardTilesPerVariant = this.allVariants.map((variant) => this._getBoardTiles(variant));
    this._hasDifferentShapes = false;
    this.selectVariant(previousLength);
  }

  private _emitCurrentVariant(): void {
    if (!this.currentVariant) return;

    this.landscapeShapeChange.emit(this.currentVariant);
  }

  private _resetValues(): void {
    this.selectedVariant = -1;
    this.currentPosition = { x: Math.floor(BOARD_SIZE / 2) - 1, y: Math.floor(BOARD_SIZE / 2) - 1 };
  }

  private _getAllVariants(card: LandscapeCard): LandscapeShape[] {
    const landscapeShapes: LandscapeShape[] = [];

    for (let landscapeType of card.landscapeTypes) {
      for (let baseShape of card.baseShapes) {
        landscapeShapes.push({ type: landscapeType, baseShape, heroPosition: card.heroPosition, monsterType: card.monster?.type });
      }
    }

    return landscapeShapes;
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

  private _updateCoordinatesAfterHeroTransformation(previousHeroPosition?: Coordinates): void {
    if (previousHeroPosition) {
      const newHeroPosition = this.currentVariant?.heroPosition;

      if (newHeroPosition) {
        this.currentPosition = {
          x: this.currentPosition.x + (previousHeroPosition.x - newHeroPosition.x),
          y: this.currentPosition.y + (previousHeroPosition.y - newHeroPosition.y),
        };
      }
    }
  }
}
