import { useParams } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../config/config-firebase";
import { chatOwners, sendMessage } from "../service/friends";
import Button from "./Button";
import Messages from "./Messages";

interface ChatProps {
    className?: string;
   
}

const Chat: React.FC<ChatProps> = ({}) => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [currentMessage, setCurrentMessage] = useState(''); 
    const [messageList, setMessageList] = useState<any[]>([]); 
    const [friend, setFriend] = useState<any>({}); 

    useEffect(() => {
        const messageRef = ref(db, `/chats/${id}/messages`);
        const unsubscribe = onValue(messageRef, (snapshot) => {
            if (snapshot.exists()) {
                const messages = Object.keys(snapshot.val()).map((key) => ({
                    id: key,
                    ...snapshot.val()[key]
                }));
                setMessageList(messages);
            }
        });

        if (id) {
            chatOwners(id).then((owners) => {
                if (owners) {
                    Object.keys(owners).filter((key) => key !== userData?.username && key !== 'messages').map((key) => {
                        setFriend(owners[key]);
                    });
                }
            });
        }

        return () => unsubscribe();
    }, [id, userData]);

    const sendCurrentMessage = () => {
        if (!currentMessage) {
            return;
        }
        if (id) {
            sendMessage(id, { author: userData?.username || '', createdOn: Number(new Date()), content: currentMessage });
        }
        setCurrentMessage('');
    };

    return (
        id && (
            <div className="column-chat">
                <div className="chat-header-image-name">
                    <h1>{friend?.udername}</h1>
                </div>
                <div className="messages-container">
                    <Messages messages={messageList} />
                    <div ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }} />
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
        ) || <div>Choose a chat</div>
    );
};
export default Chat;