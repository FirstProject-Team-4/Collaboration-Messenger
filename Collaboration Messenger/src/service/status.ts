import { onDisconnect, ref, update } from "firebase/database";
import { db } from "../config/config-firebase";

export const toggleStatus = async (userData: any) => {
    if (!userData.username) {
        return;
    }
    const groups = userData.groups ? Object.keys(userData.groups) : []
    const friends = userData.friends ? Object.keys(userData.friends) : []
    update(ref(db, `users/${userData.username}`), { status: 'online' });
    onDisconnect(ref(db, `users/${userData.username}`)).update({ status: 'offline' });
    groups.forEach(id => {
        update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'online' });
        onDisconnect(ref(db, `groups/${id}/members/${userData.username}`)).update({ status: 'offline' });
    })
    friends.forEach(friend => {
        update(ref(db, `users/${friend}/friends/${userData.username}`), { status: 'online' });
        onDisconnect(ref(db, `users/${friend}/friends/${userData.username}`)).update({ status: 'offline' });
    })
}