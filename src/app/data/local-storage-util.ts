export enum LocalStorageKey {
  USER_ID = 'userId',
  USER_NAME = 'userName',
  MY_GAMES = 'myGames',
}

export function getLocalStorageItem(key: LocalStorageKey): string {
  if (typeof localStorage === 'undefined') {
    return '';
  }

  return localStorage.getItem(key) || '';
}

export function setLocalStorageItem(key: LocalStorageKey, value: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, value);
}
