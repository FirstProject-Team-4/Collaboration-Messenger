import { useEffect, useState } from "react"
import ImageComp from "../imageComp/ImageComp";
import './group-components.css'

export interface MembersProps{
    username:string;
    status:string;
    id:string;
}

/**
 * Renders a component that displays the group members and their online/offline status.
 * @param members - An array of member objects.
 * @param owner - The username of the owner of the group.
 * @returns The rendered component.
 */
export default function GroupMembers({ members, owner }: { members: MembersProps[], owner: string }) {

    const [onlineMembers, setOnlineMembers] = useState<MembersProps[]>([]);
    const [offlineMembers, setOfflineMembers] = useState<MembersProps[]>([]);

    useEffect(() => {
        // Filter the members based on their online/offline status
        const online = members.filter((member) => member.status !== 'offline');
        const offline = members.filter((member) => member.status === 'offline');

        // Update the state with the filtered members
        setOnlineMembers(online);
        setOfflineMembers(offline);
    }, [members]);

    return (
        <div>
            <h5>{`Online:${onlineMembers.length}`}</h5>
            {onlineMembers.map((member, index) => {
                return (
                    <div key={index} className="group-members">
                        <ImageComp className='group-members-img' unique={member} type={'user'} />
                        <h5>{member.username === owner && `${member.username}(owner)`}</h5>
                        <h5>{member.username !== owner && member.username}</h5>
                    </div>
                );
            })}
            <h5>{`Offline:${offlineMembers.length}`}</h5>
            {offlineMembers.map((member, index) => {
                return (
                    <div key={index} className="group-members">
                        <ImageComp className='img-member' unique={member} type={'user'} />
                        <h5>{member.username === owner && `${member.username}(owner)`}</h5>
                        <h5>{member.username !== owner && member.username}</h5>
                    </div>
                );
            })}
        </div>
    );
}