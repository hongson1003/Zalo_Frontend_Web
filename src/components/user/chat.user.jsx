import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import { useDispatch, useSelector } from "react-redux";
import './chat.user.scss'
import { accessChat } from "../../redux/actions/user.action";
import { CHAT_STATUS, MESSAGES } from "../../redux/types/type.user";
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
                        size={50}
                        name={getFriend(user, chat.participants)?.userName}
                    />
                ) : (
                    <div className="avatar-group" >
                        {
                            chat?.groupPhoto ? (
                                <AvatarUser
                                    image={chat?.groupPhoto}
                                    size={50} />
                            ) : (
                                chat?.participants?.length > 0 &&
                                chat?.participants?.map(item => {
                                    return (
                                        <React.Fragment key={item.id}>
                                            <AvatarUser
                                                image={item.avatar}
                                                style={{
                                                    width: '50%'
                                                }}
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
                    {
                        chat?.type === CHAT_STATUS.PRIVATE_CHAT ?
                            <p className="name">{getFriend(user, chat.participants)?.userName}</p> :
                            <p className="name">{chat?.name}</p>
                    }
                </div>
                <div className="bottom">
                    <p>
                        {
                            chat?.lastedMessage?.type === MESSAGES.TEXT ?
                                chat.lastedMessage?.content : (
                                    chat.lastedMessage?.type === MESSAGES.IMAGES ? 'Đã gửi ảnh' : (
                                        chat.lastedMessage?.type === MESSAGES.FILE_FOLDER ? 'Đã gửi file' : (
                                            chat.lastedMessage?.type === MESSAGES.VIDEO ? 'Đã gửi video' : (
                                                chat.lastedMessage?.type === MESSAGES.STICKER ? 'Đã gửi sticker' : ''
                                            )
                                        )
                                    )
                                )
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatUser;