import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameState, PlayerGameState } from '../models/game-state';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  getGame(gameId: string): Promise<GameState> {
    return firstValueFrom(this.http.get<GameState>(`/api/game/${gameId}`));
  }

  updateGame(gameId: string, playerState: PlayerGameState): Promise<GameState> {
    return firstValueFrom(
      this.http.patch<GameState>(`/api/game/${gameId}`, {
        body: playerState,
      }),
    );
  }

  createGame(gameId: string, gameState: GameState): Promise<GameState> {
    return firstValueFrom(
      this.http.post<GameState>(`/api/game/${gameId}`, {
        body: gameState,
      }),
    );
  }

  getGames(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>('/api/games'));
  }
}
