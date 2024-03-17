import { useEffect, useState } from "react"
import { getGroupByID } from "../../service/group"
import { Group } from "./JoinedGroup";
import ImageComp from "../imageComp/ImageComp";
import Button from "../button/Button";
import { ref, update } from "firebase/database";
import { useAppContext } from "../../context/appContext";
import { db } from "../../config/config-firebase";
import { sendParticipantToken } from "../../service/video-audio-calls";

export default function GroupInvites({groupId}:{groupId:string}) {
    const {userData}=useAppContext();
    const [group, setGroup] = useState<Group>({}as any);
    useEffect(() => {
        getGroupByID(groupId).then(setGroup)
    }, [groupId])
console.log('GroupInvites')
const acceptGroupRequest=()=>{
    update(ref(db, `users/${userData.username}/groupInvitation`),{[groupId]:null});
    update(ref(db, `groups/${groupId}/members`),{[userData.username]:true,status:'online',id:userData.id});
    update(ref(db, `users/${userData.username}/groups`),{[groupId]:{title:group.title,image:group.image}});
    const member={username:userData.username,id:userData.uid , status:'online'};
    sendParticipantToken(group.room,member,groupId);
}
    return (
        <div className="group-invites">
            <ImageComp className="group-img" unique={groupId} type='group'/>
            <h4>{group.title}</h4>
            <Button onClick={acceptGroupRequest}>Accept</Button>
            <Button onClick={()=>{}}>Decline</Button>
        </div>
    )
}
