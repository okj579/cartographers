import { Pipe, PipeTransform } from '@angular/core';
import { Goal, GoalCategory } from '../../../models/goals';

@Pipe({
  name: 'goalEmojis',
  standalone: true,
})
export class GoalEmojisPipe implements PipeTransform {
  transform(goal: Goal): string {
    switch (goal.category) {
      case GoalCategory.VILLAGE:
        return '🏠🏠';
      case GoalCategory.FOREST:
        return '🌳🌳';
      case GoalCategory.FIELD_WATER:
        return '🌾🐟';
      case GoalCategory.GLOBAL:
        return '↔️↕️';
      default:
        return '';
    }
  }
}
