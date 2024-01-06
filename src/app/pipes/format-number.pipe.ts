import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: number = 0): string {
    return value < 0 ? value.toString() : '+' + value.toString();
  }
}
