export function generateId() {
  return Math.random().toString(36).replace('0.', '');
}

export function getGameId(id: string): string {
  return `game.${id}`;
}
