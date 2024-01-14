import { Injectable, NgZone } from '@angular/core';
import { $fetch } from 'ofetch';
import { GameState, PlayerGameState } from '../models/game-state';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _ngZone: NgZone) {}

  getGame(gameId: string): Promise<GameState> {
    return this._ngZone.run(() => $fetch(`/api/game/${gameId}`));
  }

  updateGame(gameId: string, playerState: PlayerGameState): Promise<GameState> {
    return this._ngZone.run(() =>
      $fetch(`/api/game/${gameId}`, {
        method: 'PATCH',
        body: playerState,
      }),
    );
  }

  createGame(gameId: string, gameState: GameState): Promise<GameState> {
    return this._ngZone.run(() =>
      $fetch(`/api/game/${gameId}`, {
        method: 'POST',
        body: gameState,
      }),
    );
  }

  getGames(): Promise<string[]> {
    return this._ngZone.run(() => $fetch('/api/games'));
  }
}
