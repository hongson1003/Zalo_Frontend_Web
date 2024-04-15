import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from '../../utils/axios';
import ChatUser from "../../components/user/chat.user";
import { socket } from "../../utils/io";
import { toast } from "react-toastify";
import { STATE } from "../../redux/types/type.app";
import { accessChat, fetchChatsFunc } from "../../redux/actions/user.action";
import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash';
import { editGroup } from "../../redux/actions/app.action";

const ChatSidebar = () => {
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState(STATE.PENDING);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const chat = useSelector(state => state.appReducer?.subNav);
    const [selectedChat, setSelectedChat] = useState(null);

    const fetchChats = useCallback(async () => {
        const res = await axios.get(`/chat/pagination?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setChats(res.data);
            if (chat) {
                const currentChat = res.data.find(item => item._id === chat._id);
                dispatch(accessChat({ ...currentChat }));
            }
            setStatus(STATE.RESOLVE);
        } else {
            setStatus(STATE.REJECT);
        }
    }, [chat])

    // lắng nghe sự kiện enter
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && !chat) {
                dispatch(accessChat(chats[0]));
            }
        }
        if (chats.length) {
            window.addEventListener('keypress', handleKeyPress)
        }
        return () => {
            window.removeEventListener('keypress', handleKeyPress)
        }
    }, [chats.length, chat])

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [chat?._id])


    useEffect(() => {
        if (chats && chats.length > 0) {
            chats.forEach(item => {
                socket.then(socket => {
                    socket.emit('join-room', item._id);
                })
            })
        }
    }, [chats.length])

    // bắn chat đầu tiên
    useEffect(() => {
        if (fetchChats) {
            dispatch(fetchChatsFunc(fetchChats));
        }
    }, [fetchChats]);

    useEffect(() => {
        socket.then(socket => {
            socket.on('transfer-disband-group', (data) => {
                console.log('Nhóm đã bị giải tán')
                fetchChats();
            })
            socket.on('new-group-chat', (data) => {
                fetchChats();
                setTimeout(() => {
                    socket.emit('join-room', data._id);
                }, 500);
            })
            socket.on('add-member', (data) => {
                if (chat?._id === data._id) {
                    dispatch(editGroup(data));
                }
                fetchChats();
            })
            socket.on('leave-group', data => {
                console.log('nó rời nhóm')
                fetchChats();
            })
        })
    }, []);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        dispatch(accessChat(chat));
    }

    const handleSelectChatDebouce = _.debounce(handleSelectChat, 200)


    return (
        <div style={{ overflowY: 'scroll', height: 'calc(100vh - 100px)' }}>
            {
                chats?.length > 0 && status === STATE.RESOLVE &&
                chats.map((chat, index) => {
                    return (
                        <span key={chat._id}
                            onClick={() => handleSelectChatDebouce(chat)}
                        >
                            <ChatUser
                                key={index}
                                chat={chat}
                                activeKey={chat._id}
                                fetchChats={fetchChats}
                            />
                        </span>
                    )
                })
            }
            {
                status === STATE.REJECT && (
                    <div style={{
                        padding: "10px",
                    }}>
                        <p>Không có cuộc trò chuyện nào</p>
                    </div>
                )
            }
        </div>
    );
}

export default ChatSidebar;