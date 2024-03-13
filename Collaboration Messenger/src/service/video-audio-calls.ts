import { ref, set } from "firebase/database";
import { db } from "../config/config-firebase";

export const stunConfig = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        },
        {
            urls: 'stun:stun1.l.google.com:19302'
        },
        {
            urls: 'stun:stun2.l.google.com:19302'
        },
        {
            urls: 'stun:stun3.l.google.com:19302'
        },
        {
            urls: 'stun:stun4.l.google.com:19302'
        }
    ]
};


export const createGroupOffer = async (peerConnection: RTCPeerConnection, callId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Get the media stream
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream)); // Add the media stream to the peer connection

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer); // Set the offer to the local description

    const offerRef = ref(db, `calls/${callId}/offer`); // Save the offer to Firebase
    set(offerRef, {
        type: offer.type,
        sdp: offer.sdp
    });

    return offer; // Return the offer
}
export const createAnswer = async (peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit, callId: string, participantId: string) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Save the answer to Firebase
    const answerRef = ref(db, `calls/${callId}/participants/${participantId}/answer`);
    set(answerRef, {
        type: answer.type,
        sdp: answer.sdp
    });

    return answer;
}




