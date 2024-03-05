import { get, push, ref, remove, update } from "firebase/database"
import { db } from "../config/config-firebase"


export const commbineId = (currentUser: string, user2: string) => {
    const chatId=[currentUser, user2].sort().join('');
    return chatId;
}

export const friendRequests = async (username: string | undefined) => {
    const snapshot = await get(ref(db, `/users/${username}/friendRequests`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return [];
}

export const acceptFriendRequest = async (currentUser: { username: string, uid: string, }, friendUser: { username: string, id:string, uid: string }) => {
    update(ref(db, `/users/${currentUser.username}/friends/${friendUser.username}`),{uid: friendUser.uid, username: friendUser.username});
    // update(ref(db, `/users/${currentUser.username}/friendsRequest`), {[friendUser.id]: null});
    remove(ref(db,`users/${currentUser.username}/friendsRequest/${friendUser.id}`));
}

export const rejectFriendRequest = async (currentUser: { username: string, uid: string }, friendUser: { username: string, id:string, uid: string }) => {
    remove(ref(db, `/users/${currentUser.username}/friendsRequest/${friendUser.id}`));
}

export const getMessages = async (chatID: string) => {
    const snapshot = await get(ref(db, `chat/${chatID}/messages`));
    if (!snapshot.exists()) {
        return [];
    }
    const messages = Object.keys(snapshot.val()).map(key => ({
        id: key,
        ...snapshot.val()[key]
    }))
    return messages;
}

export const chatOwners = async (chatID: string) => {
    const snapshot = await get(ref(db, `chat/${chatID}`));
    if (!snapshot.exists()) {
        return [];
    }
    return snapshot.val();
}

export const sendMessage = (chatID: string, message: { author: string, createdOn: number, content: string }) => {
    push(ref(db, `/chats/${chatID}/messages`), message);
}



