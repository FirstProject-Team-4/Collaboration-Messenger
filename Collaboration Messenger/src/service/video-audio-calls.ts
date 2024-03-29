import { ref, update } from "firebase/database";
import { MembersProps } from "../components/group-components/GroupMembers";
import { db } from "../config/config-firebase";


export const DYTE_KEY = `ODgzMTNlZDQtNzQwZi00ZDM5LWFiMzQtZGFjNTNiNzQwYTE1OmNmY2RmZGM4NTljY2VlYTgxZDRh`;
/**
 * Creates a Dyte room for video and audio calls.
 * @param groupMembers - The members of the group.
 * @param group - The group information.
 * @returns The created Dyte room data.
 */
export const createDyteRoom = async (groupMembers: MembersProps, group: { id: string | null, title: string }) => {
  const DYTE_URL = 'https://api.dyte.io/v2';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ODgzMTNlZDQtNzQwZi00ZDM5LWFiMzQtZGFjNTNiNzQwYTE1OmNmY2RmZGM4NTljY2VlYTgxZDRh`
    },
    body: `{"title":"${group.title}","preferred_region":"ap-south-1","record_on_start":false,"live_stream_on_start":false,"recording_config":{"max_seconds":60,"file_name_prefix":"string","video_config":{"codec":"H264","width":1280,"height":720,"watermark":{"url":"http://example.com","size":{"width":1,"height":1},"position":"left top"}},"audio_config":{"codec":"AAC","channel":"stereo"},"storage_config":{"type":"aws","access_key":"string","secret":"string","bucket":"string","region":"us-east-1","path":"string","auth_method":"KEY","username":"string","password":"string","host":"string","port":0,"private_key":"string"},"dyte_bucket_config":{"enabled":true},"live_streaming_config":{"rtmp_url":"rtmp://a.rtmp.youtube.com/live2"}}}`
  };
  try {
    const response = await fetch(`${DYTE_URL}/meetings`, options);
    const result = await response.json();
    console;


    return result.data;
  } catch (error: any) {
  }
};

/**
 * Sends participant token to a room.
 * @param room - The room object containing the room ID.
 * @param member - The member object containing the member's properties.
 * @param currentGroupID - The ID of the current group.
 */
export const sendParticipantToken = async (room: { id: string }, member: MembersProps, currentGroupID: string | null) => {

  const url = `https://api.dyte.io/v2/meetings/${room.id}/participants`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${DYTE_KEY}`
    },
    body:
      `{
                        "name":"${member.username}",
                        "preset_name":"Test1",
                        "custom_participant_id":"${member.id}"
                        }`
  };

  try {
    const response = await fetch(url, options);

    const result = await response.json();
    update(ref(db, `groups/${currentGroupID}/members/${member.username}/token`), { token: result.data.token });

  } catch (error: any) {
    console.log(error.message);
  }
};

/**
 * Creates a private room using the Dyte API.
 * @param id - The ID of the room.
 * @returns The data of the created room.
 */
export const createDytePrivateRoom = async (id: string) => {
  const DYTE_URL = 'https://api.dyte.io/v2';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ODgzMTNlZDQtNzQwZi00ZDM5LWFiMzQtZGFjNTNiNzQwYTE1OmNmY2RmZGM4NTljY2VlYTgxZDRh`
    },
    body: `{"title":"Private","preferred_region":"ap-south-1","record_on_start":false,"live_stream_on_start":false,"recording_config":{"max_seconds":60,"file_name_prefix":"string","video_config":{"codec":"H264","width":1280,"height":720,"watermark":{"url":"http://example.com","size":{"width":1,"height":1},"position":"left top"}},"audio_config":{"codec":"AAC","channel":"stereo"},"storage_config":{"type":"aws","access_key":"string","secret":"string","bucket":"string","region":"us-east-1","path":"string","auth_method":"KEY","username":"string","password":"string","host":"string","port":0,"private_key":"string"},"dyte_bucket_config":{"enabled":true},"live_streaming_config":{"rtmp_url":"rtmp://a.rtmp.youtube.com/live2"}}}`
  };
  try {
    const response = await fetch(`${DYTE_URL}/meetings`, options);
    const result = await response.json();


    //await addDyteRoomIdToCall(dbCallId, result.data.id);
    // console.log(result);
    //     sendParticipantToken(result.data, groupMembers, group.id);
    return result.data;
  } catch (error: any) {
    console.log(error.message);
  }
};

/**
 * Sends a private participant token for a given room and member.
 * @param room - The room object containing the room ID.
 * @param member - The member object containing the member details.
 * @returns The private participant token.
 */
export const sendPrivateParticipantToken = async (room: { id: string }, member: any) => {

  const url = `https://api.dyte.io/v2/meetings/${room.id}/participants`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${DYTE_KEY}`
    },
    body:
      `{
                    "name":"${member.username}",
                    "preset_name":"Test1",
                    "custom_participant_id":"${member.uid}"
                    }`
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result.data.token;


  } catch (error: any) {
  }


};

