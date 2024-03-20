import { get, push, ref, remove, update } from "firebase/database";
import { db } from "../config/config-firebase";


/**
 * Combines the IDs of two users to create a unique chat ID.
 * The IDs are sorted alphabetically and concatenated together.
 * 
 * @param currentUser - The ID of the current user.
 * @param user2 - The ID of the second user.
 * @returns The combined chat ID.
 */
export const commbineId = (currentUser: string, user2: string) => {
  const chatId=[currentUser, user2].sort().join('');
  return chatId;
};

/**
 * Retrieves the friend requests for a given user.
 * @param username - The username of the user.
 * @returns A Promise that resolves to an array of friend requests, or an empty array if no friend requests exist.
 */
export const friendRequests = async (username: string | undefined) => {
  const snapshot = await get(ref(db, `/users/${username}/friendRequests`));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return [];
};

/**
 * Accepts a friend request from the current user to the friend user.
 * 
 * @param currentUser - The current user object containing the username and uid.
 * @param friendUser - The friend user object containing the username, id, and uid.
 * @returns void
 */
export const acceptFriendRequest = async (currentUser: { username: string, uid: string, }, friendUser: { username: string, id:string, uid: string }) => {
  update(ref(db, `/users/${currentUser.username}/friends/${friendUser.username}`),{uid: friendUser.uid, username: friendUser.username});
  remove(ref(db,`users/${currentUser.username}/friendsRequest/${friendUser.id}`));
  update(ref(db, `/users/${friendUser.username}/friends/${currentUser.username}`),{uid: currentUser.uid, username: currentUser.username});
};

/**
 * Rejects a friend request from the current user to the friend user.
 * 
 * @param currentUser - The current user object containing the username and UID.
 * @param friendUser - The friend user object containing the username, ID, and UID.
 * @returns A Promise that resolves when the friend request is rejected.
 */
export const rejectFriendRequest = async (currentUser: { username: string, uid: string }, friendUser: { username: string, id:string, uid: string }) => {
  remove(ref(db, `/users/${currentUser.username}/friendsRequest/${friendUser.id}`));
};

// export const removeFriend = async (currentUser: { username: string, uid: string }, friendUser: { username: string, id:string, uid: string }) => {
//     remove(ref(db, `/users/${currentUser.username}/friends/${friendUser.username}`));
//     remove(ref(db, `/users/${friendUser.username}/friends/${currentUser.username}`));
// }

/**
 * Retrieves the messages for a given chat ID.
 * @param chatID - The ID of the chat.
 * @returns An array of messages for the chat.
 */
export const getMessages = async (chatID: string) => {
  const snapshot = await get(ref(db, `chat/${chatID}/messages`));
  if (!snapshot.exists()) {
    return [];
  }
  const messages = Object.keys(snapshot.val()).map(key => ({
    id: key,
    ...snapshot.val()[key]
  }));
  return messages;
};

/**
 * Retrieves the owners of a chat based on the provided chat ID.
 * @param chatID - The ID of the chat.
 * @returns A Promise that resolves to an array of chat owners, or an empty array if the chat does not exist.
 */
export const chatOwners = async (chatID: string) => {
  const snapshot = await get(ref(db, `chat/${chatID}`));
  if (!snapshot.exists()) {
    return [];
  }
  return snapshot.val();
};

/**
 * Sends a message to a chat.
 * @param chatID - The ID of the chat.
 * @param message - The message to be sent.
 * @param otherPersonUsername - The username of the other person in the chat.
 */
export const sendMessage = (chatID: string, message: { author: string|any, createdOn: number, content: string,files:[]|any,type:string },otherPersonUsername:string) => {
  push(ref(db, `/chats/${chatID}/messages`), message);
  update(ref(db,`/users/${otherPersonUsername}/privateNotifications/${chatID}`),{lastMessage:message.content,lastMessageTime:message.createdOn});
};



