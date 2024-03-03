import { NavLink } from "react-router-dom"
import ImageComp from "../imageComp/ImageComp"
import './group-components.css'

export interface Group {
    id:string,
    title:string,
    members:{},
    owner:string
}

export default function JoinedGroups({singleGroup}:{singleGroup:Group}) {
    return (
        <NavLink to={`/group/${singleGroup.id}`}>
        <div className="joined-groups"> 
        <ImageComp unique={singleGroup.id} type={'group'}/>
        <h4>{singleGroup.title}</h4>
        </div>
        </NavLink>
    )
}