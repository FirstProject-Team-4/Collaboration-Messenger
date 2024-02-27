import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/config-firebase';

/**
 * Registers a user with the provided email and password.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns A promise that resolves when the user is successfully registered.
 */
export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Logs in a user with the provided email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves to the user's authentication information.
 */
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logs out the user.
 * @returns A promise that resolves when the user is successfully logged out.
 */
export const logoutUser = () => {
  return signOut(auth);
};