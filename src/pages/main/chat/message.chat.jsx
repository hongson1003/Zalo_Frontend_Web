import React, { useCallback, useEffect, useRef, useState } from "react";
import './message.chat.scss';
import { Popover } from 'antd';
import EmoijPopup from "./emoijPopup.chat";
import Tym from "../../../components/customize/tym";
import _ from 'lodash';
import { useSelector } from "react-redux";
import axios from '../../../utils/axios';
import { socket } from '../../../utils/io';
import { METHOD_MESSAGE } from "../../../redux/types/type.user";
const items = [
    {
        key: METHOD_MESSAGE.COPY,
        item: () => (
            <div >
                <i className="fa-regular fa-copy"></i>
                <p>Copy hình ảnh</p>
            </div>
        )
    },
    {
        key: METHOD_MESSAGE.PIN,
        item: () => (
            <div >
                <i className="fa-solid fa-thumbtack"></i>
                <p>Ghim tin nhắn</p>
            </div>
        )
    },
    {
        key: METHOD_MESSAGE.VIEW_DETAIL,
        item: () => (
            <div >
                <i className="fa-solid fa-circle-info"></i>
                <p>Xem chi tiết</p>
            </div>
        )
    },
    {
        key: METHOD_MESSAGE.DELETE_ALL,
        item: () => (
            <div className="thu-hoi-tin-nhan">
                <i className="fa-regular fa-square-minus"></i>
                <p>Thu hồi tin nhắn</p>
            </div>
        )
    },
    {
        key: METHOD_MESSAGE.DELETE_MYSEFL,
        item: () => (
            <div className="xoa-chi-o-phia-toi thu-hoi-tin-nhan">
                <i className="fa-regular fa-square-minus"></i>
                <p>Xóa chỉ ở phía tôi</p>
            </div>
        )
    }
]

const content = ({ optionsRef, message, handleModifyMessage }) => {
    const contentRef = useRef(null);

    const deleteMessage = async (messageId) => {
        const res = await axios.put('/chat/message/deleteMessage', {
            messageId: messageId
        });
        if (res.errCode === 0) {
            handleModifyMessage(res.data);
            socket.then(socket => {
                socket.emit('modify-message', res.data);
            })
        }
    }

    const deleteMessageMySelf = async (messageId) => {
        const res = await axios.put('/chat/message/recall', {
            messageId: messageId
        });
        if (res.errCode === 0) {
            handleModifyMessage(res.data);
            // socket.then(socket => {
            //     socket.emit('modify-message', res.data);
            // })
        }
    }

    const handleOnClick = (Element) => {
        const { key } = Element;
        switch (key) {
            case METHOD_MESSAGE.COPY:
                console.log('Copy hình ảnh');
                break;
            case METHOD_MESSAGE.PIN:
                console.log('Ghim tin nhắn');
                break;
            case METHOD_MESSAGE.VIEW_DETAIL:
                console.log('Xem chi tiết');
                break;
            case METHOD_MESSAGE.DELETE_ALL:
                deleteMessage(message._id);
                break;
            case METHOD_MESSAGE.DELETE_MYSEFL:
                deleteMessageMySelf(message._id);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.addEventListener('mouseover', () => {
                optionsRef.current.classList.add('show-options');
            })
            contentRef.current.addEventListener('mouseleave', () => {
                optionsRef.current.classList.remove('show-options');
            })
        }
    }, [])

    return (
        <div className="subOption" ref={contentRef}>
            {
                items && items.length > 0 &&
                items.map((Element) => (
                    <div
                        className="option-sub-item"
                        key={Element.key}
                        onClick={() => handleOnClick(Element)}
                    >
                        <Element.item />
                    </div>
                ))
            }

        </div>
    )
}

const MessageChat = ({ children, isLeft, message, handleModifyMessage, isImage, lasted }) => {
    const optionsRef = useRef(null);
    const messageHoverContainerRef = useRef(null);
    const frameTymRef = useRef(null);
    const [selectedReaction, setSelectedReaction] = useState('👌');
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const [allowOpen, setAllowOpen] = useState(true);
    const [enableMouseOver, setEnableMouseOver] = useState(true);
    const clickRef = useRef(null);

    // socket thả tym tin nhắn
    useEffect(() => {
        if (clickRef.current) {
            socket.then(socket => {
                socket.on('receive-reaction', (data) => {
                    console.log('data', data);
                })
            })
        }
    }, []);

    useEffect(() => {
        const addShowOptions = () => {
            optionsRef.current.classList.add('show-options');
        }
        const removeShowOptions = () => {
            optionsRef.current.classList.remove('show-options');
        }

        const addShowFrameTym = () => {
            frameTymRef.current.classList.add('show-frame-tym');
            if (enableMouseOver) {
                setAllowOpen(true);
            }
        };

        const removeShowFrameTym = (e) => {
            if (!(e.toElement?.className === 'emoij-popup-container' || e.toElement?.className === 'reaction' || e.toElement?.className === 'tym-message' || e.toElement?.className === 'tym-icon-123 active' || e.toElement?.className === 'tym-icon-123' || e.toElement?.className === 'tym-main-container-xyz' || e.toElement?.className === 'tyms-frame' || e.toElement?.className === 'tyms-heart')) {
                frameTymRef.current.classList.remove('show-frame-tym');
                setAllowOpen(false);
            }
        };

        if (messageHoverContainerRef.current && frameTymRef.current) {
            messageHoverContainerRef.current.addEventListener('mouseover', addShowOptions);
            messageHoverContainerRef.current.addEventListener('mouseleave', removeShowOptions);
            messageHoverContainerRef.current.addEventListener('mouseover', addShowFrameTym);
            messageHoverContainerRef.current.addEventListener('mouseleave', removeShowFrameTym);
        }

        return () => {
            if (messageHoverContainerRef.current && frameTymRef.current) {
                messageHoverContainerRef.current.removeEventListener('mouseover', addShowOptions);
                messageHoverContainerRef.current.removeEventListener('mouseleave', removeShowOptions);
                messageHoverContainerRef.current.removeEventListener('mouseover', addShowFrameTym);
                messageHoverContainerRef.current.removeEventListener('mouseleave', removeShowFrameTym);
            }
        }
    }, [enableMouseOver]);

    const handleAllowOpen = useCallback(_.debounce((value) => {
        setAllowOpen(value);
        setEnableMouseOver(value);
    }, 500), []);

    const handleSendReaction = async (messageId, userId, icon) => {
        const res = await axios.post('/chat/feeling', {
            messageId,
            userId,
            icon
        })
        if (res.errCode === 0) {
            socket.then(socket => {
                console.log('đã emit', message.chat._id)
                socket.emit('send-reaction', { messageId, userId, icon });
            })
        }

    }

    const handleTymMessage = async (icon) => {
        setAllowOpen(false);
        setEnableMouseOver(false);
        handleAllowOpen(true);
        const newMessage = { ...message };
        const arrayReaction = newMessage?.reactions || [];
        const reactionExists = arrayReaction.find(reaction => (reaction.userId === user.id) && reaction.icon === icon);
        if (!reactionExists) {
            arrayReaction.push({
                userId: user.id,
                icon: icon,
                count: 1
            })
        } else {
            arrayReaction.forEach(reaction => {
                if (reaction.userId === user.id && reaction.icon === icon) {
                    reaction.count += 1;
                }
            })
        }
        newMessage.reactions = arrayReaction;
        handleModifyMessage(newMessage);
        await handleSendReaction(newMessage._id, user.id, icon);
    }



    return (
        <React.Fragment>
            <span
                className={isLeft ? `message-hover-container option-right ${isImage && 'w-500'}` : `message-hover-container option-left ${isImage && 'w-500'}`}
                ref={messageHoverContainerRef}
            >
                {children}
                <div className="options" ref={optionsRef}>
                    <div className="options-content">
                        <div className="option-item">
                            <i title="Trả lời" className="fa-solid fa-reply"></i>
                        </div>
                        <div className="option-item">
                            <i title="Chuyển tiếp" className="fa-solid fa-share"></i>
                        </div>
                        <Popover
                            content={React.createElement(content, { optionsRef, message, handleModifyMessage })}
                            trigger={"click"}
                            placement="topRight"
                            className="popover-options"
                            forceRender
                        >
                            <div className="option-item">
                                <i title="Thêm" className="fa-solid fa-ellipsis"></i>
                            </div>
                        </Popover>

                    </div>
                </div>

                {
                    message?.reactions?.length > 0 &&
                    <div className="reactions">
                        {
                            message?.reactions.map((reaction, index) => {
                                if (index < 3) {
                                    return (
                                        <span className="reaction-item" key={reaction.userId + reaction.icon}>{reaction?.icon}</span>
                                    )
                                }
                            })
                        }
                        {
                            message?.reactions?.length > 0 && <span>{
                                message?.reactions?.reduce((partialSum, a) => {
                                    return partialSum + a.count;
                                }, 0)
                            }</span>
                        }
                    </div>
                }

                <div className="frame-tym" ref={frameTymRef}>
                    <EmoijPopup
                        placement={isLeft ? 'top' : 'topRight'}
                        setSelectedReaction={setSelectedReaction}
                        handleTymMessage={handleTymMessage}
                        allowOpen={allowOpen}
                        message={message}
                        handleModifyMessage={handleModifyMessage}
                    >
                        <div className="tym-message" onClick={() => handleTymMessage(selectedReaction.trim())}>
                            {/* <i className="fa-regular fa-thumbs-up reaction-icon"></i> */}
                            <Tym
                                icon={selectedReaction}
                                clickRef={clickRef}
                            />
                        </div>
                    </EmoijPopup>
                </div>

            </span>
        </React.Fragment>
    )
}

export default MessageChat;