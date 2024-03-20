import { NavLink } from "react-router-dom";
import ImageComp from "../imageComp/ImageComp";
import './group-components.css';
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/config-firebase";
import { useAppContext } from "../../context/appContext";
import NotificationsIcon from '@mui/icons-material/Notifications';
import './group-components.css';

export interface Group {
  id: string,
  title: string,
  members: {},
  owner: string,
  image: string | null
  room: { id: string }
}

/**
 * Renders a component for a joined group.
 * 
 * @param {Object} props - The component props.
 * @param {Group} props.singleGroup - The joined group object.
 * @returns {JSX.Element} The rendered component.
 */
export default function JoinedGroups({ singleGroup }: { singleGroup: Group }) {
  const { userData } = useAppContext();
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    onValue(ref(db, `users/${userData.username}/groupNotifications/${singleGroup.id}`), (snapshot) => {
      if (snapshot.exists()) {
        setNotification(true);
      }
      else {
        setNotification(false);
      }
    });
  }, []);

  return (
    <NavLink to={`/group/${singleGroup.id}`}>
      <div className="joined-groups">
        <ImageComp unique={singleGroup} type={'group'} />
        <h4>{singleGroup.title}</h4>
        {notification && <div><NotificationsIcon /></div>}
      </div>
    </NavLink>
  );
}