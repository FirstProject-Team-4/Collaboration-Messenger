import { useParams } from "react-router-dom";

const UserProfile = () => {
    const { id } = useParams<{ id: string }>();
 
    const currentUser=id?.split()
    
    return (
        <div>
            <h1>User Profile</h1>
        </div>
    )
}
export default UserProfile;