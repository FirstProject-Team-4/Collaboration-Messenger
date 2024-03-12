import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import { deleteGroupMessage, deleteMessage } from "../../service/chat";
import Button from "../Button";
import MessageContent, { Message } from "./MessageContent";
import './Messages.css';
import { useEffect, useRef, useState } from "react";

type MessagesProps = {
    messages: Message[],
    type: string,
    setReplyMessage?: React.Dispatch<React.SetStateAction<string>>

}
const Messages = ({ messages , type,setReplyMessage}: MessagesProps) => {
   const { userData } = useAppContext();


  
   
    
    return (
        userData && <>
            {messages.map((message,index) => {
                return (
                    <div key={message.id}
                    className={userData?.username === message.author ? 'send-message' : 'received-message'}>

                        <div className="message-header" >
                        {message.author!==messages[index-1]?.author&& <>
                        <p>{message.author === userData.username ? 'You' : message.author}</p>
                        </>}
                        {new Date(message.createdOn).toLocaleDateString([],{hour:'2-digit',minute:'2-digit'}) 
                        !== 
                        new Date(messages[index-1]?.createdOn).toLocaleDateString([],{hour:'2-digit',minute:'2-digit'})&&
                            <p>{new Date(message.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                        </div>
                        <MessageContent message={message} type={type} setReplyMessage={setReplyMessage} />

                    </div>
                )
            })}
        </>
    )
}

export default Messages;