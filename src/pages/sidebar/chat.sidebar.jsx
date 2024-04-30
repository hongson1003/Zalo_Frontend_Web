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
import './chat.sidebar.scss';
import { formatTimeAgo, getFriend } from "../../utils/handleChat";
import ChatPopover from "../../components/popover/chat.popover";
import { FILTER } from "../../redux/types/type.user";

const ChatSidebar = ({ current: currentSearch, statusChat }) => {


    const [chats, setChats] = useState([]);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState(STATE.PENDING);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const chat = useSelector(state => state.appReducer?.subNav);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isMouse, setIsMouse] = useState(null);
    const userState = useSelector(state => state.userReducer);

    useEffect(() => {
        fetchChats();
    }, [currentSearch, statusChat])

    const fetchChats = useCallback(async () => {
        const res = await axios.get(`/chat/pagination?limit=${limit}`);
        if (res.errCode === 0) {
            // filter
            let filterChats = res.data;

            if (statusChat === FILTER.NOT_READ) {
                filterChats = filterChats.filter(item => !item.seenBy.includes(user.id));
            }

            if (currentSearch) {
                filterChats = filterChats.filter(item => {
                    const friend = getFriend(user, item.participants);
                    return (item.name || friend?.userName).toLowerCase().includes(currentSearch.toLowerCase());
                })
            }

            setChats(filterChats);

            if (chat) {
                const currentChat = res.data.find(item => item._id === chat._id);
                dispatch(accessChat({ ...currentChat }));
            }
            setStatus(STATE.RESOLVE);
        } else {
            setStatus(STATE.REJECT);
        }
    }, [chat, currentSearch, statusChat]);

    // // lắng nghe sự kiện enter
    // useEffect(() => {
    //     const handleKeyPress = (e) => {
    //         if (e.key === 'Enter' && !chat) {
    //             dispatch(accessChat(chats[0]));
    //         }
    //     }
    //     if (chats.length) {
    //         window.addEventListener('keypress', handleKeyPress)
    //     }
    //     return () => {
    //         window.removeEventListener('keypress', handleKeyPress)
    //     }
    // }, [chats.length, chat])

    useEffect(() => {
        if (user) {
            setSelectedChat(chat);
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
            socket.on('new-chat', (data) => {
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
            socket.on('grant', data => {
                fetchChats();
            })
            socket.on('receive-message', data => {
                fetchChats();
                userState.fetchNotificationChats();
            })
        });

        return () => {
            socket.then(socket => {
                socket.off('transfer-disband-group');
                socket.off('new-chat');
                socket.off('add-member');
                socket.off('leave-group');
                socket.off('grant');
                socket.off('receive-message');
            })
        }

    }, [userState]);

    const handleSelectChat = (nextChat) => {
        if ((chat?._id !== nextChat._id && selectedChat?._id !== nextChat._id) || !chat) {
            dispatch(accessChat(nextChat));
            setSelectedChat(nextChat);
        }
    }

    const handleSelectChatDebouce = _.debounce(handleSelectChat, 150);

    const handleOnMouseOver = (chat) => {
        if (!isMouse)
            setIsMouse(chat);
    }

    const handleOnMouseLeave = () => {
        if (isMouse)
            setIsMouse(null);
    }


    return (
        <div className="chat-sidebar">
            {
                chats?.length > 0 && status === STATE.RESOLVE &&
                chats.map((chat, index) => {
                    return (
                        <div
                            key={chat?._id}
                            className={selectedChat?._id === chat?._id ? 'active-chat chat-box' : 'chat-box'}
                            onMouseOver={() => handleOnMouseOver(chat)}
                            onMouseLeave={handleOnMouseLeave}
                        >
                            <div
                                onClick={() => handleSelectChatDebouce(chat)}
                                className="chat-user"
                            >
                                <ChatUser
                                    key={index}
                                    chat={chat}
                                    activeKey={chat._id}
                                    fetchChats={fetchChats}
                                />
                            </div>
                            <div className="chat-right">
                                {
                                    isMouse && isMouse._id === chat?._id ?
                                        <ChatPopover
                                            // options
                                            chat={chat}
                                        >
                                            <div className="ultils">
                                                <div className="ultils-item">
                                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                                </div>
                                            </div>
                                        </ChatPopover>
                                        :
                                        <p className="time">
                                            {
                                                // handle time
                                                formatTimeAgo(chat?.updatedAt)
                                            }
                                        </p>
                                }
                                {
                                    chat.lastedMessage && !chat?.seenBy.includes(user?.id) &&
                                    <div className="notify">
                                        <i className="fa-solid fa-bell"></i>
                                    </div>
                                }
                            </div>
                        </div>
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