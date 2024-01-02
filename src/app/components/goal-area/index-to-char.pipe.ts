import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indexToChar',
  standalone: true,
})
export class IndexToCharPipe implements PipeTransform {
  transform(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
