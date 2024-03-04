
import { useEffect, useState } from "react";
import { getPublicGroups, joinGroup, removeGroupMember } from "../../service/group";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../../components/imageComp/ImageComp";
import './Group.css';
import Button from "../../components/Button";

export default function PublicGroups() {
    const [groups, setGroups] = useState<any>([]);
    const { userData,setContext } = useAppContext();
    const [search, setSearch] = useState('');
    useEffect(() => {
        getPublicGroups().then((groups) => {
            groups = groups.filter((group: any) => group.owner !== userData.username);
            setGroups(groups);
        })
    }, [userData])

    const leavePublicGroup = (groupId: string) => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            removeGroupMember(groupId, userData.username)
            setGroups(groups.filter((group: any) => group.id !== groupId));

        }
        console.log('leave');
    }
    const joinPublicGroup = (group: { id: string, image: string, title: string }) => {
        joinGroup(group, userData.username);
        setContext({ ...userData, groups: { ...userData.groups, [group.id]: { title: group.title, image: group.image } } })

        
    }
    const handleSearch = (value: string) => {
        setSearch(value);
        getPublicGroups().then((groups) => {
            groups = groups.filter((group: any) => group.owner !== userData.username);
            setGroups(groups.filter((group: any) => group.title.toLowerCase().includes(value.toLowerCase())));
        })
    }
    return (
        <div className="public-groups-view">
        <input type="text" placeholder="Search" onChange={(e) => handleSearch(e.target.value)} />
       { groups.length !== 0 ?
            <div className="public-groups-container">
                {groups.map((group: any, index: any) => {
                    console.log(group.id);
                    return <div className="public-single-group-container" key={index}>
                        <ImageComp unique={group.id} type={'group'} />
                        <h3>{group.title}</h3>
                        <p>{group.description}</p>
                        <p>{group.members?Object.keys(group.members).length:0} members</p>
                        {group.members?Object.keys(group.members).includes(userData.username) && <button onClick={() => leavePublicGroup(group.id)}>Leave </button>:''}
                        {group.members? !Object.keys(group.members).includes(userData.username) && <button onClick={() => { joinPublicGroup(group) }}>Join </button>:''}
                    </div>
                })}
            </div>
            : <div className="public-groups-container">
                <p>There are no public groups at the moment</p>
            </div>}
            </div>
    )
}