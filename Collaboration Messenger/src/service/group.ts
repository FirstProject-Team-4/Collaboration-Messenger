import { push, ref, update, orderByChild, equalTo, query,get, remove } from "firebase/database";
import { db } from "../config/config-firebase";
import { MembersProps } from "../components/group-components/GroupMembers";
import { createDyteRoom, sendParticipantToken } from "./video-audio-calls";
import { Group } from "../components/group-components/JoinedGroup";

/**
 * Creates a new group.
 * @param currentGroup - The current group object containing title, description, type, image, members, createdOn, and owner.
 * @param userData - The user data object containing the user ID.
 */
export const createGroup= async(currentGroup:{title:string,description:string,type:string,image:string,members:never[],createdOn:number,owner:string},userData:{uid:string})=>{
  const newGroupId= await push(ref(db, `groups/`), currentGroup);
  update(ref(db,`groups/${newGroupId.key}/members`), {[currentGroup?.owner]:{status:'online',id:userData.uid}});
  update(ref(db, `users/${currentGroup.owner}/groups/${newGroupId.key}`), {title:currentGroup.title, image:currentGroup.image});
  const member={username:currentGroup.owner,id:userData.uid , status:'online'};
  const group={id:newGroupId.key,title:currentGroup.title};
  const dyteRoomData=await createDyteRoom(member,group);
  update(ref(db, `groups/${newGroupId.key}`), {room:{id:dyteRoomData.id}});
  sendParticipantToken(dyteRoomData, member,newGroupId.key);
};

/**
 * Retrieves a group by its ID.
 * @param id - The ID of the group to retrieve.
 * @returns A Promise that resolves to the group object if it exists, or undefined if it doesn't.
 */
export const getGroupByID=async(id:string)=>{
  const snapshot=await get(ref(db, `groups/${id}`));
  if(!snapshot.exists()){
    return;
  }
    
  return{
    id:id,
    ...snapshot.val()
  };
   
};

/**
 * Retrieves the groups associated with a user.
 * @param username - The username of the user.
 * @returns An array of groups associated with the user.
 */
export const getGroupsByUser= async(username:string)=>{
  const snapshot= await get(ref(db, `users/${username}/groups`));
  if(!snapshot.exists()){
    return [];
  }
  return Object.keys(snapshot.val()).map((key)=>{
    return{
      id:key,
      ...snapshot.val()[key]
    };
  });
};

/**
 * Retrieves a query for private groups from the database.
 * @returns {Query} The query for private groups.
 */
export const getPrivateGroups=()=>{
  const groupsRef = ref(db, 'groups/');
  const privateGroupsQuery = query(groupsRef, orderByChild('type'), equalTo('private'));
  return privateGroupsQuery;
};

/**
 * Retrieves public groups from the database.
 */
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
    };
  });

};

/**
 * Invites a user to a group.
 * 
 * @param groupId - The ID of the group to invite the user to.
 * @param username - The username of the user to invite.
 */
export const inviteToGroup= async(groupId:string,username:string)=>{
    
  const snapshot=await get(ref(db, `users/${username}/groups/${groupId}`));
  const snapshot2=await get(ref(db, `users/${username}/groupInvitation/${groupId}`));
  if(snapshot.exists() || snapshot2.exists()){
    return;
  }
  update(ref(db, `users/${username}/groupInvitation/`), {[groupId]:true});
};

/**
 * Retrieves the members of a group from the database.
 * @param groupId - The ID of the group.
 * @returns A promise that resolves to an array of MembersProps objects representing the group members.
 */
export const getGroupMembers=async(groupId:string):Promise<MembersProps[]>=>{
  const snapshot=await get(ref(db, `groups/${groupId}/members`));
  if(!snapshot.exists()){
    return [];
  }
  return Object.keys(snapshot.val()).map((key)=>{
    return{
      username:key,
      ...snapshot.val()[key]
    };
  });
    
};

/**
 * Removes a member from a group.
 * 
 * @param {string} groupId - The ID of the group.
 * @param {string} username - The username of the member to be removed.
 * @returns {Promise<void>} - A promise that resolves when the member is successfully removed from the group.
 */
export const removeGroupMember=async(groupId:string,username:string)=>{
  remove(ref(db, `groups/${groupId}/members/${username}`));
  remove(ref(db, `users/${username}/groups/${groupId}`));
};

/**
 * Joins a group and performs necessary updates.
 * @param group - The group to join.
 * @param userData - The user data containing the username and UID.
 */
export const joinGroup=async(group:Group,userData:{username:string,uid:string})=>{
  update(ref(db, `groups/${group.id}/members/${userData.username}`), {status:'online',id:userData.uid});
  update(ref(db, `users/${userData.username}/groups/${group.id}`), {title:group.title, image:group.image?group.image:''});
  remove(ref(db, `users/${userData.username}/groupInvitation/${group.id}`));
  const member={username:userData.username,id:userData.uid , status:'online'};
  sendParticipantToken(group.room,member,group.id);
};

/**
 * Sends a message to a group and notifies its members.
 * @param groupId - The ID of the group to send the message to.
 * @param message - The message to send.
 */
export const sendGroupMessage=async(groupId:string,message:{})=>{
  const group=await getGroupByID(groupId);
  const members=Object.keys(group?.members);
  members.forEach((member:any)=>{
    push(ref(db, `users/${member}/groupNotifications/${groupId}`), message);
  });
  push(ref(db, `groups/${groupId}/messages`), message);
};
