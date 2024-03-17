import { push, ref, update, orderByChild, equalTo, query,get, remove } from "firebase/database"
import { db } from "../config/config-firebase"
import { MembersProps } from "../components/group-components/GroupMembers";
import { useAppContext } from "../context/appContext";
import { createDyteRoom, sendParticipantToken } from "./video-audio-calls";
import { Group } from "../components/group-components/JoinedGroup";

export const createGroup= async(currentGroup:{title:string,description:string,type:string,image:string,members:never[],createdOn:number,owner:string},userData:{uid:string})=>{
    console.log(currentGroup);
    console.log(userData)
    const newGroupId= await push(ref(db, `groups/`), currentGroup);
    update(ref(db,`groups/${newGroupId.key}/members`), {[currentGroup?.owner]:{status:'online',id:userData.uid}});
    update(ref(db, `users/${currentGroup.owner}/groups/${newGroupId.key}`), {title:currentGroup.title, image:currentGroup.image});
    const member={username:currentGroup.owner,id:userData.uid , status:'online'};
    const group={id:newGroupId.key,title:currentGroup.title};
     const dyteRoomData=await createDyteRoom(member,group);
     console.log(dyteRoomData);
        update(ref(db, `groups/${newGroupId.key}`), {room:{id:dyteRoomData.id}});
        sendParticipantToken(dyteRoomData, member,newGroupId.key);
}
export const getGroupByID=async(id:string)=>{
    const snapshot=await get(ref(db, `groups/${id}`));
    if(!snapshot.exists()){
        return;
    }
    
        return{
            id:id,
            ...snapshot.val()
        }
   
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
console.log(1);
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
export const inviteToGroup= async(groupId:string,username:string)=>{
    
    const snapshot=await get(ref(db, `users/${username}/groups/${groupId}`));
    const snapshot2=await get(ref(db, `users/${username}/groupInvitation/${groupId}`));
    if(snapshot.exists() || snapshot2.exists()){
        return;
    }
    update(ref(db, `users/${username}/groupInvitation/`), {[groupId]:true});
}
export const getGroupMembers=async(groupId:string):Promise<MembersProps[]>=>{
    const snapshot=await get(ref(db, `groups/${groupId}/members`));
    if(!snapshot.exists()){
        return [];
    }
    return Object.keys(snapshot.val()).map((key)=>{
        return{
            username:key,
            ...snapshot.val()[key]
        }
    })
    
}
export const removeGroupMember=async(groupId:string,username:string)=>{
    remove(ref(db, `groups/${groupId}/members/${username}`));
    remove(ref(db, `users/${username}/groups/${groupId}`));
}
export const joinGroup=async(group:Group,userData:{username:string,uid:string})=>{
    update(ref(db, `groups/${group.id}/members/${userData.username}`), {status:'online',id:userData.uid});
    update(ref(db, `users/${userData.username}/groups/${group.id}`), {title:group.title, image:group.image?group.image:''});
    remove(ref(db, `users/${userData.username}/groupInvitation/${group.id}`));
    const member={username:userData.username,id:userData.uid , status:'online'};
    sendParticipantToken(group.room,member,group.id);
}
export const sendGroupMessage=(groupId:string,message:{})=>{
    push(ref(db, `groups/${groupId}/messages`), message);
}