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

export function getUserName() {
  if (typeof window === 'undefined') {
    return '';
  }

  let userName = getLocalStorageItem(LocalStorageKey.USER_NAME) || '';
  if (!userName) {
    userName = prompt('Please enter your name') || 'Anonymous';
    setLocalStorageItem(LocalStorageKey.USER_NAME, userName);
  }
  return userName;
}
