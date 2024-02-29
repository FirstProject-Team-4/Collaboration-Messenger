import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/appContext';
import './Group.css';
import CreateGroup from './CreateGroup';
import { NavLink, useParams } from 'react-router-dom';
import { getGroupsByUser } from '../../service/group';
import JoinedGroups, { Group } from '../../components/group-components/JoinedGroup';
import { onValue, ref } from 'firebase/database';
import { db } from '../../config/config-firebase';
import SingleGroup from './SingleGroup';
export default function Group() {
    const { userData } = useAppContext();
    const { id } = useParams();
    const [groups, setGroups] = useState<Group[] | any>([]);

    const [currentId, setCurrentId] = useState<String | undefined>('');

    useEffect(() => {
        if (userData) {
            onValue(ref(db, `users/${userData.username}/groups`), (snapshot) => {
                getGroupsByUser(userData.username).then(setGroups);
            });

        }
        setCurrentId(id)
    }, [id, userData]);

    return (
        <>
            <div className="groups-form">
                <h6>Groups</h6>
                {groups.map((group: any, index: any) => {
                    return <JoinedGroups singleGroup={group} key={index} />
                })}
                <div className='create-group'>
                    <NavLink className='create-group-btn' to={`/group/createGroup`}>Create</NavLink>
                    <NavLink className='create-group-btn' to={`/group/join`}>Join </NavLink>
                </div>
            </div>
            {id === 'createGroup' && <CreateGroup />}
            {id === 'join' && <div>Join</div>}
            {id !== 'createGroup' && id !== 'join' && id !== undefined && <SingleGroup/>}
        </>
    )
}