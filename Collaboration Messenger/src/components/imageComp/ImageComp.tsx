import { useEffect, useState } from "react"
import './imageComp.css'
import { get, ref, set } from "firebase/database";
import { db } from "../../config/config-firebase";

export default function ImageComp({unique,type}:{unique:string,type:string}) {
    const [data, setData] = useState<any>(null)
    useEffect(() => {
        (async () => {
           switch(type){
            case'group':
             const response=await get(ref(db, `groups/${unique}`))
                setData(response.val());
            break;
            case'user':
                const response2=await get(ref(db, `users/${unique}`))
                setData(response2.val());
                break;
           }

        })()
    }, [unique])
    return (
       data&& <>
            {data?.image ? <img className="img" src={data?.image} alt="user" /> : <span className="letter">{data.username?data.username[0]:data.title[0]}</span>}
        </>
    )
}