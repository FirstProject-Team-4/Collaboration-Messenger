import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database';
import { db } from '../config/config-firebase';

/**
 * Retrieves a user object from the database based on the provided username.
 * @param username - The username of the user to retrieve.
 * @returns A Promise that resolves to the user object.
 */
export const getUserByUsername = async (username: string) => {
  return await get(ref(db, `users/${username}`));
};

/**
 * Creates a user with the specified username, uid, and email.
 * @param username - The username of the user.
 * @param uid - The unique identifier of the user.
 * @param email - The email address of the user.
 */
export const createUserUsername = async (username: string, uid: string, email: string) => {
  await set(ref(db, `users/${username}`), { username, email, uid, phoneNumber: 'None', activity: 'string', notifications: '', createdOn: new Date().valueOf() });
};

/**
 * Retrieves user data from the database based on the provided user ID.
 * @param uid - The user ID to retrieve data for.
 * @returns A Promise that resolves to the user data.
 */
export const getUserData = async (uid: string) => {
  return await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

/**
 * Retrieves all users from the database.
 * @returns {Promise<Array<User>>} A promise that resolves to an array of users.
 */
export const getAllUsers = async () => {
  const snapshot = await get(query(ref(db, 'users')));
  if (!snapshot.exists()) {
    return [];
  }

  const users = Object.keys(snapshot.val()).map(key => ({
    id: key,
    ...snapshot.val()[key],
    createdOn: new Date(snapshot.val()[key].createdOn).toString(),
  }));    


  return users;
};
