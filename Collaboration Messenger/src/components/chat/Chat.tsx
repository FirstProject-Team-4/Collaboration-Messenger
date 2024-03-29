import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import { useEffect, useRef, useState } from "react";
import { equalTo, get, onValue, orderByChild, query, ref, remove } from "firebase/database";
import { db } from "../../config/config-firebase";
import { sendMessage } from "../../service/friends";
import Button from "../button/Button";
import Messages from "./Messages";
import './Chat.css';
import { sendGroupMessage } from "../../service/group";
import { saveFile } from "../../service/storage";
import { v4 as uuidv4 } from 'uuid';
import Picker from 'emoji-picker-react';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SendIcon from '@mui/icons-material/Send';
import AddReactionIcon from '@mui/icons-material/AddReaction';


type FileObject = {
  file: File,
  id: string
}

/**
 * Represents a chat component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.type - The type of chat (private or group).
 * @returns {JSX.Element} The rendered chat component.
 */
const Chat = ({ type }: { type: string }) => {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAppContext();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState<any[]>([]);
  const [file, setFile] = useState<FileObject[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [otherUserUsername, setOtherUserUsername] = useState('');
  const nav = useNavigate();


  useEffect(() => {
    setIsScrolled(false);

    if (type === 'private') {

      const currentId = id?.split(userData.uid).join('');

      if (currentId) {
        const dbRef = ref(db, "users");
        const q = query(dbRef, orderByChild('uid'), equalTo(currentId));
        get(q).then((snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          setOtherUserUsername(Object.keys(snapshot.val())[0]);
        });

      }

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
      const snapshot = get(ref(db, `groups/${id}/members`)).then((snapshot) => {
        const members = Object.keys(snapshot.val());
        if (!members.includes(userData.username)) {
          nav(`/*`);
        }
      });
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

  useEffect(() => {
    if (!isScrolled) {
      scrollRef.current && (scrollRef.current as HTMLElement).scrollIntoView({ behavior: 'instant' });
    }
  }, [messageList]);

  useEffect(() => {
    if (!otherUserUsername) {
      return;
    }
    const subscribe = onValue(ref(db, `users/${userData.username}/privateNotifications/${id}`), (snapshot) => {
      if (snapshot.exists()) {
        remove(ref(db, `users/${userData.username}/privateNotifications/${id}`));
      }
    });
    return () => subscribe();
  }, [otherUserUsername]);

  /**
   * Sends the current message along with any attached files.
   * If there is no message or attached file, the function returns early.
   * For each attached file, it generates a unique ID, saves the file, and retrieves its URL.
   * Determines the type of message based on the presence of attached files.
   * Constructs the current message data object with the author, content, creation timestamp, attached files, message type, and reply message.
   * Sends the message to the appropriate recipient based on the message type and ID.
   * Clears the current message, attached files, and reply message after sending the message.
   */
  const sendCurrentMessage = async () => {
    if (!currentMessage && !file.length) {
      return;
    }
    const filesUrl = await Promise.all(file.map(async (f) => {
      const uniqueId = uuidv4();
      const url = await saveFile(f.file, uniqueId);
      const type = f.file.type.startsWith('image/') ? 'image' : 'file';
      return {
        url,
        type,
        name: f.file.name
      };
    }));
    const typeMessage = file.length ? 'file' : 'text';
    const currentMessageData = {
      author: userData?.username,
      content: currentMessage,
      createdOn: Number(new Date()),
      files: filesUrl,
      type: typeMessage,
      replyMessage: replyMessage
    };
    if (id) {
      if (type === 'private') {
        sendMessage(id, currentMessageData, otherUserUsername);
      } else {
        sendGroupMessage(id, currentMessageData);
      }
    }
    setCurrentMessage('');
    setFile([]);
    setReplyMessage('');
  };

  /**
   * Opens the file system by triggering a click event on the file input element.
   */
  const openFileSystem = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };

  /**
   * Handles the scroll event of the message container.
   */
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = (messageContainerRef.current as HTMLElement);
      if (Math.abs(scrollTop + clientHeight - scrollHeight) < 1) {
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
      }
    }
  };

  return (
    id && (
      <div onClick={() => { setShowEmojiPicker(false); }} className="column-chat">
        {type === 'private' ? <h1>Private Chat</h1> : <h1>Group Chat</h1>}
        <div onScroll={() => { handleScroll(); }} ref={messageContainerRef} className="messages-container">
          <Messages messages={messageList} type={type} setReplyMessage={setReplyMessage} />
          <div ref={scrollRef} />
        </div>
        <div className={'send-file-list'}>
          {file.map((f, index) => {
            //File preview
            if (f.file.type.startsWith('image/')) {
              return (

                <div key={index}>
                  <img className={'image-container'} src={URL.createObjectURL(f.file)} alt="image" />
                  <span className='remove-file-list' onClick={() => setFile(file.filter(function (f2) { return f2.id !== f.id; }))}>X</span>
                </div>

              );
            }
            else {
              return (
                <div key={index}>
                  <img className={'image-container'} src={"/image/empty.file.png"} alt="image" />

                  <span onClick={() => setFile(file.filter(function (current) { return current.id !== f.id; }))}>X</span>
                </div>
              );
            }


          })}
        </div>
        {replyMessage && (<div className="reply-input-field">
          <h5>{replyMessage}</h5>
          <span onClick={() => setReplyMessage('')}>X</span>
        </div>)}
        <input className="message-input"
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
        <Button className="file-add-btn" onClick={openFileSystem}><NoteAddIcon /></Button>
        <button className="add-reaction" onClick={(event) => {
          setShowEmojiPicker(!showEmojiPicker);
          event.stopPropagation();
        }
        }><AddReactionIcon /></button>

        {showEmojiPicker && (
          <div className={'emoji-picker'} ><Picker
            onEmojiClick={(emojiObject) => {

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
            if (e.target.files && e.target.files[0].size < 100 * 1024 * 1024) { //100MB

              setFile([...file, { file: e.target.files[0], id: uuidv4() }]);
              e.target.value = '';

            }
          }}

        />

        <Button className="send-btn" onClick={sendCurrentMessage}><SendIcon /></Button>
      </div>
    )
  );
};

export default Chat;
