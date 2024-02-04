import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appGoalHighlighter]',
  standalone: true,
  host: {
    'style.cursor': 'pointer',
  },
})
export class GoalHighlighterDirective {
  @Input({ required: true, alias: 'appGoalHighlighter' }) index: number = 0;

  @Output() goalHover = new EventEmitter<number>();

  @HostListener('mouseover', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseEnter(event: MouseEvent) {
    event?.preventDefault();

    this.goalHover.emit(this.index);
  }

  @HostListener('mouseout', ['$event'])
  @HostListener('touchend', ['$event'])
  onMouseLeave(event: MouseEvent) {
    event?.preventDefault();

    this.goalHover.emit(-1);
  }
}
