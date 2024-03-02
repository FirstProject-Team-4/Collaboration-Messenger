import { ref, update } from "firebase/database";
import { db } from "../config/config-firebase";



export const toggleStatus = async (userData:any) => {
    const groups=userData.groups?Object.keys(userData.groups):[]
    const handleBeforeUnload = () => {
        update(ref(db, `users/${userData.username}`), { status:'offline'});
        groups.forEach(id=>{
            update(ref(db, `groups/${id}/members/${userData.username}`), { status:'offline'});
        })
      };
  
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      update(ref(db, `users/${userData.username}`), { status:'online'});
        groups.forEach(id=>{
            update(ref(db, `groups/${id}/members/${userData.username}`), { status:'online'});
        })
}