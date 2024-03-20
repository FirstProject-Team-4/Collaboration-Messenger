import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/appContext';
import './Group.css';
import CreateGroup from './CreateGroup/CreateGroup';
import { NavLink, useParams } from 'react-router-dom';
import { getGroupsByUser } from '../../service/group';
import JoinedGroups, { Group } from '../../components/group-components/JoinedGroup';
import { onChildRemoved, onValue, ref } from 'firebase/database';
import { db } from '../../config/config-firebase';
import SingleGroup from './SingleGroup';
import GroupInvites from '../../components/group-components/GroupInvites';
import PublicGroups from './PublicGroups/PublicGroups';

/**
 * Renders the Group component.
 * This component displays the user's groups and group invitations.
 */
export default function Group() {
  const { userData } = useAppContext();
  const { id } = useParams();
  const [groups, setGroups] = useState<Group[] | any>([]);
  const [groupInvitation, setGroupInvitation] = useState<string[] | any>([]);

  const [currentId, setCurrentId] = useState<String | undefined>('');

  useEffect(() => {
    if (userData) {
      onValue(ref(db, `users/${userData.username}/groups`), (snapshot) => {
        getGroupsByUser(userData.username).then(setGroups);
      });
      onChildRemoved(ref(db, `users/${userData.username}/groupInvitation`), (snapshot) => {
        if (snapshot.exists()) {
          setGroupInvitation(Object.keys(snapshot.val()));
        }
      });
      onValue(ref(db, `users/${userData.username}/groupInvitation`), (snapshot) => {
        if (snapshot.exists()) {
          setGroupInvitation(Object.keys(snapshot.val()));
        }
      });

    }
    setCurrentId(id);
  }, [id, userData]);

  return (
    <>
      <div className="groups-form">
        {groupInvitation &&
          groupInvitation.map((group: any, index: any) => {
            return <GroupInvites groupId={group} key={index} />;
          })}
        <h6 className='group-title-inf'>Groups</h6>
        {groups.map((group: any, index: any) => {
          return <JoinedGroups singleGroup={group} key={index} />;
        })}
        <div className='create-group'>
          <NavLink className='create-group-btn' to={`/group/createGroup`}>Create</NavLink>
          <NavLink className='join-group-btn' to={`/group/join`}>Join </NavLink>
        </div>
      </div>
      {id === 'createGroup' && <CreateGroup />}
      {id === 'join' && <PublicGroups />}
      {id !== 'createGroup' && id !== 'join' && id !== undefined && <SingleGroup />}
    </>
  );
}