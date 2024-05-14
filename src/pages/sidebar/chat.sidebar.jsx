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


    useEffect(() => {
        if (chats && chats.length > 0) {
            chats.forEach(item => {
                socket.then(socket => {
                    socket.emit('join-room', item._id);
                })
            })
        }
    }, [chats.length]);

    // bắn chat đầu tiên
    useEffect(() => {
        if (fetchChats) {
            dispatch(fetchChatsFunc(fetchChats));
        }
    }, [fetchChats]);

    const handleTransferDisbandGroupSocket = () => {
        console.log('Nhóm đã bị giải tán');
        fetchChats();
    };

    const handleNewChatSocket = (data) => {
        fetchChats();
        setTimeout(() => {
            socket.emit('join-room', data?._id);
        }, 500);
    };

    const handleAddMemberSocket = (data) => {
        if (chat?._id === data._id) {
            dispatch(editGroup(data));
        }
        fetchChats();
    };

    const handleLeaveGroupSocket = (data) => {
        console.log('Nó rời nhóm');
        fetchChats();
    };

    const handleGrantSocket = (data) => {
        fetchChats();
    };

    const handleReceiveMessageSocket = (data) => {
        if (chat?._id !== data?.chat) {
            fetchChats();
            userState.fetchNotificationChats();
        }
    };

    useEffect(() => {
        if (userState.fetchNotificationChats) {
            socket.then((socket) => {
                socket.on('transfer-disband-group', handleTransferDisbandGroupSocket);
                socket.on('new-chat', handleNewChatSocket);
                socket.on('add-member', handleAddMemberSocket);
                socket.on('leave-group', handleLeaveGroupSocket);
                socket.on('grant', handleGrantSocket);
                socket.on('receive-message', handleReceiveMessageSocket);
            });
        }

        return () => {
            socket.then((socket) => {
                socket.off('transfer-disband-group', handleTransferDisbandGroupSocket);
                socket.off('new-chat', handleNewChatSocket);
                socket.off('add-member', handleAddMemberSocket);
                socket.off('leave-group', handleLeaveGroupSocket);
                socket.off('grant', handleGrantSocket);
                socket.off('receive-message', handleReceiveMessageSocket);
            });
        };
    }, [userState]);


    const handleSelectChat = (nextChat) => {
        dispatch(accessChat(nextChat));
    }

    const handleSelectChatDebouce = _.debounce(handleSelectChat, 270);

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
                chats.map((item, index) => {
                    return (
                        <div
                            key={item?._id}
                            className={item?._id === chat?._id ? 'active-chat chat-box' : 'chat-box'}
                            onMouseOver={() => handleOnMouseOver(item)}
                            onMouseLeave={handleOnMouseLeave}
                        >
                            <div
                                onClick={() => handleSelectChatDebouce(item)}
                                className="chat-user"
                            >
                                <ChatUser
                                    key={index}
                                    chat={item}
                                    activeKey={item._id}
                                    fetchChats={fetchChats}
                                />
                            </div>
                            <div className="chat-right">
                                {
                                    isMouse && isMouse._id === item?._id ?
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
                                                formatTimeAgo(item?.updatedAt)
                                            }
                                        </p>
                                }
                                {
                                    item.lastedMessage && !item?.seenBy.includes(user?.id) &&
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