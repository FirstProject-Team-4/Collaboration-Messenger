import { useEffect, useState } from "react";
import { getPublicGroups, joinGroup, removeGroupMember } from "../../../service/group";
import { useAppContext } from "../../../context/appContext";
import ImageComp from "../../../components/imageComp/ImageComp";
import { onValue, ref } from "firebase/database";
import { db } from "../../../config/config-firebase";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import './PublicGroups.css';
import { Group } from "../../../components/group-components/JoinedGroup";

/**
 * Renders the PublicGroups component.
 * Displays a list of public groups and provides functionality to join or leave a group.
 */
export default function PublicGroups() {
    const [groups, setGroups] = useState<any>([]);
    const { userData } = useAppContext();
    const [search, setSearch] = useState('');
    useEffect(() => {
        if (!userData) return;
        onValue(ref(db, `users/${userData.username}/groups`), () => {
            getPublicGroups().then((groups) => {
                groups = groups.filter((group: any) => group.owner !== userData.username);
                setGroups(groups);
            })
        });
    }, [userData])

    /**
     * Function to leave a public group.
     * @param {string} groupId - The ID of the group to leave.
     */
    const leavePublicGroup = (groupId: string) => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            removeGroupMember(groupId, userData.username);
        }
    }
    /**
     * Joins a public group.
     * 
     * @param {Group} group - The group to join.
     */
    const joinPublicGroup = (group: Group) => {
        joinGroup(group, userData);
    }
    
    /**
     * Handles the search functionality in the PublicGroups component.
     * Updates the search value and filters the public groups based on the search value.
     * @param value - The search value entered by the user.
     */
    const handleSearch = (value: string) => {
        setSearch(value);
        getPublicGroups().then((groups) => {
            groups = groups.filter((group: any) => group.owner !== userData.username);
            setGroups(groups.filter((group: any) => group.title.toLowerCase().includes(value.toLowerCase())));
        })
    }
    return (
        <div className="public-groups-view card-group-view">
            <input type="text" placeholder="Search" className='search-group' onChange={(e) => handleSearch(e.target.value)} />
            {groups.length !== 0 && userData ?
                <div className="public-groups-container">
                    {groups.map((group: any, index: any) => {
                        console.log(group.id);
                        return <div className="public-single-group-container card-group" key={index}>
                            <ImageComp className='group-img image' unique={group} type={'group'} />
                            <h3 className="title-group">{group.title}</h3>
                            <p className="info-group">About group: {group.description}</p>
                            <p><PeopleAltIcon /> {group.members ? Object.keys(group.members).length : 0} members</p>
                            {group.members && Object.keys(group.members).includes(userData.username) ? <button className="btn-leave" onClick={() => leavePublicGroup(group.id)}>Leave </button> : <button className='btn-join' onClick={() => { joinPublicGroup(group) }}>Join </button>}
                        </div>
                    })}
                </div>
                : <div className="public-groups-container">
                    <p>There are no public groups at the moment</p>
                </div>}
        </div>
    )
}