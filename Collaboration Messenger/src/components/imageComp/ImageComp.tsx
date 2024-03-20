import { useEffect, useState } from "react";
import './imageComp.css';
import { get, ref} from "firebase/database";
import { db } from "../../config/config-firebase";
import { changeStatusToAway } from "../../service/status";
import { useAppContext } from "../../context/appContext";

/**
 * Renders an image component based on the provided type.
 * @param unique - The unique identifier for the image.
 * @param type - The type of the image ('group' or 'user').
 * @param className - Optional CSS class name for the component.
 * @param style - Optional inline styles for the component.
 * @returns The rendered image component.
 */
export default function ImageComp({ unique, type }: { unique: any, type: string, className?: string, style?: any}) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('');
  const { userData } = useAppContext();

  useEffect(() => {
    (async () => {
      switch (type) {
      case 'group':
        const groupImage = await get(ref(db, `groups/${unique.id}`));
        setData(groupImage.val());
        break;
      case 'user':
        const userImage = await get(ref(db, `users/${unique.username}`));
        setData(userImage.val());
        setStatus(userImage.val().status);
        break;
      }

    })();
  }, [unique, userData]);

  useEffect(() => {
    if (type === 'user') {
      const timer = setInterval(async () => {
        const snapshot = await get(ref(db, `users/${unique.username}`));
        if (snapshot.exists()) {
          if (snapshot.val().status === 'online') {
            const lastClick = snapshot.val().lastClick;
            const currentTime = Number(Date.now());
            if (currentTime - lastClick > 3 * 600000) {
              changeStatusToAway(userData);
              setStatus('away');
              return;
            }
            else {
              setStatus(snapshot.val().status);
            }
          }
          else {
            setStatus(snapshot.val().status);
          }
        }
      }, 600000); // 600000 milliseconds = 10 minutes

      // Clean up the interval on unmount
      return () => clearInterval(timer);
    }
  }, [status]);

  if (type === 'user') {
    return (
      data && <div className="img-user">
        {data?.image ? <div className="img-user">
          <img className="img-user" src={data?.image} alt="user" />
          <div className={`status-circle ${status}`}></div>
        </div>
          :
          <div className="img-user">
            <span className="letter">
              {data.username && data.username[0]}
            </span>
            <div className={`status-circle ${status}`}></div>
          </div>}
      </div>
    );
  }
  else {
    return (
      data && <>
        {data?.image ? <img className="img-user" src={data?.image} alt="group" /> :
          <span className="letter">
            {data.title && data.title[0] ? data.title[0] : null}
          </span>}
      </>
    );
  }
  
}
