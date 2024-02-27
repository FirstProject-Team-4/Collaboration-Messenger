import { get, set, ref, query, equalTo, orderByChild } from 'firebase/database'
import { db } from '../config/config-firebase'

export const getUserByUsername = async (username: string) => {
  return await get(ref(db, `users/${username}`))
};

export const createUserUsername = async (username: string, uid: string, email: string) => {
  await set(ref(db, `users/${username}`), { username, email, uid, phoneNumber: 'None', activity: 'string', notifications: '', createdOn: new Date().valueOf() })
};

export const getUserData = async (uid: string) => {
  return await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)))
};

export const getAllUsers = async () => {
  const snapshot = await get(query(ref(db, 'users')))
  if (!snapshot.exists()) {
    return [];
  }

  const users = Object.keys(snapshot.val()).map(key => ({
    id: key,
    ...snapshot.val()[key],
    createdOn: new Date(snapshot.val()[key].createdOn).toString(),
    imageUrl: snapshot.val().imageUrl
  }))    


  return users;
}
