import { Component, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../api.service';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { getMyGames } from '../data/util';

@Component({
  standalone: true,
  templateUrl: './index.page.html',
  styleUrl: './index.page.scss',
  imports: [NgForOf, RouterLink, NgIf],
})
export default class HomePageComponent {
  myGames: WritableSignal<string[]> = signal([]);

  private _myGames: string[] = getMyGames();
  private _allGameIds: string[] = [];

  constructor(
    private _api: ApiService,
    private _router: Router,
  ) {
    this._api
      .getGames()
      .then((games) => {
        this._allGameIds = games;
        const filteredGames = games.filter((gameId) => this._myGames.includes(gameId)).reverse();
        this.myGames.set(filteredGames);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  joinRandomGame(): void {
    const notMyGames = this._allGameIds.filter((gameId) => !this._myGames.includes(gameId));

    if (notMyGames.length === 0) {
      void this._router.navigate(['game', 'new']);
    }
    const randomGameId = notMyGames[Math.floor(Math.random() * notMyGames.length)];
    void this._router.navigate(['game', randomGameId]);
  }
}
