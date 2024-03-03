
import { useEffect, useState } from "react";
import { getPublicGroups } from "../../service/group";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../../components/imageComp/ImageComp";

export default function PublicGroups() {
const [groups, setGroups] = useState<any>([]);
const {userData}=useAppContext();
useEffect(() => {
    getPublicGroups().then((groups) => {
        setGroups(groups);
    })
}, [])
    return (
        <div className="public-groups-container">
            {groups.map((group:any,index:any)=>{
                return <div className="public-single-group-container" key={index}>
                <ImageComp unique={group.id} type={'group'}/>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                   {Object.keys(group.members).includes(userData.username)?<button>Joined</button>:<button>Join</button>} 
                </div>
            })}
        </div>
    )
}