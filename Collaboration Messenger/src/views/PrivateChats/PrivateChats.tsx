import './PrivateChats.css';
import Chat from "../../components/Chat";
import Information from "../Information/Information";
import {useParams } from 'react-router-dom';
import UserSearch from '../../components/Search/UserSearch';
import { useEffect } from 'react';




const PrivateChats = () => {
    const {id} = useParams<{id: string}>();
    console.log('PrivateChats');
    
    useEffect(() => {
    }, [id])
    console.log('PrivateChats');

    return (
        <>
            <div className='search-users'>
             
                <UserSearch  />
            </div>
            <div className="inf">
                <Information />
            </div>
            
                <Chat />
            
        </>
    );
}
export default PrivateChats;