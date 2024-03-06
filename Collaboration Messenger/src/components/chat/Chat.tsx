import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/config-firebase";
import { sendMessage } from "../../service/friends";
import Button from "../Button";
import Messages from "./Messages";
import './Chat.css';
import { sendGroupMessage } from "../../service/group";



const Chat  = ({type}:{type:string}) => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [currentMessage, setCurrentMessage] = useState(''); 
    const [messageList, setMessageList] = useState<any[]>([]); 


    useEffect(() => {
        if(type==='private'){
        const messageRef = ref(db, `/chats/${id}/messages`);
        const unsubscribe = onValue(messageRef, (snapshot) => {
            if (snapshot.exists()) {
                const messages = Object.keys(snapshot.val()).map((key) => ({
                    id: key,
                    ...snapshot.val()[key]
                }));
                setMessageList(messages);
            }else{
                setMessageList([]);// if there are no messages
            }
        });

        return () => unsubscribe();
    }else{
        const messageRef = ref(db, `/groups/${id}/messages`);
        const unsubscribe = onValue(messageRef, (snapshot) => {
            if (snapshot.exists()) {
                const messages = Object.keys(snapshot.val()).map((key) => ({
                    id: key,
                    ...snapshot.val()[key]
                }));
                setMessageList(messages);
            }else{
                setMessageList([]);// if there are no messages
            }
        });

        return () => unsubscribe();
    }
    
    }, [id, userData]);




    const sendCurrentMessage = () => {
        if (!currentMessage) {
            return;
        }
        if(id){
        if(type==='private'){
            sendMessage(id, { author: userData?.username || '', createdOn: Number(new Date()), content: currentMessage });
        }
        else{
            sendGroupMessage(id, { author: userData?.username || '', createdOn: Number(new Date()), content: currentMessage });
        }
    };
        setCurrentMessage('');
    }


    return (
        id && (
            <div className="column-chat">
            {type==='private'?<h1>Private Chat</h1>:<h1>Group Chat</h1>}
                <div className="messages-container">
                    <Messages messages={messageList} />
                    {/* <div ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }} /> */}
                </div>
                <input
                    type="text"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            sendCurrentMessage();
                        }
                    }}
                    placeholder="Type message..."
                    value={currentMessage}
                    onChange={(e) => { setCurrentMessage(e.target.value); }}
                />
                <Button onClick={sendCurrentMessage}>Send message</Button>
            </div>
        ) 
    );
};
export default Chat;