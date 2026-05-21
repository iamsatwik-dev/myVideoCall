import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
const server = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [usernames, setUsernames] = useState({});

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        getPermissions();
    }, []);

    useEffect(() => {
        if (localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    let handleStopScreenShare = () => {
        setScreen(false);
        
        if (window.screenStream) {
            window.screenStream.getTracks().forEach(track => track.stop());
            window.screenStream = null;
        }

        if (localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }

        const cameraTrack = window.localStream ? window.localStream.getVideoTracks()[0] : null;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            const pc = connections[id];
            if (!pc) continue;
            // Robust way to find the video sender using transceivers
            const transceiver = pc.getTransceivers().find(t => t.receiver.track.kind === 'video');
            const sender = transceiver ? transceiver.sender : null;
            if (sender) {
                sender.replaceTrack(cameraTrack);
                // Notify the remote peer that screen sharing has stopped
                socketRef.current.emit('signal', id, JSON.stringify({ 'screenShare': false }));
            }
        }
    }

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e))
            }
        } else {
            handleStopScreenShare();
        }
    }

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoAvailable(true);
            setAudioAvailable(true);
            setVideo(true);
            setAudio(true);
            window.localStream = stream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
            }
        } catch (error) {
            console.log("Error getting initial media permissions:", error);
            // Try video only fallback
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setVideoAvailable(true);
                setAudioAvailable(false);
                setVideo(true);
                setAudio(false);
                window.localStream = stream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
            } catch (err2) {
                // Try audio only fallback
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    setVideoAvailable(false);
                    setAudioAvailable(true);
                    setVideo(false);
                    setAudio(true);
                    window.localStream = stream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = stream;
                    }
                } catch (err3) {
                    console.log("No media devices available", err3);
                }
            }
        }

        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    };
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }






    let getDislayMediaSuccess = (stream) => {
        console.log("Screen share stream obtained successfully");
        
        const screenTrack = stream.getVideoTracks()[0];
        window.screenStream = stream;
        
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            const pc = connections[id];
            if (!pc) continue;
            // Robust way to find the video sender using transceivers
            const transceiver = pc.getTransceivers().find(t => t.receiver.track.kind === 'video');
            const sender = transceiver ? transceiver.sender : null;
            if (sender) {
                sender.replaceTrack(screenTrack);
                // Notify the remote peer that screen sharing has started
                socketRef.current.emit('signal', id, JSON.stringify({ 'screenShare': true }));
            }
        }

        screenTrack.onended = () => {
            handleStopScreenShare();
        };
    }

    const initPeerConnection = (socketListId) => {
        if (socketListId === socketIdRef.current) return null;
        if (connections[socketListId]) return connections[socketListId];

        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
        
        // ICE Candidate Handling
        connections[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`Sending ICE candidate to ${socketListId}`);
                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
        };

        // Handle incoming media stream (Replaces `onaddstream`)
        connections[socketListId].ontrack = (event) => {
            console.log(`Receiving track from: ${socketListId}`);

            let stream = event.streams[0];
            setVideos((prevVideos) => {
                const existingVideo = prevVideos.find((v) => v.socketId === socketListId);
                if (!existingVideo) {
                    return [...prevVideos, { socketId: socketListId, stream }];
                }
                return prevVideos;
            });
        };

        // Add local stream to connection
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                connections[socketListId].addTrack(track, window.localStream);
            });
        }

        // Broadcast local username to the newly connected peer
        if (socketRef.current) {
            console.log(`Broadcasting username "${username}" to ${socketListId}`);
            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'username': username }));
        }

        return connections[socketListId];
    };

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            const pc = initPeerConnection(fromId);
            if (!pc) return;

            if (signal.username !== undefined) {
                console.log(`Received username from ${fromId}: ${signal.username}`);
                setUsernames(prev => ({ ...prev, [fromId]: signal.username }));
                return;
            }

            if (signal.screenShare !== undefined) {
                console.log(`Peer ${fromId} screen sharing state: ${signal.screenShare}`);
                // Refresh the video element for this peer in the DOM to prevent black or frozen streams
                setTimeout(() => {
                    const videoEl = document.querySelector(`video[data-socket="${fromId}"]`);
                    if (videoEl && videoEl.srcObject) {
                        console.log("Refreshing remote video element srcObject for peer:", fromId);
                        const stream = videoEl.srcObject;
                        videoEl.srcObject = null;
                        videoEl.srcObject = stream;
                        videoEl.play().catch(e => console.log("Error playing refreshed remote video stream:", e));
                    }
                }, 500); // 500ms delay to allow WebRTC stream switch to stabilize
                return;
            }

            if (signal.sdp) {
                pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    // Process any queued ICE candidates
                    if (pc.iceQueue) {
                        pc.iceQueue.forEach(candidate => {
                            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log("Error adding queued ICE candidate:", e));
                        });
                        pc.iceQueue = [];
                    }

                    if (signal.sdp.type === 'offer') {
                        pc.createAnswer().then((description) => {
                            pc.setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': pc.localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
                } else {
                    if (!pc.iceQueue) {
                        pc.iceQueue = [];
                    }
                    pc.iceQueue.push(signal.ice);
                }
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
    
        socketRef.current.on('signal', gotMessageFromServer);
    
        socketRef.current.on('connect', () => {
            const roomId = "test-room"; // Ensure all users use the same room
            console.log(`Joining room: ${roomId}`);
            socketRef.current.emit('join-call', roomId);
            socketIdRef.current = socketRef.current.id;
    
            socketRef.current.on('chat-message', addMessage);
    
            socketRef.current.on('user-left', (id) => {
                console.log(`User ${id} left`);
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                setUsernames((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            });
    
            socketRef.current.on('user-joined', (id, clients) => {
                console.log(`User joined: ${id}, Existing clients: `, clients);
    
                clients.forEach((socketListId) => {
                    initPeerConnection(socketListId);
                });
    
                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        const pc = connections[id2];
                        if (!pc) continue;
    
                        // Create and send offer
                        pc.createOffer().then((description) => {
                            pc.setLocalDescription(description)
                                .then(() => {
                                    console.log(`Sending SDP offer to ${id2}`);
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': pc.localDescription }));
                                }).catch(e => console.error(e));
                        }).catch(e => console.error(e));
                    }
                }
            });
        });
    };
    
    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo((prev) => {
            const nextVal = !prev;
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(track => track.enabled = nextVal);
            }
            return nextVal;
        });
    }
    
    let handleAudio = () => {
        setAudio((prev) => {
            const nextVal = !prev;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(track => track.enabled = nextVal);
            }
            return nextVal;
        });
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        console.log("Sending message:", message);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setMessages([]);
        setAskForUsername(false);
        getMedia();
    }

    const getGridClass = () => {
        if (videos.length === 1) return styles.grid1;
        if (videos.length === 2) return styles.grid2;
        if (videos.length === 3) return styles.grid3;
        if (videos.length === 4) return styles.grid4;
        return styles.gridGeneric;
    };

    const localVideoClass = videos.length === 0 ? styles.meetUserVideoFullScreen : styles.meetUserVideoFloating;

    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyHeader}>
                        <h2>My Video Call</h2>
                    </div>

                    <div className={styles.lobbyContent}>
                        {/* Left Column: Video Preview */}
                        <div className={styles.lobbyPreviewArea}>
                            <div className={styles.lobbyVideoWrapper}>
                                <video ref={localVideoref} autoPlay muted playsInline className={styles.lobbyVideo}></video>
                                
                                <div className={styles.lobbyVideoControls}>
                                    <IconButton 
                                        onClick={handleVideo} 
                                        className={video ? styles.lobbyBtnActive : styles.lobbyBtnInactive}
                                    >
                                        {video ? <VideocamIcon /> : <VideocamOffIcon />}
                                    </IconButton>
                                    <IconButton 
                                        onClick={handleAudio} 
                                        className={audio ? styles.lobbyBtnActive : styles.lobbyBtnInactive}
                                    >
                                        {audio ? <MicIcon /> : <MicOffIcon />}
                                    </IconButton>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Connection Form */}
                        <div className={styles.lobbyControlArea}>
                            <div className={styles.lobbyFormCard}>
                                <h3 className={styles.lobbyFormTitle}>Ready to Join?</h3>
                                <p className={styles.lobbyFormSubtitle}>Enter your display name to connect to the meeting room.</p>
                                
                                <TextField 
                                    className={styles.lobbyTextField}
                                    id="outlined-basic" 
                                    label="Username" 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    variant="outlined"
                                    fullWidth
                                    autoFocus
                                    InputProps={{
                                        style: { color: 'white' }
                                    }}
                                />
                                
                                <Button 
                                    className={styles.lobbyJoinBtn}
                                    variant="contained" 
                                    onClick={connect}
                                    disabled={!username || !username.trim()}
                                >
                                    Join Meeting
                                </Button>
                            </div>
                        </div>
                    </div>
                </div> :


                <div className={styles.meetVideoContainer}>
                   
                    <div className={styles.mainContent}>
                        <div className={styles.videoArea}>
                            <video className={localVideoClass} ref={localVideoref} autoPlay muted playsInline></video>

                            <div className={`${styles.conferenceView} ${getGridClass()}`}>
                                {videos.map((video) => (
                                    <div className={styles.videoCell} key={video.socketId}>
                                        <video
                                            data-socket={video.socketId}
                                            ref={ref => {
                                                if (ref && video.stream) {
                                                    ref.srcObject = video.stream;
                                                }
                                            }}
                                            autoPlay
                                            playsInline
                                        />
                                        <div className={styles.peerNameOverlay}>
                                            {usernames[video.socketId] || `Participant (${video.socketId.substring(0, 5)})`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {showModal ? (
                            <div className={styles.chatRoom}>
                                <div className={styles.chatContainer}>
                                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.5rem", fontWeight: "600", color: "#ffffff" }}>Chat</h3>

                                    <div className={styles.chattingDisplay}>
                                        {messages.length !== 0 ? messages.map((item, index) => {
                                            return (
                                                <div style={{ marginBottom: "16px" }} key={index}>
                                                    <p style={{ fontWeight: "600", fontSize: "0.9rem", color: "#3b82f6", margin: "0 0 4px 0" }}>{item.sender}</p>
                                                    <p style={{ margin: "0", color: "#f3f4f6", fontSize: "0.95rem", wordBreak: "break-word" }}>{item.data}</p>
                                                </div>
                                            )
                                        }) : <p style={{ color: "rgba(255, 255, 255, 0.4)", textAlign: "center", marginTop: "20px" }}>No Messages Yet</p>}
                                    </div>

                                    <div className={styles.chattingArea} style={{ gap: "5px" }}>
                                        <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                        <Button variant='contained' onClick={sendMessage}>Send</Button>
                                    </div>
                                </div>
                            </div>
                        ) : <></>}
                    </div>

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                </div>

            }

        </div>
    )
}