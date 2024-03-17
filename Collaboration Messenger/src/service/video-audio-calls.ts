import { ref, update } from "firebase/database";
import { MembersProps } from "../components/group-components/GroupMembers";
import { db } from "../config/config-firebase";


export const DYTE_KEY=`ODgzMTNlZDQtNzQwZi00ZDM5LWFiMzQtZGFjNTNiNzQwYTE1OmNmY2RmZGM4NTljY2VlYTgxZDRh`
export const createDyteRoom = async (groupMembers: MembersProps,group:{id:string|null,title:string}) => {
    const DYTE_URL = 'https://api.dyte.io/v2';
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:`Basic ODgzMTNlZDQtNzQwZi00ZDM5LWFiMzQtZGFjNTNiNzQwYTE1OmNmY2RmZGM4NTljY2VlYTgxZDRh`
        },
        body: `{"title":"${group.title}","preferred_region":"ap-south-1","record_on_start":false,"live_stream_on_start":false,"recording_config":{"max_seconds":60,"file_name_prefix":"string","video_config":{"codec":"H264","width":1280,"height":720,"watermark":{"url":"http://example.com","size":{"width":1,"height":1},"position":"left top"}},"audio_config":{"codec":"AAC","channel":"stereo"},"storage_config":{"type":"aws","access_key":"string","secret":"string","bucket":"string","region":"us-east-1","path":"string","auth_method":"KEY","username":"string","password":"string","host":"string","port":0,"private_key":"string"},"dyte_bucket_config":{"enabled":true},"live_streaming_config":{"rtmp_url":"rtmp://a.rtmp.youtube.com/live2"}}}`
      };
      try {
        const response = await fetch(`${DYTE_URL}/meetings`, options);
        console.log(response);

        const result = await response.json();
        console
    
        //await addDyteRoomIdToCall(dbCallId, result.data.id);
    // console.log(result);
    //     sendParticipantToken(result.data, groupMembers, group.id);
    return result.data;
      } catch (error:any) {
        console.log(error.message);
      }
    };
    export const sendParticipantToken = async (room:{id:string}, member:MembersProps,currentGroupID:string|null) => {
       
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
                    console.log(response);
                    const result = await response.json();
                    console.log(result.data);
                    update(ref(db, `groups/${currentGroupID}/members/${member.username}/token`), {token:result.data.token});

                } catch (error:any) {
                    console.log(error.message);
                }


    }

