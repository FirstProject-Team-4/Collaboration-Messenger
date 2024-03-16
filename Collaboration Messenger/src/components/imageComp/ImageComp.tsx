import { useEffect, useState } from "react"
import './imageComp.css'
import { get, ref } from "firebase/database";
import { db } from "../../config/config-firebase";

export default function ImageComp({unique,type}:{unique:string,type:string, className:string}) {
    const [data, setData] = useState<any>(null)
    useEffect(() => {
        (async () => {
           switch(type){
            case'group':
             const groupImage=await get(ref(db, `groups/${unique}`))
                setData(groupImage.val());
            break;
            case'user':
                const userImage=await get(ref(db, `users/${unique}`))
                setData(userImage.val());
                break;
           }

        })()
    }, [unique])
    return (
        data && <>
             {data?.image ? <img className="img" src={data?.image} alt="user" /> : 
             <span className="letter">
                 {data.username && data.username[0] ? data.username[0] : 
                 data.title && data.title[0] ? data.title[0] : null}
             </span>}
         </>
     )
}