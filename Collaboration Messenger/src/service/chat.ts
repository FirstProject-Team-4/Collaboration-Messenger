import { get, ref, remove, set, update } from "firebase/database";
import { db } from "../config/config-firebase";
import { Message } from "../components/chat/MessageContent";

export const  deleteMessage = (id: string,messageId:string) => {
    remove(ref(db,`/chats/${id}/messages/${messageId}`));
}
export const deleteGroupMessage = (id: string,messageId:string) => {
    remove(ref(db,`/groups/${id}/messages/${messageId}`));
}
export const editMessage = (id: string,message:Message,content:string) => {
    set(ref(db,`/chats/${id}/messages/${message.id}`),{
        content:content,
        author:message.author,
        createdOn:message.createdOn,
        type:message.type,
        files:message.files?message.files:[]
    });
}
export const editGroupMessage = (id: string,message:Message,content:string) => {
    set(ref(db,`/groups/${id}/messages/${message.id}`),{
        content:content,
        author:message.author,
        createdOn:message.createdOn,
        type:message.type,
        files:message.files?message.files:[]

    });
}
export const AddEmojiToMessage = (id:string,message:Message,emoji: string,username:string) => {
    update(ref(db,`/chats/${id}/messages/${message.id}/reactions/${emoji}`),{[username]:true}
    );

};
export const AddEmojiToGroupMessage = async (id: string, message: Message, emoji: string, username: string) => {
    const snapshot = await get(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}/${username}`));
    if (snapshot.exists()) {
        console.log('exists');
        update(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}`),{[username]:null});
        return;
    }
    update(ref(db, `/groups/${id}/messages/${message.id}/reactions/${emoji}`), { [username]: true });
};