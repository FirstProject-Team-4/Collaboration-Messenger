import { useEffect, useState } from "react"
import './imageComp.css'
import { get, ref, set } from "firebase/database";
import { db } from "../../config/config-firebase";
import { changeStatusToAway } from "../../service/status";
import { useAppContext } from "../../context/appContext";

export default function ImageComp({ unique, type }: { unique:any, type: string, className?: string }) {
    const [data, setData] = useState<any>(null)
    const [status, setStatus] = useState('');
    const {userData}=useAppContext();
    useEffect(() => {
        (async () => {
            switch (type) {
                case 'group':
                    const groupImage = await get(ref(db, `groups/${unique.id}`))
                    setData(groupImage.val());
                    break;
                case 'user':
                    const userImage = await get(ref(db, `users/${unique.username}`))
                    setData(userImage.val());
                    setStatus(userImage.val().status);
                    break;
            }

        })()
    }, [unique,userData])

console.log('status',status)
useEffect(() => {
    if(type==='user'){
  const timer = setInterval(async () => {
    const snapshot = await get(ref(db, `users/${unique.username}`));
    if (snapshot.exists()) {
       if(snapshot.val().status==='online'){
      const lastClick = snapshot.val().lastClick;
        const currentTime = Number(Date.now());
        if (currentTime - lastClick > 3 *600000) {
            changeStatusToAway(userData);
          setStatus('away');
          return;
        }
        else{
            setStatus(snapshot.val().status);
        }
       }
       else{
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
            data && <div className="img">
                {data?.image ?<div className="img">
                    <img className="img" src={data?.image} alt="user" />
                    <div className={`status-circle ${status}`}></div>
                    </div>
                    :
                    <div className="img">
                    <span className="letter">
                    {data.username && data.username[0]}
                    </span>
                    <div className={`status-circle ${status}`}></div>
                    </div>}
            </div>
        )
    }
    else {
        return (
            data && <>
                {data?.image ? <img className="img" src={data?.image} alt="group" /> :
                    <span className="letter">
                        {data.title && data.title[0] ? data.title[0] : null}
                    </span>}
            </>
        )
    }
}
// .status-circle {
//     width: 10px;
//     height: 10px;
//     border-radius: 50%;
//     position: absolute;
//     /* adjust the position as needed */
//     right: 0;
//     bottom: 0;
//   }
  
//   .status-circle.online {
//     background-color: green;
//   }
  
//   .status-circle.offline {
//     background-color: red;
//   }
// data && (
//     <>
//       {data?.image ? (
//         <div className="image-container">
//           <img className="img" src={data?.image} alt="user" />
//           <div className={`status-circle ${data.status}`}></div>
//         </div>
//       ) : (
//         <div className="letter-container">
//           <span className="letter">
//             {data.username && data.username[0] ? data.username[0] : 
//             data.title && data.title[0] ? data.title[0] : null}
//           </span>
//           <div className={`status-circle ${data.status}`}></div>
//         </div>
//       )}
//     </>
//   )