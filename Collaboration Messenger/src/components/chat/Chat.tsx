import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import { useEffect, useRef, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "../../config/config-firebase";
import { chatOwners, sendMessage } from "../../service/friends";
import Button from "../Button";
import Messages from "./Messages";
import './Chat.css';
import { sendGroupMessage } from "../../service/group";
import { saveFile } from "../../service/storage";
import { v4 as uuidv4 } from 'uuid';
import Picker from 'emoji-picker-react';
// import './emoji-mart/css/emoji-mart.css';



const Chat = ({ type }: { type: string }) => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageList, setMessageList] = useState<any[]>([]);
    const [file, setFile] = useState<File[]>([]);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null)




    useEffect(() => {
        if (type === 'private') {
            const messageRef = ref(db, `/chats/${id}/messages`);
            const unsubscribe = onValue(messageRef, (snapshot) => {
                if (snapshot.exists()) {
                    const messages = Object.keys(snapshot.val()).map((key) => ({
                        id: key,
                        ...snapshot.val()[key]
                    }));
                    setMessageList(messages);
                } else {
                    setMessageList([]);// if there are no messages
                }
            });
            setShowEmojiPicker(false);
            return () => unsubscribe();
        } else {
            const messageRef = ref(db, `/groups/${id}/messages`);
            const unsubscribe = onValue(messageRef, (snapshot) => {
                if (snapshot.exists()) {
                    const messages = Object.keys(snapshot.val()).map((key) => ({
                        id: key,
                        ...snapshot.val()[key]
                    }));
                    setMessageList(messages);
                } else {
                    setMessageList([]);// if there are no messages
                }
            });
            setShowEmojiPicker(false);
            return () => unsubscribe();
        }
   

    }, [id, userData]);


    console.log(file)

    const sendCurrentMessage = async () => {
        if (!currentMessage && !file.length) {
            return;
        }
        const filesUrl = await Promise.all(file.map(async (f) => {
            const uniqueId = uuidv4();
            const url = await saveFile(f, uniqueId);
            const type = f.type.startsWith('image/') ? 'image' : 'file';
            return {
                url,
                type,
                name: f.name
            }
        }));
        const typeMessage = file.length ? 'file' : 'text';
        const currentMessageData = {
            author: userData?.username,
            content: currentMessage,
            createdOn: Number(new Date()),
            files: filesUrl,
            type: typeMessage

        }
        if (id) {
            if (type === 'private') {

                sendMessage(id, currentMessageData);

            }
            else {
                sendGroupMessage(id, currentMessageData);
            }
        };
        setCurrentMessage('');
        setFile([]);
    }
    const openFileSystem = () => {
        if (fileInputRef.current) {
            (fileInputRef.current as HTMLInputElement).click();
        }
    }


    return (
        id && (
            <div className="column-chat">
                {type === 'private' ? <h1>Private Chat</h1> : <h1>Group Chat</h1>}
                <div className="messages-container">
                    <Messages messages={messageList} />
                </div>
                <div className={'send-file-list'}>
                    {file.map((f, index) => {
                        //File preview
                        if (f.type.startsWith('image/')) {
                            return (

                                <div key={index}>
                                    <img className={'image-container'} src={URL.createObjectURL(f)} alt="image" />
                                    <span className='remove-file-list' onClick={() => setFile(file.filter(function (f2) { return f2.name !== f.name; }))}>X</span>
                                </div>

                            );
                        }
                        else {
                            return (
                                <div key={index}>
                                    <p>{f.name}</p>
                                    <span onClick={() => setFile(file.filter(function (current) { return current.name !== f.name; }))}>X</span>
                                </div>
                            );
                        }


                    })}
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
                    onClick={() => setShowEmojiPicker(false)}
                    onChange={(e) => { setCurrentMessage(e.target.value); }}
                />
                <Button onClick={openFileSystem}>Add file</Button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>Toggle Emoji Picker</button>

                {showEmojiPicker && (
    <div className={'emoji-picker'} ><Picker 
        onEmojiClick={( emojiObject) => {

            if (emojiObject) {
               
                setCurrentMessage(currentMessage + emojiObject.emoji);
                setShowEmojiPicker(false);
                
            }
        }}
    />
</div>)}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0].size < 10 * 1024 * 1024) { //10MB
                            setFile([...file, e.target.files[0]]);
                        }
                    }
                    }
                />
                <Button onClick={sendCurrentMessage}>Send message</Button>
            </div>
        )
    );
};

export default Chat;
