import { booleanAttribute, Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appGoalHighlighter]',
  standalone: true,
  host: {
    'style.cursor': 'pointer',
  },
})
export class GoalHighlighterDirective {
  @Input({ required: true, alias: 'appGoalHighlighter' }) index: number = 0;
  @Input({ transform: booleanAttribute }) activateTouchEvents: boolean = false;

  @Output() goalHover = new EventEmitter<number>();

  @HostListener('mouseover', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseOver(event: MouseEvent) {
    if (!this.activateTouchEvents && event instanceof TouchEvent) {
      return;
    }

    event?.preventDefault();

    this.goalHover.emit(this.index);
  }

  @HostListener('mouseout', ['$event'])
  @HostListener('touchend', ['$event'])
  onMouseOut(event: MouseEvent) {
    if (!this.activateTouchEvents && event instanceof TouchEvent) {
      return;
    }

    event?.preventDefault();

    this.goalHover.emit(-1);
  }
}
