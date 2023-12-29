import { Component } from '@angular/core';
import { GameBoardComponent } from '../components/game-board/game-board.component';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <h2>Cartographers</h2>

    <app-game-board />
  `,
  styles: [
    `
      app-game-board {
        margin: 32px auto;
      }
    `,
  ],
  imports: [GameBoardComponent],
})
export default class HomeComponent {
  count = 0;

  increment() {
    this.count++;
  }
}
