import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { GameBoardComponent } from '../../components/game-board/game-board.component';
import { NextShapeComponent } from '../../components/next-shape/next-shape.component';
import { NgForOf, NgIf } from '@angular/common';
import { GoalAreaComponent } from '../../components/goal-area/goal-area.component';
import { SeasonInfoComponent } from '../../components/season-info/season-info.component';
import { SeasonGoalsComponent } from '../../components/season-goals/season-goals.component';
import { GameState, Player } from '../../../models/game-state';
import { addPlayer, createNewGame, findPlayerIndex, updatePlayerState } from '../../../game-logic/game-state-functions';
import { GameSetupInfoComponent } from '../../components/game-setup-info/game-setup-info.component';
import { addGameToMyGames, getCurrentUserId, getUserName } from '../../data/util';
import { ApiService } from '../../api.service';
import { generateId } from '../../../utils/general-util';
import { Router } from '@angular/router';
import { GameViewComponent } from '../../components/game-view/game-view.component';

@Component({
  selector: 'app-game-page',
  standalone: true,
  template: `
    <ng-container *ngIf="gameState() as currentGameState">
      <app-game-view
        [gameState]="currentGameState"
        [playerIdToShow]="playerToShowId"
        (gameStateChange)="triggerGameStateSync($event)"
        (backToMyGame)="playerToShowId = currentPlayerId"
      />
    </ng-container>

    <div *ngIf="allPlayers.length > 1" class="server-actions">
      <div>All players</div>
      <button
        *ngFor="let player of allPlayers"
        [disabled]="playerToShowId === player.id"
        class="secondary"
        (click)="playerToShowId = player.id"
      >
        {{ player.id === currentPlayerId ? '[Me]' : player.name }}
      </button>
    </div>

    <div class="server-actions">
      <span *ngIf="isOnlineGame">synced</span>
      <span *ngIf="!isOnlineGame">local game</span>
      <button [disabled]="isAutoSync()" (click)="syncGame()">
        <i *ngIf="!isSyncing()" class="fa-solid fa-cloud-arrow-up"></i>
        <i *ngIf="isSyncing()" class="fa-spin fa-solid fa-spinner"></i>
        <span *ngIf="isAutoSync()">Auto Sync</span>
        <span *ngIf="!isAutoSync()">Save game</span>
      </button>
      <button (click)="goHome()">
        <i class="fa-solid fa-home"></i>
        Back to home
      </button>
    </div>
  `,
  styles: `
:host {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--gap-16);
  box-sizing: border-box;
}

.server-actions {
  padding: var(--gap-16);
  display: flex;
  gap: var(--gap-16);
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;

  > span {
    font-style: italic;
  }
}

@media (max-width: 600px) {
  :host {
    padding-bottom: 80px; // to account for the submit button
  }
}
  `,
  imports: [
    GameBoardComponent,
    NextShapeComponent,
    NgIf,
    GoalAreaComponent,
    SeasonInfoComponent,
    SeasonGoalsComponent,
    NgForOf,
    GameSetupInfoComponent,
    GameViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GameIdPage implements OnInit {
  @Input() gameId: string | undefined;

  readonly currentPlayerId: string = getCurrentUserId();
  playerToShowId: string = this.currentPlayerId;

  gameState: WritableSignal<GameState | undefined> = signal(undefined);

  get isOnlineGame(): boolean {
    return this.gameId !== 'new';
  }

  isSyncing: WritableSignal<boolean> = signal(false);
  isAutoSync: WritableSignal<boolean> = signal(false);

  get allPlayers(): Player[] {
    return this.gameState()?.playerStates.map((playerState) => playerState.player) ?? [];
  }

  constructor(
    private _api: ApiService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
  ) {}

  ngOnInit() {
    if (this.isOnlineGame) {
      this.loadGame();
    } else {
      this.gameState.set(createNewGame());
    }
  }

  async triggerGameStateSync(newGameState: GameState): Promise<void> {
    this.gameState.set(newGameState);

    if (this.isOnlineGame) {
      this.isAutoSync.set(true);
      await this.syncGame(newGameState);
      this.isAutoSync.set(false);
    }
  }

  async syncGame(gameState: GameState | undefined = this.gameState()): Promise<void> {
    if (!gameState) return;

    const currentPlayerState = gameState.playerStates[findPlayerIndex(gameState.playerStates, this.currentPlayerId)];
    if (!currentPlayerState) {
      console.error('Could not find current player state');
      return;
    }

    this.isSyncing.set(true);
    if (this.isOnlineGame && this.gameId) {
      this.gameState.set(await this._api.updateGame(this.gameId, currentPlayerState));
    } else {
      this.gameId = generateId();
      const onlineUserName = getUserName(true);
      const stateToPersist = updatePlayerState(gameState, {
        ...currentPlayerState,
        player: { id: this.currentPlayerId, name: onlineUserName },
      });
      this.gameState.set(await this._api.createGame(this.gameId, stateToPersist));
      addGameToMyGames(this.gameId);
      void this._router.navigate(['game', this.gameId], { replaceUrl: true });
    }
    this.isSyncing.set(false);
    this._cdr.detectChanges(); // todo - why is this needed?
  }

  goHome(): void {
    void this._router.navigate(['']);
  }

  loadGame(): void {
    const gameId = this.gameId ?? prompt(`Enter game id to load`);
    if (!gameId) return;

    void this._api.getGame(gameId).then((gameState) => {
      const currentPlayerIndex = findPlayerIndex(gameState.playerStates, this.currentPlayerId);
      if (currentPlayerIndex > -1) {
        this.gameState.set(gameState);
      } else {
        this.gameState.set(addPlayer(gameState));
      }

      this.gameId = gameId;
      addGameToMyGames(gameId);
    });
  }
}
