import { useEffect, useState } from "react";
import "./Chat.css";
import { useParams } from "react-router-dom";
import { AddEmojiToGroupMessage, AddEmojiToMessage, deleteGroupMessage, deleteMessage, editGroupMessage, editMessage } from "../../service/chat";
import Picker from 'emoji-picker-react';
import { useAppContext } from "../../context/appContext";
export type Message = {
    author: string,
    content: string,
    reactions: any,
    createdOn: number,
    type: string,
    files: File[],
    id: string,
    replyMessage?:string
}
export type File = {
    url: string,
    type: string,
    name: string
}
export default function MessageContent({ message, type,setReplyMessage }: { message: Message, type: string,setReplyMessage?:React.Dispatch<React.SetStateAction<string>> }) {

    const [files, setFiles] = useState<File[]>([]);
    const { userData } = useAppContext();
    const [isHovered, setIsHovered] = useState(false);
    const [edit, setEdit] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reaction, setReaction] = useState([] as any);
    const { id } = useParams();
    useEffect(() => {
        if (message.type === 'image' || message.type === 'file') {
            setFiles(message.files);
        }
        message.reactions? setReaction(Object.keys(message.reactions).map((key) => {
            return { emoji: key, users: Object.keys(message.reactions[key]) }
        })):[];

    }, [message])

console.log(reaction);
    const deleteCurrentMessage = (messageId: string) => {
        if (window.confirm('Are you sure you want to delete this message?')
        ) {
            if (type === 'private') {
                id && deleteMessage(id, messageId);
            } else {
                id && deleteGroupMessage(id, messageId);
            }
        }
    }
    const saveCurrentEdit = (message: Message) => {
        setEdit(false);
        if (editValue === message.content) {
            return;
        }
        if (type === 'private') {
            id && editMessage(id, message, editValue);
        } else {
            id && editGroupMessage(id, message, editValue);
        }
    }
    const addCurrentEmojiToMessage = (emoji: string,message:Message) => {
       
        if (type === 'private') {
            id && AddEmojiToMessage(id,message,emoji,userData.username);
        } else {
            id && AddEmojiToGroupMessage(id,message,emoji,userData.username);
        }
        
    }

    return (
        edit ?
            <div className="message-content">
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                <button onClick={() => { saveCurrentEdit(message) }}>Save</button>
                <button onClick={() => setEdit(false)}>Cancel</button>
            </div>
            :
            <div onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="message-content">
                {message.replyMessage&&<h5>{message.replyMessage}</h5>}
                <p>{message.content}</p>
                {files.map((f, i) => {
                    return (
                        <div key={i}>
                            {f.type === 'image' ? <img className="message-image-file" src={f.url} alt="image" />
                                :
                                <div className="file-display">
                                    <img className="message-image-file" src={"/image/empty.file.png"} alt="image" />
                                    <a href={f.url} download>{f.name}</a>
                                </div>}
                        </div>
                    );
                })}
                <div className="message-reactions">
                    {reaction.map((r:any, i:number) => {
                        return <> {r.users.length>0&&( <div key={i} className="reaction">
                            <span onClick={()=>
                                {addCurrentEmojiToMessage(r.emoji,message)
                                    if(r.users.includes(userData.username)){
                                        r.users = r.users.filter((u:string)=>u!==userData.username);
                                    }
                                    else{
                                        r.users.push(userData.username);
                                    }
                                }}>{r.emoji}</span>
                           {r.users.length>1&& <span>{r.users.length}</span>}
                        </div>)}
                        </>
                    })}
                </div>
                {showEmojiPicker && 
                    <div className={'emoji-picker'} >
                    <button onClick={()=>{setShowEmojiPicker(false)}}>X</button>
                        <Picker
                            onEmojiClick={(emojiObject) => {
                                if (emojiObject) {
                                    addCurrentEmojiToMessage(emojiObject.emoji,message);
                                    setShowEmojiPicker(false);
                                }
                            }}
                        />
                       
                    </div>
                }
                {isHovered && 
                    <div className="message-options">
                        {userData.username === message.author && <button onClick={() => deleteCurrentMessage(message.id)}>X</button>}
                        {userData.username === message.author && <button onClick={() => {
                            setEdit(true);
                            setEditValue(message.content);
                        }}>Edit</button>}
                        <button onClick={() => setShowEmojiPicker(true)}>Emoji</button>
                        {<button onClick={() => setReplyMessage&&setReplyMessage(message.content)}>Reply</button>}
                        
                    </div>
                }
            </div>
    );
}