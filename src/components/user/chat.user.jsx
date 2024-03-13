import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import { useDispatch, useSelector } from "react-redux";
import './chat.user.scss'
import { accessChat } from "../../redux/actions/user.action";

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
        const myFriend = participants.find(item => item?.id !== user.id);
        return {
            ...chat,
            image: myFriend?.avatar || chat.groupPhoto,
            user: myFriend,
            lastMessage: chat.lastMessage,
            updatedAt: chat.updatedAt,
        }
    }

    const handleOnClick = () => {
        dispatch(accessChat(myChat));
    }

    return (
        <div className={`chat-user-container ${activeKey === subNav?._id && 'active-chat'}`} onClick={() => {
            handleOnClick()
        }}>
            <AvatarUser {...myChat} />
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