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
import { getPreviewImage, getTimeFromDate } from '../../../utils/handleUltils';
import { useNavigate } from "react-router-dom";
import { getFriend } from "../../../utils/handleChat";
import { COLOR_BACKGROUND } from '../../../type/rootCss.type';
import Zoom from 'react-medium-image-zoom';
import { set } from "firebase/database";

const ChatMain = ({ file, fileTypes }) => {
    const chat = useSelector(state => state.appReducer.subNav);
    const moreInfoRef = useRef(null);
    const [show, setShow] = useState(true);
    const [showEmoij, setShowEmoij] = useState(true);
    const [messages, setMessages] = useState([]);
    const [limit, setLimit] = useState(60);
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
    const navigate = useNavigate();
    const [isLoadingFetch, setIsLoadingFetch] = useState(false);
    // Menu
    const [current, setCurrent] = useState('');
    const [headerColor, setHeaderColor] = useState(COLOR_BACKGROUND.BLACK);
    const [messageColor, setMessageColor] = useState(COLOR_BACKGROUND.BLACK);
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const scroolFirst = useRef(false);
    const scroolToTopRef = useRef(false);
    const heightScroolTopRef = useRef(0);
    const [hasText, setHasText] = useState(false);
    const uploadPreset = import.meta.env.VITE_APP_CLOUNDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;
    const folder = import.meta.env.VITE_APP_CLOUNDINARY_FOLDER;
    const [listImage, setListImage] = useState([]);


    // handle file
    const sendImage = async (preview, file) => {
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.IMAGES,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [preview]
        };
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // upload ảnh lên cloudinary
        const url = await uploadToCloudiry(file);
        // save vào db
        const res = await axios.post('/chat/message', {
            ...createMessage,
            images: [url]
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            socket.then(socket => {
                setSent(STATE.RESOLVE);
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
        } else {
            setSent(STATE.REJECT);
            toast.warn('Không thể gửi tin nhắn, ' + res.message);
        }
    }

    // get file
    useEffect(() => {
        if (file) {
            const preview = getPreviewImage(file);
            sendImage(preview, file);
        }
    }, [file])

    // background
    useEffect(() => {
        if (chat?.background) {
            setBackgroundUrl(chat.background.url);
            setHeaderColor(chat.background.headerColor);
            setMessageColor(chat.background.messageColor);
        } else {
            setBackgroundUrl('');
            setHeaderColor(COLOR_BACKGROUND.BLACK);
            setMessageColor(COLOR_BACKGROUND.BLACK);
        }
        scroolFirst.current = false;
    }, [chat]);

    // handle keydown
    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;
            if (key === 'm' && event.ctrlKey) {
                event.preventDefault();
                handleClickMoreInfor();;
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [])

    // Emoij
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        setShowEmoij(false);
    }, [user])

    // fetch mount
    useEffect(() => {
        if (user && chat) {
            (async () => {
                fetchMessagePaginate();
            })()
        }
    }, [chat, limit])

    // socket
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
                    setMessages(prev => [...prev, data]);
                    fetchMessagePaginate();
                })
            })
            receiveOnly.current = true;
        }
    }, [])

    // footer
    useEffect(() => {
        if (footer.current?.clientHeight) {
            setFooterHeight(footer.current?.clientHeight);
        }
    }, [footer.current?.clientHeight])

    // set size cho scrool
    useEffect(() => {
        if (scroolRef.current) {
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
        }
    }, [typing, footerHeight])

    // first load message and scrool to bottom
    useEffect(() => {
        if (scroolRef.current && scroolFirst.current === false && messages.length > 0) {
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
            scroolFirst.current = true;
        }
    }, [messages.length]);

    useEffect(() => {
        if (scroolFirst.current === true && isLoadingFetch === false) {
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
        }
    }, [messages.length])

    useEffect(() => {
        if (isLoadingFetch) {
            setIsLoadingFetch(false);
            scroolToTopRef.current = false;
        }
    }, [messages.length]);

    // xử lý khi full tin nhắn
    useEffect(() => {
        const checkFullMessage = async () => {
            setIsLoadingFetch(false);
        }
        const lock = setTimeout(() => {
            checkFullMessage();
        }, 1000);
        return () => {
            clearTimeout(lock);
        }
    }, [isLoadingFetch, messages.length])

    useEffect(() => {
        if (scroolRef.current?.scrollTop && heightScroolTopRef.current < scroolRef.current.scrollTop) {
            heightScroolTopRef.current = scroolRef.current.scrollHeight;
        }
    }, [scroolRef.current?.scrollTop]);


    useEffect(() => {
        const handleScroll = () => {
            if (scroolRef.current.scrollTop < heightScroolTopRef.current / 2 && scroolToTopRef.current === false) {
                scroolToTopRef.current = true;
                setIsLoadingFetch(true);
                setLimit(prev => prev + 60);
            }
        }
        if (scroolRef.current) {
            scroolRef.current.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (scroolRef.current) {
                scroolRef.current.removeEventListener("scroll", handleScroll);
            }
        }
    }, [scroolRef.current]);

    useEffect(() => {
        if (moreInfoRef.current) {
            const width = moreInfoRef.current.clientWidth;
            if (width < 300) {
                setShow(false);
            } else {
                setShow(true);
            }

        }
    }, [moreInfoRef.current])



    const onClick = (e) => {
        setCurrent(e.key);
    };


    const fetchMessagePaginate = async () => {
        const res = await axios.get(`/chat/message/pagination?chatId=${chat._id}&limit=${limit}`)
        if (res.errCode === 0) {
            setMessages(res?.data);
        }
        else {
            setMessages([])
        }
    }

    const handleModifyMessage = (message) => {
        setMessages(prev => {
            const index = prev.findIndex(item => item._id === message._id);
            if (index !== -1) {
                prev[index] = {
                    ...prev[index],
                    ...message
                };
            }
            return [...prev];
        });
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
        if (textAreaRef.current) {
            textAreaRef.current.value = '';
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
            // fetchMessagePaginate();
        } else {
            setSent(STATE.REJECT);
            toast.warn('Không thể gửi tin nhắn, ' + res.message);
        }
    }

    function handleClickMoreInfor() {
        setShow(prev => !prev);
    }


    const handleResize = (size, meta) => {
        textAreaRef.current.style.height = 'auto !important';
        if (footer.current?.clientHeight) {
            setFooterHeight(footer.current?.clientHeight);
        }
    };


    let emitFinishTyping = useCallback(_.debounce(() => {
        if (sendTyping.current === true) {
            socket.then(socket => {
                socket.emit('finish-typing', chat._id);
                sendTyping.current = false;
            })
        }
    }, 700), []);

    let startTyping = useCallback(() => {
        if (sendTyping.current === false) {
            socket.then(socket => {
                socket.emit('typing', chat._id);
            })
            sendTyping.current = true;
        }
    }, []);

    const handleOnChange = (e) => {
        if (e.target.value) {
            setHasText(true);
        } else {
            setHasText(false);
        }
        if (sendTyping.current === false) {
            startTyping();
        }
        emitFinishTyping();
    }
    const handleShowHideEmoij = () => {
        setShowEmoij(prev => !prev);
    }

    const handleOnKeyDown = (e) => {
        const value = textAreaRef.current.value;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(value, MESSAGES.TEXT);
            textAreaRef.current.value = '';
            setHasText(false);
        } else {
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                handlePaste();

            }
        }
    }

    const handleRemoveImage = (index) => {
        if (listImage.length === 1) {
            setHasText(false);
        }
        setListImage(prev => prev.filter((_, idx) => idx !== index));
    }

    const handlePaste = () => {
        setHasText(true);
        if (listImage.length > 6) {
            toast.warn('Bạn chỉ có thể chọn tối đa 7 ảnh');
            return;
        }
        navigator.clipboard.read().then(clipboardItems => {
            clipboardItems.forEach(async item => {
                if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                    const blob = await item.getType('image/png') || item.getType('image/jpeg');
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        // Xử lý ảnh ở đây, có thể hiển thị nó hoặc lưu vào state
                        setListImage(prev => [...prev, result]);
                    };
                    reader.readAsDataURL(blob);
                }
            });
        });
    }

    const handleOnClickOutSide = (e) => {
        if (showEmoij) {
            if (!e.target.className.includes('emoijj')) {
                setShowEmoij(false);
            }
        }
    }

    const handleChooseEmoij = (e) => {
        if (textAreaRef.current) {
            textAreaRef.current.value += e.native;
            setHasText(true);
        }
    }


    const handleDispatchSendMessageFunc = () => {
        if (dispatchRef.current === false) {
            dispatch({ type: MESSAGES.SEND_MESSAGE_FUNC, payload: sendMessage });
            dispatchRef.current = true;
        }
    }

    const handleOnClickFooter = () => {
        textAreaRef.current.focus();
    }

    const handleChangeBackground = (background) => {
        if (background) {
            setBackgroundUrl(background.url);
            setHeaderColor(COLOR_BACKGROUND[background.headerColor]);
            setMessageColor(COLOR_BACKGROUND[background.messageColor]);
        } else {
            setBackgroundUrl('');
            setHeaderColor(COLOR_BACKGROUND.BLACK);
            setMessageColor(COLOR_BACKGROUND.BLACK);
        }
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

    const handleOnChangeMessageImage = async (e) => {
        const files = e.target.files;
        const previews = [];
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                previews.push(getPreviewImage(file));
            }
        }
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.IMAGES,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: previews
        };
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // upload ảnh lên cloudinary
        const urls = [];
        for (let i = 0; i < files.length; i++) {
            const url = await uploadToCloudiry(files[i]);
            urls.push(url);
        }
        // save vào db
        const res = await axios.post('/chat/message', {
            ...createMessage,
            images: urls
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            socket.then(socket => {
                setSent(STATE.RESOLVE);
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
        } else {
            setSent(STATE.REJECT);
            toast.warn('Không thể gửi tin nhắn, ' + res.message);
        }
    }



    const uploadToCloudiry = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append("cloud_name", cloudName);
        formData.append("folder", folder);
        if (file) {
            const image = file.name;
            const name = image.split('.')[0];
            const extName = image.split('.')[1];
            const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
            formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                method: 'POST',
                body: formData,
            });
            const urlData = await response.json();
            return urlData.url;
        }
    }


    return (
        <>
            <div className="chat-container"
            // onMouseDown={handleEvent}
            >
                <div className="left chat-item">
                    <header style={{ color: headerColor }}>
                        {
                            isLoadingFetch &&
                            <ReactLoading
                                type={'spokes'}
                                color={'#006CE5'}
                                width={30}
                                height={30}
                                className={'chat-main-loading'}
                            />
                        }
                        <div className="friend-info">
                            <StatusUser chat={chat} />
                        </div>
                        <div className="tools" style={{ color: headerColor }}>
                            <Menu
                                onClick={onClick}
                                selectedKeys={[current]}
                                mode="horizontal" items={items}
                                className="menu-header"
                                style={{ color: headerColor }}
                            />
                        </div>
                    </header>

                    <div className="main-chat-content">
                        <div className="content-chat-messages" ref={scroolRef}
                            style={{
                                height: `calc(100% - ${footerHeight - 10}px)`,
                                color: messageColor
                            }}>
                            {
                                messages && messages.length > 0 && messages.map((message, index) => {
                                    return (
                                        <React.Fragment key={message._id}>
                                            {
                                                // no current user
                                                user?.id !== message.sender.id ?
                                                    <div className="group-message"
                                                        style={{
                                                            marginBottom: message?.reactions?.length > 0 ? '10px' : '0px',
                                                        }}
                                                    >
                                                        {
                                                            <div className="avatar">
                                                                {
                                                                    index == 0 ?
                                                                        <AvatarUser
                                                                            image={getFriend(user, chat.participants)?.avatar}
                                                                        /> :
                                                                        (
                                                                            messages[index - 1].sender.id !== messages[index].sender.id &&
                                                                            <AvatarUser
                                                                                image={chat.type === CHAT_STATUS.PRIVATE_CHAT ?
                                                                                    getFriend(user, chat.participants)?.avatar : chat.groupPhoto}
                                                                            />

                                                                        )
                                                                }
                                                            </div>
                                                        }
                                                        <div
                                                            className={message.type !== MESSAGES.TEXT ? `message de-bg ${message?.images?.length > 1 && 'w-500'}` : `message ${message?.images?.length > 1 && 'w-500'}`}
                                                            style={{ backgroundColor: '#ffffff' }}
                                                        >
                                                            {
                                                                messages[index - 1]?.sender?.id !== messages[index].sender.id &&
                                                                <p className="name">{message?.sender?.userName}</p>
                                                            }
                                                            {message.type === MESSAGES.TEXT ?
                                                                <MessageChat handleModifyMessage={handleModifyMessage} isLeft={true} message={message}>
                                                                    <p className='message-content-right-right-right'>{message.content}</p>
                                                                    {
                                                                        messages[index + 1]?.sender?.id !== messages[index]?.sender?.id &&
                                                                        <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                    }
                                                                </MessageChat> : (
                                                                    message.type === MESSAGES.STICKER ?
                                                                        <MessageChat handleModifyMessage={handleModifyMessage} isLeft={true} message={message}>
                                                                            <img className="sticker" src={message.sticker} alt="sticker" />
                                                                            {
                                                                                messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                            }
                                                                        </MessageChat> : (
                                                                            message.type === MESSAGES.IMAGES &&
                                                                            <MessageChat
                                                                                handleModifyMessage={handleModifyMessage}
                                                                                isLeft={true}
                                                                                message={message}
                                                                                isImage
                                                                                lasted={messages[index + 1]?.sender?.id !== messages[index].sender.id}
                                                                            >
                                                                                {
                                                                                    message.images.map((image, index) => {
                                                                                        return (
                                                                                            <Zoom key={message._id + index}>
                                                                                                <img className="image-message" src={image} alt="image" />
                                                                                            </Zoom>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                {
                                                                                    messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                }
                                                                            </MessageChat>
                                                                        )
                                                                )}
                                                        </div>
                                                    </div>
                                                    // current user
                                                    :
                                                    <div
                                                        style={{
                                                            alignSelf: 'flex-end',
                                                            backgroundColor: '#e5efff',
                                                            marginBottom: message?.reactions?.length > 0 ? '10px' : '0px'
                                                        }}
                                                        className={message.type !== MESSAGES.TEXT ? `message de-bg ${message?.images?.length > 1 && 'w-500'}` : `message ${message?.images?.length > 1 && 'w-500'}`}
                                                    >
                                                        {message.type === MESSAGES.TEXT ?
                                                            <MessageChat handleModifyMessage={handleModifyMessage} isLeft={false} message={message}>
                                                                <p className='message-content-right-right-right'>{message.content}</p>
                                                                {
                                                                    messages[index + 1]?.sender?.id !== messages[index].sender?.id &&
                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                }
                                                            </MessageChat>
                                                            : (
                                                                message.type === MESSAGES.STICKER ?
                                                                    <MessageChat handleModifyMessage={handleModifyMessage} isLeft={false} message={message}>
                                                                        <img className="sticker" src={message.sticker} alt="sticker" />
                                                                        {
                                                                            messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                            <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                        }
                                                                    </MessageChat> : (
                                                                        message.type === MESSAGES.IMAGES &&
                                                                        <MessageChat
                                                                            handleModifyMessage={handleModifyMessage}
                                                                            isLeft={false}
                                                                            message={message}
                                                                            isImage
                                                                            lasted={messages[index + 1]?.sender?.id !== messages[index].sender.id}
                                                                        >
                                                                            {
                                                                                message.images.map((image, index) => {
                                                                                    return (
                                                                                        <Zoom key={message._id + index}>
                                                                                            <img className="image-message" src={image} alt="image" />
                                                                                        </Zoom>
                                                                                    )
                                                                                })
                                                                            }
                                                                            {
                                                                                messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                            }
                                                                        </MessageChat>
                                                                    )

                                                            )}
                                                    </div>
                                            }
                                            {
                                                index == messages.length - 1 && message?.sender?.id === user?.id &&
                                                <div
                                                    style={{ alignSelf: 'flex-end' }}
                                                >
                                                    <div
                                                        className="message-status"
                                                        style={{ color: headerColor }}
                                                    >
                                                        {
                                                            sent === STATE.PENDING ? <span>Đã gửi</span> : (
                                                                sent === STATE.RESOLVE ? <span>
                                                                    <i className="fa-solid fa-check-double"></i>
                                                                    &nbsp;
                                                                    Đã nhận</span> : <span>Gửi thất bại</span>
                                                            )
                                                        }
                                                    </div>

                                                </div>
                                            }
                                        </React.Fragment>
                                    )
                                })
                            }

                        </div>

                        {
                            typing &&
                            <div className="sending">
                                <div className="message-status">
                                    <span><span className="message-status-user">{getFriend(user, chat.participants)?.userName}</span> đang gửi tin nhắn</span>
                                </div>
                                <ReactLoading
                                    type={'bubbles'}
                                    color={'grey'}
                                    className="sending-loading"
                                />
                            </div>
                        }


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
                                    <div className="item-icon"
                                        onClick={() => handleDispatchSendMessageFunc()}>
                                        <img src="/images/sticker.png" />
                                    </div>
                                </StickyPopover>
                                <label htmlFor="message-inpt-image">
                                    <div className="item-icon">
                                        <i className="fa-regular fa-image"></i>
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    id="message-inpt-image" hidden
                                    accept="image/png, image/gif, image/jpeg"
                                    onChange={e => handleOnChangeMessageImage(e)}
                                    multiple
                                />

                                <div className="item-icon">
                                    <i className="fa-solid fa-paperclip"></i>
                                </div>

                            </div>
                            <div className="footer-bottom footer-item" onClick={handleOnClickFooter}>
                                <TextareaAutosize
                                    className="input-text"
                                    onChange={e => handleOnChange(e)}
                                    placeholder="Nhập tin nhắn..."
                                    onKeyDown={e => handleOnKeyDown(e)}
                                    autoFocus
                                    spellCheck={false}
                                    onHeightChange={(height, meta) => handleResize(height, meta)}
                                    ref={textAreaRef}
                                    type="text"
                                />
                                <div className="text-quick-group">
                                    <div className="item-icon emoijj" onClick={handleShowHideEmoij}>
                                        <i className="fa-regular fa-face-smile emoijj"></i>
                                    </div>
                                    <div className="item-icon emoij-like">
                                        {
                                            !hasText ?
                                                <div style={{ padding: '10px' }} onClick={() => sendMessage('👌', MESSAGES.TEXT)}>
                                                    👌
                                                </div> :
                                                <div onClick={() => sendMessage(textAreaRef.current?.value, MESSAGES.TEXT)}>
                                                    <i className="fa-regular fa-paper-plane"></i>
                                                </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            {
                                listImage && listImage.length > 0 && (
                                    <div className="list-images">
                                        {
                                            listImage.map((image, index) => {
                                                return (
                                                    <div key={index} className="image-item">
                                                        <Zoom>
                                                            <img src={image} alt="image" />
                                                        </Zoom>
                                                        <div className="image-item-remove">
                                                            <button onClick={() => handleRemoveImage(index)}>X</button>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>

                {
                    show &&
                    <div className="right chat-item" ref={moreInfoRef}>
                        <header style={{ color: headerColor }}>
                            {
                                chat?.type === CHAT_STATUS.PRIVATE_CHAT ?
                                    <h3 className="title">Thông tin trò chuyện</h3> :
                                    <h3 className="title">Thông tin nhóm</h3>
                            }
                        </header>
                        <div className="right-body" style={{ color: headerColor }}>
                            <div className="item-avatar">
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
                                                chat?.image ?
                                                    (
                                                        <img src={chat?.image} alt="avatar" />
                                                    ) : (
                                                        chat?.participants?.length > 0 &&
                                                        chat?.participants?.map(item => {
                                                            return (
                                                                <React.Fragment key={item.id}>
                                                                    <AvatarUser
                                                                        image={item.avatar}
                                                                        size={25}
                                                                        name={getFriend(user, chat.participants)?.userName}
                                                                    />
                                                                </React.Fragment>
                                                            )
                                                        })
                                                    )
                                            }
                                        </div>

                                    )
                                }
                                <p className="name">
                                    <span>{getFriend(user, chat.participants)?.userName}</span>
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
                                    handleChangeBackground={handleChangeBackground}
                                >
                                    <Button className="change-background-btn">Đổi hình nền</Button>
                                </ChangeBackgroundModal>
                            </div>

                            <div className="hyphen"></div>

                            <div className="options-list">
                                <div className="button-wrapper">
                                    <button className="button">
                                        <div className="button-icon">
                                            <img src="/images/notification.png" alt="Turn Off Notification Icon" />
                                        </div>
                                        <p>Tắt thông báo</p>
                                    </button>
                                </div>
                                <div className="button-wrapper">
                                    <button className="button">
                                        <div className="button-icon">
                                            <img src="/images/pin.png" alt="Pin Dialog Icon" />
                                        </div>
                                        <p>Ghim hội thoại</p>
                                    </button>

                                </div>
                                <div className="button-wrapper">
                                    <button className="button">
                                        <div className="button-icon"> <img src="/images/group.png" alt="Create Group Icon" /></div>
                                        <p>Tạo nhóm chat</p>
                                    </button>
                                </div>
                            </div>

                            <div className="hyphen"></div>

                            <div className="info-list">
                                <button className="common-group">
                                    <img src="/images/people.png" alt="Create Group Icon" />
                                    <p>Nhóm chung 0 thành viên</p>
                                </button>
                            </div>
                        </div>
                    </div>
                }

            </div >
            <div
                className="bg"
                style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
        </>
    );
};

export default ChatMain;