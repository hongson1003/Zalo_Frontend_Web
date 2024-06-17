import React, { useEffect, useRef, useState } from 'react';
import './videoCall.window.scss';
import { socket } from '../utils/io';
import { Peer } from 'peerjs';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../utils/axios';
import { getFriend } from '../utils/handleChat';
import { STATE } from '../redux/types/app.type';
import { getFirstLetters } from '../utils/handleUltils';
import { Howl, Howler } from 'howler';
import { toast } from 'react-toastify';

var sound = new Howl({
  src: ['/videos/chuong-apple.mp3'],
});

var peer = null;
const VideoCallWindow = () => {
  const onlyRef = useRef(false);
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatRef = useRef(searchParams.get('chat'));
  const isCalled = useRef(searchParams.get('isCalled'));
  const user = useSelector((state) => state.appReducer.userInfo.user);
  const [friend, setFriend] = useState(null);
  const [state, setState] = useState(STATE.PENDING);
  const [incommingCall, setIncommingCall] = useState(false);
  const answerButtonRef = useRef(null);

  const fetchFriend = async () => {
    try {
      const res = await axios.get(`/chat/access?chatId=${chatRef.current}`);
      if (res.errCode === 0) {
        const data = res.data;
        const friend = getFriend(user, data.participants);
        setFriend(friend);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      fetchFriend();
    }
    if (onlyRef.current === false) {
      peer = new Peer(user.peerId);
      peer.on('open', (id) => {
        socket.then((socket) => {
          socket.emit('join-call', {
            room: chatRef.current,
            peerId: id,
          });

          sound.play();

          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .then((stream) => {
              myVideoRef.current.srcObject = stream;
              myVideoRef.current.muted = true;

              if (isCalled.current === 'false') {
                socket.emit('open-call', {
                  room: chatRef.current,
                  peerId: user.peerId,
                });
              }

              peer.on('call', (call) => {
                setIncommingCall(call);
                sound.play();
                answerButtonRef.current.addEventListener('click', handleAnswer);

                function handleAnswer() {
                  call.answer(stream);
                  setState(STATE.RESOLVE);
                  call.on('stream', (userVideoStream) => {
                    setTimeout(() => {
                      remoteVideoRef.current.srcObject = userVideoStream;
                    }, 500);
                  });
                  sound.stop();
                  setTimeout(() => {
                    setState(STATE.RESOLVE);
                  }, 100);
                }
              });

              socket.on('user-connected', (peerId) => {
                connectToNewUser(peerId, stream);
              });
            });
        });
      });
      onlyRef.current = true;
    }
    return () => {
      // peer.destroy();
    };
  }, []);

  const connectToNewUser = (peerId, stream) => {
    socket.then((socket) => {
      socket.on('reject-call', (data) => {
        window.close();
      });
    });
    const call = peer.call(peerId, stream);
    call.on('stream', (userVideoStream) => {
      setState(STATE.RESOLVE);
      setTimeout(() => {
        remoteVideoRef.current.srcObject = userVideoStream;
        sound.stop();
      }, 200);
    });
  };

  const handleRejectCall = () => {
    // Tắt kết nối
    socket.then((socket) => {
      socket.emit('reject-call', {
        room: chatRef.current,
        peerId: user.peerId,
      });
    });
    if (incommingCall) {
      incommingCall.close();
      setIncommingCall(null);
    }
    window.close();
  };

  return (
    <div className="main-video-call">
      <div className="my-video">
        <video ref={myVideoRef} autoPlay></video>
      </div>

      {state === STATE.PENDING ? (
        <div className="group-avatar">
          {friend && (
            <div className="avatar" style={{ backgroundColor: friend?.avatar }}>
              <img src={friend?.avatar} />
              <p className="name">{getFirstLetters(friend?.userName)}</p>
            </div>
          )}
          <p className="calling">Đang gọi ...</p>
        </div>
      ) : (
        <div className="remote-main">
          <video ref={remoteVideoRef} autoPlay></video>
        </div>
      )}

      <footer>
        <div className="group-item">
          <div className="item">
            <i className="fa-solid fa-camera"></i>
          </div>
          {isCalled.current === 'true' && state === STATE.PENDING ? (
            <>
              <div className="item phone-accept" ref={answerButtonRef}>
                <i className="fa-solid fa-phone"></i>
              </div>
              <div
                className="item phone-reject"
                onClick={() => handleRejectCall()}
              >
                <i className="fa-solid fa-phone"></i>
              </div>
            </>
          ) : (
            <div
              className="item phone-reject"
              onClick={() => handleRejectCall()}
            >
              <i className="fa-solid fa-phone"></i>
            </div>
          )}

          <div className="item">
            <i className="fa-solid fa-microphone"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VideoCallWindow;
