import { push, ref, update, orderByChild, equalTo, query,get } from "firebase/database"
import { db } from "../config/config-firebase"


export const createGroup=(currentGroup:{title:string,description:string,type:string,image:string,members:never[],createdOn:number,owner:string|undefined})=>{
    const newGroupId=  push(ref(db, `groups/`), currentGroup);
    update(ref(db, `users/${currentGroup.owner}/groups/${newGroupId.key}`), {title:currentGroup.title, image:currentGroup.image});
}
export const getGroupByID=(id:string)=>{
    const snapshot= ref(db, `groups/${id}`);
    return snapshot;
}
export const getGroupsByUser= async(username:string)=>{
    const snapshot= await get(ref(db, `users/${username}/groups`));
    if(!snapshot.exists()){
        return [];
    }
    return Object.keys(snapshot.val()).map((key)=>{
        return{
            id:key,
            ...snapshot.val()[key]
        }
    })
}

export const getPrivateGroups=()=>{
    const groupsRef = ref(db, 'groups/');
const privateGroupsQuery = query(groupsRef, orderByChild('type'), equalTo('private'));
return privateGroupsQuery;
}

export const getPublicGroups=async()=>{
    const groupsRef = ref(db, 'groups/');
const publicGroupsQuery = await get(query(groupsRef, orderByChild('type'), equalTo('public')));
if(!publicGroupsQuery.exists()){
    return [];
}
return Object.keys(publicGroupsQuery.val()).map((key)=>{
    return{
        id:key,
        ...publicGroupsQuery.val()[key]
    }
});

}