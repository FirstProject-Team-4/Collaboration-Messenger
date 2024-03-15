// const startGroupVideoCall = async () => {
//     try {
//         setIsCallStarted(true);

//         const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
//         // Set localStream state to be able to display the local video
//         setLocalStream(localStream);
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = localStream;
//         }


//         // For each member in the group, create a new RTCPeerConnection and send an offer to them
//         for (const member of groupMembers) {
//             if (member.username === userData?.username) {
//                 continue;
//             }
//             const peerConnection = new RTCPeerConnection(stunConfig);
   
//             //Pushing the peer connection to the peerConnections array to be able to close it later
//             peerConnections.current.push(peerConnection);

//             //ADDING LOCAL STREAM TO PEER CONNECTION 
//             localStream.getTracks().forEach(track => {
//                 peerConnection.addTrack(track, localStream);

//             });
//             console.log(peerConnection)
//             //CREATING OFFER AND SETTING LOCAL DESCRIPTION
//             const offer = await peerConnection.createOffer();
//             await peerConnection.setLocalDescription(offer);

//             //LISTENING FOR ANSWERS
//             onValue(ref(db, `GroupCalls/answers/${userData?.username}`), async snapshot => {
//                 if (!snapshot.exists()) {
//                     return;
//                 }
//                 console.log('Received new answer');
//                 const data = snapshot.val();
//                 console.log(`${data} THIS SHOULD BE ANSWER`);
//                 if (data && data.caller === userData.username) {

//                     console.log(`${data.answer} THIS SHOULD BE SDP AND TYPE`);
//                     const answer = new RTCSessionDescription(data.answer);
//                     await peerConnection.setRemoteDescription(answer);
//                     onValue(ref(db, `GroupCalls/${id}/iceCandidates/${userData.username}`), async snapshot => {
//                         if (!snapshot.exists()) {
//                             return;
//                         }
//                         const data = snapshot.val();
//                         console.log(`${data.candidate} THIS SHOULD BE ICE CANDIDATE`)
//                         console.log('Received new ICE candidate');
//                         if (data && data.target === userData?.username) {
//                             const candidate = new RTCIceCandidate(data.candidate);
//                             console.log(`${candidate} THIS SHOULD BE ICE CANDIDATE`);
//                             await peerConnection.addIceCandidate(candidate);
//                             console.log('Added ICE candidate to peer connection');
//                         }
//                     });
//                 }

//             });
//             //ICE CANDIDATES 
//             peerConnection.onicecandidate = async (event) => {
//                 if (event.candidate) {
//                     const candidate = event.candidate.toJSON();
//                     const iceCandidateRef = ref(db, `GroupCalls/${id}/iceCandidates/${member.username}`);
//                     const obj = {
//                         target: member.username,
//                         candidate: candidate,
//                     };
//                     await update(iceCandidateRef, obj);

//                 }
//             };



//             //LISTENING FOR TRACKS
//             peerConnection.ontrack = (event) => {
//                 setRemoteStream(prevStreams => {
//                     console.log(event.streams[0])
//                     if (!prevStreams.some(existingStream => existingStream.username === member.username)) {
//                         const newStreams = [...prevStreams, { stream: event.streams[0], username: member.username }];
//                         console.log('remoteStream state after update', newStreams); // Check if the remoteStream state is being updated correctly
//                         return newStreams;
//                     } else {

//                         return prevStreams;
//                     }
//                 });
//             };
//             //LISTENING FOR ICE CANDIDATES
//             onValue(ref(db, `GroupCalls/${id}/iceCandidates/${userData.username}`), async snapshot => {
//                 if (!snapshot.exists()) {
//                     return;
//                 }
//                 const data = snapshot.val();
//                 console.log(`${data.candidate} THIS SHOULD BE ICE CANDIDATE`)
//                 console.log('Received new ICE candidate');
//                 if (data && data.target === userData?.username) {
//                     const candidate = new RTCIceCandidate(data.candidate);
//                     console.log(`${candidate} THIS SHOULD BE ICE CANDIDATE`);
//                     await peerConnection.addIceCandidate(candidate);
//                     console.log('Added ICE candidate to peer connection');
//                 }
//             });

//             //SENDING OFFERS
//             const offerRef = ref(db, `GroupCalls/${id}/offers/${member.username}`);
//             await update(offerRef, {
//                 target: member.username,
//                 caller: userData?.username,
//                 offer: {
//                     type: offer.type,
//                     sdp: offer.sdp
//                 }
//             });
//             peerConnection.onconnectionstatechange = () => {
//                 console.log('  Connection state change for:', member.username, 'New state:', peerConnection.connectionState);
//             };
//         }
//     } catch (e) {

//     }
// }



// const answerCall = async (offer: any) => {

//     setIsCallStarted(true);
// ;

//     const peerConnection = new RTCPeerConnection(stunConfig);
//     peerConnections.current.push(peerConnection);

//     const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
//     if (localVideoRef.current) {
//         localVideoRef.current.srcObject = localStream;
//     }
//     localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

//     // Set up event handlers before calling setRemoteDescription and createAnswer
//     peerConnection.ontrack = (event) => {
//         console.log('ontrack event called');
//         console.log(event);
//         setRemoteStream(prevStreams => [...prevStreams, { stream: event.streams[0], username: userData?.username }]);
//     };
//     peerConnection.onicecandidate = async (event) => {
//         if (event.candidate) {
//             const candidate = event.candidate.toJSON();
//             const iceCandidateRef = ref(db, `GroupCalls/${id}/iceCandidates/${offer.caller}`);
//             await update(iceCandidateRef, {
//                 target: offer.caller,
//                 candidate: candidate,
//             });
//         }
//     };

//     // Now call setRemoteDescription and createAnswer
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);

//     // Listen for new ICE candidates and add them to the peer connection
//     onValue(ref(db, `GroupCalls/${id}/iceCandidates/${userData.username}`), async snapshot => {
//         const data = snapshot.val();
//         console.log(data);
//         if (data && data.target === userData?.username) {
//             console.log('ice candidate event called');
//             const candidate = new RTCIceCandidate(data.candidate);
//             console.log(`${candidate} THIS SHOULD BE ICE CANDIDATE`);
//             await peerConnection.addIceCandidate(candidate);
//         }
//     });



//     const answerRef = ref(db, `GroupCalls/${id}/answers/${offer.caller}`);
//     await set(answerRef, {
//         caller: offer.caller,
//         answer: {
//             type: answer.type,
//             sdp: answer.sdp
//         }
//     });
// }






// const handleEndCall = () => {
//     setRemoteStream([]);
//     setIsCallStarted(false);

//     localStream?.getTracks().forEach(track => track.stop());

//     peerConnections.current.forEach(connection => connection.close());
//     peerConnections.current = [];
// };
// const startScreenSharing = async () => {
//     try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//         if (localVideoRef.current) {
//             localVideoRef.current.srcObject = screenStream;
//             setIsScreenSharing(true);
//         }
//     } catch (e) {
//         console.log(e);
//     }
// };
// const stopScreenSharing = () => {
//     if (localVideoRef.current) {
//         const screenStream = localVideoRef.current.srcObject as MediaStream;
//         screenStream.getTracks().forEach(track => track.stop());
//         peerConnections.current.forEach(connection => connection.close());
//         peerConnections.current = [];
//         setIsScreenSharing(false);
//     };
// }