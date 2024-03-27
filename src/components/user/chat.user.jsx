import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import { useDispatch, useSelector } from "react-redux";
import './chat.user.scss'
import { accessChat } from "../../redux/actions/user.action";
import { CHAT_STATUS } from "../../redux/types/type.user";
import { getFriend } from '../../utils/handleChat';

const ChatUser = ({ chat, activeKey }) => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const subNav = useSelector(state => state.appReducer.subNav);

    const handleOnClick = () => {
        dispatch(accessChat(chat));
    }

    return (
        <div className={`chat-user-container ${activeKey === subNav?._id && 'active-chat'}`} onClick={() => {
            handleOnClick()
        }}>
            {
                chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                    <AvatarUser
                        image={getFriend(user, chat.participants)?.avatar}
                        size={50} />
                ) : (
                    <div className="avatar-group" >
                        {
                            chat?.image ? (
                                <img src={chat?.image} alt="avatar" />
                            ) : (
                                chat?.participants?.length > 0 &&
                                chat?.participants?.map(item => {
                                    return (
                                        <React.Fragment key={item.id}>
                                            <AvatarUser
                                                image={item.avatar}
                                                size={25}
                                            />
                                        </React.Fragment>
                                    )
                                })
                            )
                        }
                    </div>
                )
            }

            <div className="right">
                <div className="top">
                    <p className="name">{getFriend(user, chat.participants)?.userName}</p>
                </div>
                <div className="bottom">
                    <p>{'Hi chào cậu'}</p>
                </div>
            </div>
        </div>
    );
}

export default ChatUser;