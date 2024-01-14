import { generateId } from '../../utils/general-util';
import { getLocalStorageItem, LocalStorageKey, setLocalStorageItem } from './local-storage-util';

export function getCurrentUserId() {
  let userId = getLocalStorageItem(LocalStorageKey.USER_ID) || '';
  if (!userId) {
    userId = generateId();
    setLocalStorageItem(LocalStorageKey.USER_ID, userId);
  }
  return userId;
}

export function getUserName(alwaysPrompt: boolean = false): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let userName = getLocalStorageItem(LocalStorageKey.USER_NAME) || '';
  if (!userName || alwaysPrompt) {
    userName = prompt('Please enter your name', userName) || 'Anonymous';
    setLocalStorageItem(LocalStorageKey.USER_NAME, userName);
  }
  return userName;
}

export function getMyGames(): string[] {
  const myGames = getLocalStorageItem(LocalStorageKey.MY_GAMES);
  return myGames ? myGames.split(',') : [];
}

export function addGameToMyGames(gameId: string): void {
  const myGames = getMyGames();
  if (!myGames.includes(gameId)) {
    myGames.push(gameId);
    setLocalStorageItem(LocalStorageKey.MY_GAMES, myGames.join(','));
  }
}
