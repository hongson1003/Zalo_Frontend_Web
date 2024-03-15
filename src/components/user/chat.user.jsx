import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import { useDispatch, useSelector } from "react-redux";
import './chat.user.scss'
import { accessChat } from "../../redux/actions/user.action";
import { CHAT_STATUS } from "../../redux/types/type.user";

const ChatUser = ({ chat, activeKey }) => {
    const [myChat, setMyChat] = useState({});
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const subNav = useSelector(state => state.appReducer.subNav);

    useEffect(() => {
        if (chat) {
            const newChat = handleGetChatStandard(chat);
            setMyChat(newChat);
        }
    }, [])

    const handleGetChatStandard = (chat) => {
        const participants = chat.participants;
        let myFriend = null;
        if (chat.type === CHAT_STATUS.PRIVATE_CHAT) {
            myFriend = participants.find(item => item?.id !== user.id);
        }
        const newChat = {
            ...chat,
            image: chat.groupPhoto || myFriend?.avatar,
            lastMessage: chat.lastMessage,
            updatedAt: chat.updatedAt,
        }
        if (myFriend) {
            newChat.user = myFriend;
        }
        return newChat;
    }

    const handleOnClick = () => {
        dispatch(accessChat(myChat));
    }

    return (
        <div className={`chat-user-container ${activeKey === subNav?._id && 'active-chat'}`} onClick={() => {
            handleOnClick()
        }}>
            <AvatarUser {...myChat} size={50} />
            <div className="right">
                <div className="top">
                    <p className="name">{myChat.name || myChat?.user?.userName}</p>
                </div>
                <div className="bottom">
                    <p>{myChat.lastMessage?.content || 'Hi chào cậu'}</p>
                </div>
            </div>
        </div>
    );
}

export default ChatUser;