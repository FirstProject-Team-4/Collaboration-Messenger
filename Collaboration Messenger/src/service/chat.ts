import { get, ref, remove, set, update } from "firebase/database";
import { db } from "../config/config-firebase";
import { Message } from "../components/chat/MessageContent";

/**
 * Deletes a message from a chat.
 * 
 * @param id - The ID of the chat.
 * @param messageId - The ID of the message to delete.
 */
export const deleteMessage = (id: string, messageId: string) => {
  remove(ref(db, `/chats/${id}/messages/${messageId}`));
};
/**
 * Deletes a group message from the specified group.
 * 
 * @param id - The ID of the group.
 * @param messageId - The ID of the message to delete.
 */
export const deleteGroupMessage = (id: string, messageId: string) => {
  remove(ref(db, `/groups/${id}/messages/${messageId}`));
};
/**
 * Edits a message in the chat.
 * @param id - The ID of the chat.
 * @param message - The message to be edited.
 * @param content - The new content of the message.
 */
export const editMessage = (id: string, message: Message, content: string) => {
  set(ref(db, `/chats/${id}/messages/${message.id}`), {
    content: content,
    author: message.author,
    createdOn: message.createdOn,
    type: message.type,
    files: message.files ? message.files : []
  });
};
/**
 * Edits a group message in the database.
 * @param id - The ID of the group.
 * @param message - The message object to be edited.
 * @param content - The new content of the message.
 */
export const editGroupMessage = (id: string, message: Message, content: string) => {
  set(ref(db, `/groups/${id}/messages/${message.id}`), {
    content: content,
    author: message.author,
    createdOn: message.createdOn,
    type: message.type,
    files: message.files ? message.files : []

  });
};
/**
 * Adds an emoji reaction to a message in a chat.
 * @param id - The ID of the chat.
 * @param message - The message object to add the reaction to.
 * @param emoji - The emoji to add as a reaction.
 * @param username - The username of the user adding the reaction.
 */
export const AddEmojiToMessage = (id: string, message: Message, emoji: string, username: string) => {
  update(ref(db, `/chats/${id}/messages/${message.id}/reactions/${emoji}`), { [username]: true }
  );

};

/**
 * Adds an emoji reaction to a group message.
 * 
 * @param id - The ID of the group.
 * @param message - The message object.
 * @param emoji - The emoji to add as a reaction.
 * @param username - The username of the user reacting.
 */
export const AddEmojiToGroupMessage = async (id: string, message: Message, emoji: string, username: string) => {
  const snapshot = await get(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}/${username}`));
  if (snapshot.exists()) {
    update(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}`), { [username]: null });
    return;
  }
  update(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}`), { [username]: true });
};