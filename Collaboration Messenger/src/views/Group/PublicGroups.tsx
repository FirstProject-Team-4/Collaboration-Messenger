
import { useEffect, useState } from "react";
import { getPublicGroups, joinGroup, removeGroupMember } from "../../service/group";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../../components/imageComp/ImageComp";
import './Group.css';
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/config-firebase";
import { Group } from "../../components/group-components/JoinedGroup";

export default function PublicGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const { userData } = useAppContext();
    const [search, setSearch] = useState('');
    const nav=useNavigate();
    useEffect(() => {
        if (!userData) return;
        onValue(ref(db, `users/${userData.username}/groups`), () => {
        getPublicGroups().then((groups) => {
            groups = groups.filter((group: any) => group.owner !== userData.username);
            setGroups(groups);
        })
        });
    }, [userData])

    const leavePublicGroup = (groupId: string) => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            removeGroupMember(groupId, userData.username)
        //    const filteredGroups = groups.filter((g: any) => g.id !== groupId);
        //    filteredGroups.push({...groups, members:{[userData.username]:null}});
        //       setGroups(filteredGroups);    

        }

    }
    const joinPublicGroup = (group:Group) => {
        joinGroup(group, userData);
        // const filteredGroups = groups.filter((g: any) => g.id !== group.id);
        // filteredGroups.push({...group,members:{[userData.username]:userData.username}});
        // setGroups(filteredGroups);
        // // nav(`/group/${group.id}`)

        
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
       { groups.length!== 0 &&userData ?
            <div className="public-groups-container">
                {groups.map((group: any, index: any) => {
                    console.log(group.id);
                    return <div className="public-single-group-container" key={index}>
                        <ImageComp unique={group} type={'group'} />
                        <h3>{group.title}</h3>
                        <p>{group.description}</p>
                        <p>{group.members?Object.keys(group.members).length:0} members</p>
                        {group.members && Object.keys(group.members).includes(userData.username) ? <button onClick={() => leavePublicGroup(group.id)}>Leave </button> : <button onClick={() => { joinPublicGroup(group) }}>Join </button>}
                    </div>
                })}
            </div>
            : <div className="public-groups-container">
                <p>There are no public groups at the moment</p>
            </div>}
            </div>
    )
}