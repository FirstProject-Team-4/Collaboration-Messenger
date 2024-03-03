import { useEffect, useState } from "react"
import './group-components.css'
import ImageComp from "../imageComp/ImageComp";
export interface MembersProps{
    username:string;
    status:string;
}

export default function GroupMembers({members , owner}: { members: MembersProps[] , owner:string}) {
    console.log(members);
    const [onlineMembers, setOnlineMembers] = useState<MembersProps[]>([]);
    const [offlineMembers, setOfflineMembers] = useState<MembersProps[]>([]);
    useEffect(() => {
   console.log(members);
        const online = members.filter((member) => member.status === 'online');
        const offline = members.filter((member) => member.status === 'offline');
        setOnlineMembers(online);
        setOfflineMembers(offline);
    }, [members]);
console.log(onlineMembers);
console.log(offlineMembers);
    return (
        <div>
            <h5>{`Online:${onlineMembers.length}`}</h5>
            {onlineMembers.map((member,index) => {
                    return <div key={index} className="group-members">
                    <ImageComp unique={member.username} type={'user'}/>
                    <h5>{member.username===owner&&`${member.username}(owner)`}</h5>
                    <h5>{member.username!==owner&&member.username}</h5>
                    </div>
            })}
            <h5>{`Offline:${offlineMembers.length}`}</h5>
            {offlineMembers.map((member,index) => {
                    return <div key={index} className="group-members">
                    <ImageComp unique={member.username} type={'user'}/>
                    <h5>{member.username===owner&&`${member.username}(owner)`}</h5>
                    <h5>{member.username!==owner&&member.username}</h5>
                    </div>
            })}
        </div>
    )
}