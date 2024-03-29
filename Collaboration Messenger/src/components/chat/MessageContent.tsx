import { useEffect, useState } from "react";
import "./Chat.css";
import './MessageContent.css';
import { useParams } from "react-router-dom";
import { AddEmojiToGroupMessage, AddEmojiToMessage, deleteGroupMessage, deleteMessage, editGroupMessage, editMessage } from "../../service/chat";
import Picker from 'emoji-picker-react';
import { useAppContext } from "../../context/appContext";
import AddReactionIcon from '@mui/icons-material/AddReaction';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';

export type Message = {
  author: string,
  content: string,
  reactions: any,
  createdOn: number,
  type: string,
  files: File[],
  id: string,
  replyMessage?: string
}
export type File = {
  url: string,
  type: string,
  name: string
}

/**
 * Renders the content of a message in the chat.
 * @param message - The message object.
 * @param type - The type of chat (private or group).
 * @param setReplyMessage - Optional. A function to set the reply message.
 * @returns The rendered message content.
 */
export default function MessageContent({ message, type, setReplyMessage }: { message: Message, type: string, setReplyMessage?: React.Dispatch<React.SetStateAction<string>> }) {

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
    message.reactions ? setReaction(Object.keys(message.reactions).map((key) => {
      return { emoji: key, users: Object.keys(message.reactions[key]) };
    })) : [];

  }, [message]);

  /**
   * Deletes the current message.
   * @param {string} messageId - The ID of the message to be deleted.
   */
  const deleteCurrentMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      if (type === 'private') {
        id && deleteMessage(id, messageId);
      } else {
        id && deleteGroupMessage(id, messageId);
      }
    }
  };

  /**
   * Saves the current edit of a message.
   * @param message - The message to be edited.
   */
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
  };

  /**
   * Adds the specified emoji to the given message.
   * 
   * @param emoji - The emoji to add.
   * @param message - The message to add the emoji to.
   */
  const addCurrentEmojiToMessage = (emoji: string, message: Message) => {

    if (type === 'private') {
      id && AddEmojiToMessage(id, message, emoji, userData.username);
    } else {
      id && AddEmojiToGroupMessage(id, message, emoji, userData.username);
    }

  };

  return (
    <>
      {edit ?
        <div className="message-content">
          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          <button onClick={() => { saveCurrentEdit(message); }}>Save</button>
          <button onClick={() => setEdit(false)}>Cancel</button>
        </div>
        :
        <div onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="message-content">
          <div id="message-reply-container">
            <div id="main-message-container">
              {message.replyMessage && <h5>{message.replyMessage}</h5>}
            </div>
            <div id="reply-container">
              {message.replyMessage ? <h5 style={{
                marginTop: "20px",
              }}>Reply:{message.content}</h5> : <h5 style={{
                margin: 0,
              }}>{message.content}</h5>}
            </div>
          </div>
          {files.map((f, i) => {
            return (
              <div key={i}>
                {f.type === 'image' ?
                  <div id="image-image-text-container">
                    <img className="message-image-file" src={f.url} alt="image" />
                    <a href={f.url} download>{f.name}</a>
                  </div>
                  :
                  <div className="file-display">
                    <img className="message-image-file" src={"/image/empty.file.png"} alt="image" />
                    <a href={f.url} download>{f.name}</a>
                  </div>}
              </div>
            );
          })}
          <div className="message-reactions">
            {reaction.map((r: any, i: number) => {
              return <div key={i}> {r.users.length > 0 && (<div key={i} className="reaction">
                <span className='emodji-reaction' onClick={() => {
                  addCurrentEmojiToMessage(r.emoji, message);
                  if (r.users.includes(userData.username)) {
                    r.users = r.users.filter((u: string) => u !== userData.username);
                  }
                  else {
                    r.users.push(userData.username);
                  }
                }}>{r.emoji}</span>
                {r.users.length > 1 && <span>{r.users.length}</span>}
              </div>)}
              </div>;
            })}
          </div>
          {showEmojiPicker &&
            <div className={'emoji-picker'} >
              <button onClick={() => { setShowEmojiPicker(false); }}>X</button>
              <Picker
                onEmojiClick={(emojiObject) => {
                  if (emojiObject) {
                    addCurrentEmojiToMessage(emojiObject.emoji, message);
                    setShowEmojiPicker(false);
                  }
                }}
              />

            </div>
          }
          {isHovered &&
            <div className="message-options">
              {userData.username === message.author && <button onClick={() => deleteCurrentMessage(message.id)}><DeleteIcon /></button>}
              {userData.username === message.author && <button onClick={() => {
                setEdit(true);
                setEditValue(message.content);
              }}><EditNoteIcon /></button>}
              <button onClick={() => setShowEmojiPicker(true)}><AddReactionIcon /></button>
              {<button onClick={() => setReplyMessage && setReplyMessage(message.content)}><ReplyAllIcon /></button>}

            </div>
          }
        </div>}
    </>
  );
}