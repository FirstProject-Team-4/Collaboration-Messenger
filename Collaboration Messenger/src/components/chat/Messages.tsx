import { useAppContext } from "../../context/appContext";
import './Messages.css';

const Messages = ({ messages }: { messages: { author: string, content: string, createdOn: number, id: string }[] }) => {
   const { userData } = useAppContext();

    return (
        userData && <>
            {messages.map((message,index) => {
                return (
                    <div key={message.id} className={userData?.username === message.author ? 'send-message' : 'received-message'}>

                        <div className="message-header">
                        {message.author!==messages[index-1]?.author&& <><p>{message.author === userData.username ? 'You' : message.author}</p>
                            <p>{new Date(message.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </>}
                        </div>
                        <span>{message.content}</span>
                    </div>
                )
            })}
        </>
    )
}
export default Messages;