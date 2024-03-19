import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StatusUser from "../../../components/user/status.user";
import "./chat.main.scss";
import { MergeCellsOutlined } from "@ant-design/icons";
import data from '@emoji-mart/data/sets/14/facebook.json'
// import data from '../../../mocks/facebook.json';
import Picker from '@emoji-mart/react'
import axios from '../../../utils/axios';
import AvatarUser from "../../../components/user/avatar";
import { Button, Menu } from 'antd';
import { socket } from "../../../utils/io";
import { toast } from "react-toastify";
import _ from 'lodash';
import ReactLoading from 'react-loading';
import { STATE } from "../../../redux/types/type.app";
import TextareaAutosize from 'react-textarea-autosize';
import StickyPopover from '../../../components/popover/sticky.popover';
import { CHAT_STATUS, MESSAGES } from "../../../redux/types/type.user";
import ChangeBackgroundModal from "../../../components/modal/changeBackground.modal";
import MessageChat from "./message.chat";
import { getTimeFromDate } from '../../../utils/handleUltils';

const unClassList = [
    'group-message',
    'message',
    'message-hover-container option-left'

]

const ChatMain = () => {
    const chat = useSelector(state => state.appReducer.subNav);
    const moreInfoRef = useRef(null);
    const [show, setShow] = useState(true);
    const [text, setText] = useState('');
    const [showEmoij, setShowEmoij] = useState(true);
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(100);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const scroolRef = useRef(null);
    const receiveOnly = useRef(false);
    const [typing, setTyping] = useState(false);
    const sendTyping = useRef(false);
    const [sent, setSent] = useState(STATE.RESOLVE);
    const footer = useRef(null);
    const [footerHeight, setFooterHeight] = useState(0);
    const textAreaRef = useRef(null);
    const dispatch = useDispatch();
    const dispatchRef = useRef(false);

    // Menu
    const [current, setCurrent] = useState('');
    const onClick = (e) => {
        setCurrent(e.key);
    };
    // End Menu

    useEffect(() => {
        fetchMessagePaginate();
    }, [chat])

    useEffect(() => {
        if (receiveOnly.current === false) {
            socket.then(socket => {
                socket.on('typing', () => {
                    setTyping(true);
                })
                socket.on('finish-typing', () => {
                    setTyping(false);
                });
                socket.on('receive-message', data => {
                    console.log('receive-message', data)
                    setMessages(prev => [...prev, data]);
                })
            })
            receiveOnly.current = true;
        }
    }, [])


    const fetchMessagePaginate = async () => {
        const res = await axios.get(`/chat/message/pagination?chatId=${chat._id}&page=${page}&limit=${limit}`)
        if (res.errCode === 0)
            setMessages(res.data);
        else {
            setMessages([])
        }
    }

    const handleModifyMessage = (message) => {
        const newMessage = messages.find(item => item._id === message._id);
        console.log('newMessage', newMessage);
    }

    const items = [
        {
            key: 'search',
            icon: <div className="box-icon">
                <i className="fa-solid fa-magnifying-glass icon"></i>
            </div>
        },
        {
            key: 'phone',
            icon: <div className="box-icon">
                <i className="fa-solid fa-phone icon"></i>
            </div>
        },
        {
            key: 'friend',
            icon: <div className="box-icon">
                <i className="fa-solid fa-camera icon"></i>
            </div>
        },
        {
            key: 'foremore',
            icon:
                <div className="box-icon" onClick={handleClickMoreInfor}>
                    <MergeCellsOutlined className="icon" />
                </div>,
            className: 'info-button'
        },

    ];

    function objectId() {
        return hex(Date.now() / 1000) +
            ' '.repeat(16).replace(/./g, () => hex(Math.random() * 16))
    }

    function hex(value) {
        return Math.floor(value).toString(16)
    }

    const sendMessage = async (data, type) => {
        if (!data) {
            return;
        }
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        if (type === MESSAGES.TEXT)
            createMessage.content = data;
        else if (type === MESSAGES.STICKER)
            createMessage.sticker = data;
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        const res = await axios.post('/chat/message', {
            ...createMessage,
            chatId: chat._id,
            sender: user.id
        });
        if (res.errCode === 0) {
            socket.then(socket => {
                setSent(STATE.RESOLVE);
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
            fetchMessagePaginate();
        } else {
            setSent(STATE.REJECT);
            toast.warn('Không thể gửi tin nhắn, ' + res.message);
        }
    }

    function handleClickMoreInfor() {
        setShow(prev => !prev);
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter' && e.shiftKey === true) {
            return;
        } else if (e.key === 'Enter') {
            sendMessage(text, MESSAGES.TEXT);
            setText('');
        }
    }


    const handleResize = (size, meta) => {
        textAreaRef.current.style.height = 'auto !important';
        if (footer.current?.clientHeight) {
            setFooterHeight(footer.current?.clientHeight);
        }
    };


    useEffect(() => {
        if (footer.current?.clientHeight) {
            setFooterHeight(footer.current?.clientHeight);
        }
    }, [footer])


    let emitFinishTyping = useCallback(_.debounce(() => {
        socket.then(socket => {
            socket.emit('finish-typing', chat._id);
            sendTyping.current = false;
        })
    }, 700), []);

    const handleOnChange = (e) => {
        const value = e.target.value;
        if (value === '\n') {
            setText('');
            return;
        }
        if (sendTyping.current === false) {
            socket.then(socket => {
                socket.emit('typing', chat._id);
            })
            sendTyping.current = true;
        }
        emitFinishTyping();
        if (text?.length === 0) {
            if (value >= 'a' && value <= 'z') {
                setText(value.toUpperCase());
            } else
                setText(value);
        } else
            setText(value);
    }

    const handleShowHideEmoij = () => {
        setShowEmoij(prev => !prev);
    }

    const handleOnClickOutSide = (e) => {
        if (showEmoij) {
            if (!e.target.className.includes('emoijj')) {
                setShowEmoij(false);
            }
        }
    }

    const handleChooseEmoij = (e) => {
        setText(prev => prev + e.native);
    }


    const handleDispatchSendMessageFunc = () => {
        if (dispatchRef.current === false) {
            dispatch({ type: MESSAGES.SEND_MESSAGE_FUNC, payload: sendMessage });
            dispatchRef.current = true;
        }
    }

    useEffect(() => {
        if (scroolRef.current) {
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight - 10;
        }
    }, [messages, typing, footerHeight])



    const handleOnClickFooter = () => {
        textAreaRef.current.focus();
    }

    // const [rotation, setRotation] = useState(0);
    // const handleEvent = (e) => {
    //     if (!unClassList.includes(e.target.className)) {
    //         const rect = e.target.getBoundingClientRect();
    //         const centerX = rect.left + rect.width / 2;
    //         const angle = (e.clientX - centerX) / 10; // Điều chỉnh số 10 để tăng hoặc giảm tốc độ xoay
    //         setRotation(angle);
    //     }
    // }

    return (
        <>
            <div className="chat-container"
            // onMouseDown={handleEvent}
            >
                <div className="left chat-item">
                    <header>
                        <div className="friend-info">
                            <StatusUser chat={chat} />
                        </div>
                        <div className="tools">
                            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className="menu-header" />
                        </div>
                    </header>

                    <div className="main-chat-content">
                        <div className="content-chat-messages" ref={scroolRef}
                            style={{
                                height: `calc(100% - ${footerHeight}px)`
                            }}>
                            {
                                messages && messages.length > 0 && messages.map((message, index) => {
                                    return (
                                        <React.Fragment key={message._id}>
                                            {
                                                // no current user
                                                user?.id !== message.sender.id ?
                                                    <div className="group-message">
                                                        {
                                                            <div className="avatar">
                                                                {
                                                                    index == 0 ?
                                                                        <AvatarUser
                                                                            image={chat?.image}
                                                                        /> :
                                                                        (
                                                                            messages[index - 1].sender.id !== messages[index].sender.id &&
                                                                            <AvatarUser
                                                                                image={chat.type === CHAT_STATUS.PRIVATE_CHAT ?
                                                                                    chat?.user?.avatar : message?.sender?.avatar}
                                                                            />

                                                                        )
                                                                }
                                                            </div>
                                                        }
                                                        <div
                                                            className={message.type !== MESSAGES.TEXT ? 'message de-bg' : 'message'}
                                                            style={{ backgroundColor: '#ffffff' }}
                                                        >
                                                            {
                                                                messages[index - 1]?.sender?.id !== messages[index].sender.id &&
                                                                <p className="name">{message?.sender?.userName}</p>
                                                            }
                                                            {message.type === MESSAGES.TEXT ?
                                                                <MessageChat handleModifyMessage={handleModifyMessage} isLeft={true} message={message}>
                                                                    {message.content}
                                                                    {
                                                                        messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                        <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                    }
                                                                </MessageChat> : (
                                                                    message.type === MESSAGES.STICKER &&
                                                                    <MessageChat handleModifyMessage={handleModifyMessage} isLeft={true} message={message}>
                                                                        <img className="sticker" src={message.sticker} alt="sticker" />
                                                                        {
                                                                            messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                            <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                        }
                                                                    </MessageChat>
                                                                )}
                                                        </div>
                                                    </div>
                                                    // current user
                                                    :
                                                    <div
                                                        style={{ alignSelf: 'flex-end', backgroundColor: '#e5efff' }}
                                                        className={message.type !== MESSAGES.TEXT ? 'message de-bg' : 'message'}
                                                    >
                                                        {message.type === MESSAGES.TEXT ?
                                                            <MessageChat handleModifyMessage={handleModifyMessage} isLeft={false} message={message}>
                                                                {message.content}
                                                                {
                                                                    messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                }
                                                            </MessageChat>
                                                            : (
                                                                message.type === MESSAGES.STICKER &&
                                                                <MessageChat handleModifyMessage={handleModifyMessage} isLeft={false} message={message}>
                                                                    <img className="sticker" src={message.sticker} alt="sticker" />
                                                                    {
                                                                        messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                        <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                    }
                                                                </MessageChat>
                                                            )}
                                                    </div>
                                            }
                                            {
                                                index == messages.length - 1 && message.sender.id === user.id &&
                                                <div
                                                    style={{ alignSelf: 'flex-end' }}
                                                >
                                                    <div className="message-status">
                                                        {
                                                            sent === STATE.PENDING ? <span>đã gửi</span> : (
                                                                sent === STATE.RESOLVE ? <span>Đã nhận</span> : <span>Gửi thất bại</span>
                                                            )
                                                        }
                                                    </div>

                                                </div>
                                            }
                                        </React.Fragment>
                                    )
                                })
                            }
                            <div className="sending">
                                {
                                    typing &&
                                    <>
                                        <ReactLoading type={'bubbles'} color={'grey'} height={'40px'} width={'50px'} />
                                        <div className="message-status">
                                            <span>Đang gửi</span>
                                        </div>
                                    </>

                                }
                            </div>
                        </div>

                        {/* Init position */}
                        <div className="emoij-container">
                            {
                                showEmoij &&
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleChooseEmoij}
                                    onClickOutside={(e) => handleOnClickOutSide(e)}
                                    skin={6}
                                    isNative
                                />
                            }

                        </div>

                        <div className="footer" ref={footer}>
                            <div className="footer-top footer-item">
                                <StickyPopover >
                                    <div className="item-icon" onClick={() => handleDispatchSendMessageFunc()}>
                                        <img src="/images/sticker.png" />
                                    </div>
                                </StickyPopover>

                                <div className="item-icon">
                                    <i className="fa-regular fa-image"></i>
                                </div>
                                <div className="item-icon">
                                    <i className="fa-solid fa-paperclip"></i>
                                </div>

                            </div>
                            <div className="footer-bottom footer-item" onClick={handleOnClickFooter}>
                                <TextareaAutosize
                                    value={text}
                                    className="input-text"
                                    onChange={e => handleOnChange(e)}
                                    placeholder="Nhập tin nhắn..."
                                    onKeyDown={e => handleOnKeyDown(e)}
                                    autoFocus
                                    spellCheck={false}
                                    onHeightChange={(height, meta) => handleResize(height, meta)}
                                    ref={textAreaRef}
                                />

                                <div className="text-quick-group">
                                    <div className="item-icon emoijj" onClick={handleShowHideEmoij}>
                                        <i className="fa-regular fa-face-smile emoijj"></i>
                                    </div>
                                    <div className="item-icon emoij-like" onClick={() => sendMessage('👌', MESSAGES.TEXT)}>
                                        👌
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    show &&
                    <div className="right chat-item" ref={moreInfoRef}>
                        <header>
                            <h3 className="title">Thông tin trò chuyện</h3>
                        </header>
                        <div className="right-body">
                            <div className="item-avatar">
                                <AvatarUser image={chat?.image} size={50} />
                                <p className="name">
                                    <span>{chat?.user?.userName || chat?.name}</span>
                                    <span style={{
                                        padding: '0 5px'
                                    }}>
                                        <i className="fa-solid fa-pen-to-square edit"></i>
                                    </span>
                                </p>
                            </div>

                            <div className="item-change-bg">
                                <ChangeBackgroundModal
                                    chat={chat}
                                >
                                    <Button className="change-background-btn">Đổi hình nền</Button>
                                </ChangeBackgroundModal>
                            </div>
                        </div>
                    </div>
                }

            </div >
            <div
                className="bg"
            // style={{ transform: `rotateY(${rotation}deg)` }}
            ></div>
        </>
    );
};

export default ChatMain;