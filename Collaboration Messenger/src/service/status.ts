import { onDisconnect, ref, update } from "firebase/database";
import { db } from "../config/config-firebase";

/**
 * Toggles the status of a user and updates the status in the database.
 * @param userData - The user data object.
 */
export const toggleStatus = async (userData: any) => {
  if (!userData.username) {
    return;
  }
  const groups = userData.groups ? Object.keys(userData.groups) : [];
  // const friends = userData.friends ? Object.keys(userData.friends) : [];
  update(ref(db, `users/${userData.username}`), { status: 'online' });
  onDisconnect(ref(db, `users/${userData.username}`)).update({ status: 'offline' });
  groups.forEach(id => {
    update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'online' });
    onDisconnect(ref(db, `groups/${id}/members/${userData.username}`)).update({ status: 'offline' });
  });
  // friends.forEach(friend => {
  //   update(ref(db, `users/${friend}/friends/${userData.username}`), { status: 'online' });
  //   onDisconnect(ref(db, `users/${friend}/friends/${userData.username}`)).update({ status: 'offline' });
  // });
};

/**
 * Sets the status of a user to "busy" and updates the status of their groups and friends.
 * @param userData - The user data object.
 */
export const setStatusToBusy = async (userData: any) => {
  if (!userData.username) {
    return;
  }
  const groups = userData.groups ? Object.keys(userData.groups) : [];
  // const friends = userData.friends ? Object.keys(userData.friends) : [];
  update(ref(db, `users/${userData.username}`), { status: 'busy' });
  onDisconnect(ref(db, `users/${userData.username}`)).update({ status: 'offline' });
  groups.forEach(id => {
    update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'busy' });
    onDisconnect(ref(db, `groups/${id}/members/${userData.username}`)).update({ status: 'offline' });
  });
  // friends.forEach(friend => {
  //   update(ref(db, `users/${friend}/friends/${userData.username}`), { status: 'busy' });
  //   onDisconnect(ref(db, `users/${friend}/friends/${userData.username}`)).update({ status: 'offline' });
  // });
};

/**
 * Changes the status of a user to "away" in the database.
 * 
 * @param userData - The user data object.
 * @returns A promise that resolves when the status is updated.
 */
export const changeStatusToAway = async (userData: any) => {
  if (!userData.username) {
    return;
  }
  const groups = userData.groups ? Object.keys(userData.groups) : [];
  // const friends = userData.friends ? Object.keys(userData.friends) : [];
  update(ref(db, `users/${userData.username}`), { status: 'away' });
  groups.forEach(id => {
    update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'away' });
  });
  // friends.forEach(friend => {
  //   update(ref(db, `users/${friend}/friends/${userData.username}`), { status: 'away' });
  // });
};

/**
 * Updates the status of a user to online.
 * 
 * @param userData - The user data object.
 * @returns A Promise that resolves when the status is updated.
 */
export const updateStatusToOnline = async (userData: any) => {
  if (!userData.username) {
    return;
  }
  const groups = userData.groups ? Object.keys(userData.groups) : [];
  // const friends = userData.friends ? Object.keys(userData.friends) : [];
  update(ref(db, `users/${userData.username}`), { status: 'online' });
  groups.forEach(id => {
    update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'online' });
  });
  // friends.forEach(friend => {
  //   update(ref(db, `users/${friend}/friends/${userData.username}`), { status: 'online' });
  // });
};