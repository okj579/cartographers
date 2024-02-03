export function generateId() {
  return Math.random().toString(36).replace('0.', '');
}

export function getGameId(id: string): string {
  return `game.${id}`;
}

export function getPlayerMovesId(gameId: string, playerId: string): string {
  return `game.${gameId}.player.${playerId}.moves`;
}
