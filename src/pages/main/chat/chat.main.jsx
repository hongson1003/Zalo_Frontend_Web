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
import { Button, Menu, message } from 'antd';
import { socket } from "../../../utils/io";
import { toast } from "react-toastify";
import _ from 'lodash';
import ReactLoading from 'react-loading';
import { STATE } from "../../../redux/types/type.app";
import TextareaAutosize from 'react-textarea-autosize';
import StickyPopover from '../../../components/popover/sticky.popover';
import { CHAT_STATUS, FILE_TYPE, MESSAGES } from "../../../redux/types/type.user";
import ChangeBackgroundModal from "../../../components/modal/changeBackground.modal";
import MessageChat from "./message.chat";
import { customizeFile, getLinkDownloadFile, getPreviewImage, getTimeFromDate } from '../../../utils/handleUltils';
import { useNavigate } from "react-router-dom";
import { getFriend } from "../../../utils/handleChat";
import { COLOR_BACKGROUND } from '../../../type/rootCss.type';
import Zoom from 'react-medium-image-zoom';
import InputSearchSticky from "../../../components/customize/inputSearchSticky";
import ChooseFileUploadPopover from "../../../components/popover/chooseFileUpload.popover";
import File from "../../../components/upload/file.upload";
const uploadPreset = import.meta.env.VITE_APP_CLOUNDINARY_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;
const folder = import.meta.env.VITE_APP_CLOUNDINARY_FOLDER;
import { Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import MicModal from "../../../components/modal/mic.modal";
import PinsModal from "../../../components/modal/pins.modal";
import { Input } from 'antd';
import { Popover } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { changeKeySubMenu } from "../../../redux/actions/app.action";
import WrapperVideo from "../../../components/customize/wrapperVideo";

const ChatMain = ({ file, fileTypes, drawerMethods }) => {
    const chat = useSelector(state => state.appReducer.subNav);
    const moreInfoRef = useRef(null);
    const [show, setShow] = useState(false);
    const [showEmoij, setShowEmoij] = useState(true);
    const [messages, setMessages] = useState([]);
    const [limit, setLimit] = useState(30);
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
    const [listImage, setListImage] = useState([]);
    const userState = useSelector(state => state.userReducer);
    const listMessageIsPinRef = useRef([]);
    const [listMessageIsPinState, setListMessageIsPinState] = useState(listMessageIsPinRef.current);
    const [hasPin, setHasPin] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const [openReply, setOpenReply] = useState(false);
    const [messageReply, setMessageReply] = useState(null);

    // text để theo dõi thay đổi
    const [text, setText] = useState('');
    // Emoij

    useEffect(() => {
        if (!chat._id) {
            dispatch(changeKeySubMenu(''));
        }

    }, [chat]);

    useEffect(() => {
        socket.then(socket => {
            socket.on('receive-reaction', (data) => {
                handleModifyMessage(data);
            })
        });
    }, [])
    // get file
    useEffect(() => {
        if (file) {
            const preview = getPreviewImage(file);
            sendImage(preview, file);
            setTimeout(() => {
                scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
            }, 500);
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

    useEffect(() => {
        setMessages([]);
    }, [chat._id])

    // fetch mount
    useEffect(() => {
        if (user && chat) {
            fetchMessagePaginate();
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
                    userState.fetchChats();
                    setMessages(prev => [...prev, data]);
                    fetchMessagePaginate();
                    scroolRef.current.scrollTop = scroolRef.current?.scrollHeight || 0;
                })
                socket.on('receive-modify-message', data => {
                    handleModifyMessage(data);
                })
            })
            receiveOnly.current = true;
        }
    }, [messages])

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
        let clock = null;
        if (scroolRef.current && scroolFirst.current === false && messages.length > 0) {
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
            clock = setTimeout(() => {
                scroolFirst.current = true;
                scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
            }, 500);
        }
        return () => {
            if (clock) {
                clearTimeout(clock);
            }
        }

    }, [messages.length, scroolRef.current?.scrollHeight]);

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
        if (textAreaRef.current && textAreaRef.current?.value === '\n') {
            textAreaRef.current.value = '';
        }
    }, [textAreaRef.current]);


    useEffect(() => {
        const handleScroll = () => {
            if (scroolRef.current.scrollTop < heightScroolTopRef.current / 1.5 && scroolToTopRef.current === false) {
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

    useEffect(() => {

        if (listMessageIsPinRef.current.length !== listMessageIsPinState.length ||
            listMessageIsPinRef.current.some(item => (item.ref === null || !item.ref))
        ) {
            // lọc lại các ref !== null
            listMessageIsPinRef.current = listMessageIsPinRef.current.filter(item => item.ref !== null);
            setListMessageIsPinState(listMessageIsPinRef.current);
            if (listMessageIsPinRef.length > 0) {
                setHasPin(true);
            } else {
                setHasPin(false);
            }
        }
    }, [listMessageIsPinRef.current]);

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
            urls: [preview],
            unViewList: [],
            isDelete: false,
            reactions: []
        };
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // upload ảnh lên cloudinary
        const url = await uploadToCloudiry(file);
        // save vào db
        const res = await axios.post('/chat/message', {
            ...createMessage,
            urls: [url]
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            userState.fetchChats();
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

    const sendImagesFromBase64 = async (urls) => {
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.IMAGES,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            urls: urls,
            unViewList: [],
            isDelete: false,
            reactions: []
        };
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // save ảnh vào db
        const res = await axios.post('/chat/message', {
            ...createMessage,
            urls
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            userState.fetchChats();
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

    const onClick = (e) => {
        setCurrent(e.key);
    };


    const fetchMessagePaginate = async () => {
        if (!chat._id) return;
        const res = await axios.get(`/chat/message/pagination?chatId=${chat._id}&limit=${limit}`);
        if (res.errCode === 0) {
            setMessages(res?.data);
        } else {
            setMessages([]);
        }
    }

    const handleModifyMessage = (message) => {
        setMessages(prev => prev.map(item => {
            if (item._id === message._id) {
                return {
                    ...item,
                    ...message
                };
            }
            return item;
        }))
    }


    const items = [
        {
            key: 'search',
            icon: <div className="box-icon" onClick={() => {
                setIsSearching(true);
                drawerMethods.showDrawer();
                setTimeout(() => {
                    if (searchRef.current) {
                        searchRef.current.focus();
                    }
                }, 500);
            }}>
                <i className="fa-solid fa-magnifying-glass icon"></i>
            </div >
        },
        {
            key: 'phone',
            icon: <div className="box-icon">
                <i className="fa-solid fa-phone icon"></i>
            </div>
        },
        {
            key: 'video-call',
            icon: <WrapperVideo>
                <div className="box-icon">
                    <i className="fa-solid fa-video icon"></i>
                </div>
            </WrapperVideo>
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
        if (!data.trim()) {
            if (listImage.length === 0)
                return;
            else {
                sendImagesFromBase64(listImage);
            }
            setListImage([]);
            setText('');
            return;
        }
        setText('');
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
            unViewList: [],
            isDelete: false,
            reactions: []
        }
        if (openReply) {
            createMessage.reply = messageReply;
        }
        if (type === MESSAGES.TEXT) {
            createMessage.content = data;
            if (listImage.length > 0) {
                createMessage.urls = [...listImage];
                setListImage([]);
            }

        } else if (type === MESSAGES.STICKER)
            createMessage.sticker = data;
        setMessages(prev => [...prev, createMessage]);
        setOpenReply(false);
        setSent(STATE.PENDING);
        const res = await axios.post('/chat/message', {
            ...createMessage,
            chatId: chat._id,
            sender: user.id
        });
        if (res.errCode === 0) {
            userState.fetchChats();
            scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
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

    const handleSetText = _.debounce((value) => {
        setText(value);
    }, 700)

    const handleOnChange = (e) => {
        let value = e.target.value;
        if (textAreaRef.current.value.length === 1) {
            textAreaRef.current.value = value.trim().toUpperCase();
        }
        if (value.length < 10) {
            handleSetText(value);
        } else if (value.length === 10) {
            handleSetText('');
        }
        if (value) {
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
                // e.preventDefault();
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
            urls: previews,
            unViewList: [],
            isDelete: false,
            reactions: []
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
            urls: urls
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            userState.fetchChats();
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

    const sendAudio = async (file) => {
        // preview
        const preview = getPreviewImage(file);
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.AUDIO,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            urls: [preview],
            unViewList: [],
            isDelete: false,
            reactions: []
        };
        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // upload
        const url = await uploadToCloudiry(file);
        // save
        const res = await axios.post('/chat/message', {
            ...createMessage,
            urls: [url]
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            socket.then(socket => {
                setSent(STATE.RESOLVE);
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
        }
    }



    const uploadToCloudiry = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append("cloud_name", cloudName);
        formData.append("folder", folder);
        formData.append('resource_type', 'raw');

        if (file) {
            const origin = file.name;
            const name = origin.split('.')[0];
            const extName = origin.split('.')[1];
            const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
            formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload?secure=true`, {
                method: 'POST',
                body: formData,
            });
            const { secure_url } = await response.json();
            return secure_url;
        }
    }

    const sendFileOrFolder = async (filesOrFolders) => {
        const dataFiles = [];
        for (let i = 0; i < filesOrFolders.length; i++) {
            dataFiles.push(customizeFile(filesOrFolders[i]));
        }

        const previews = [];
        if (filesOrFolders.length > 0) {
            for (let i = 0; i < filesOrFolders.length; i++) {
                const file = filesOrFolders[i];
                previews.push(getPreviewImage(file));
            }
        }
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.FILE_FOLDER,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            urls: previews,
            content: JSON.stringify(dataFiles),
            unViewList: [],
            isDelete: false,
            reactions: []
        };
        setMessages(prev => [...prev, createMessage]);
        // const data = await uploadToCloudiry(filesOrFolders[0]);
        //save
        const urls = [];
        for (let i = 0; i < filesOrFolders.length; i++) {
            const url = await uploadToCloudiry(filesOrFolders[i]);
            urls.push(url);
        };
        const res = await axios.post('/chat/message', {
            ...createMessage,
            urls,
            content: JSON.stringify(dataFiles)
        });
        if (res.errCode === 0) {
            userState.fetchChats();
            socket.then(socket => {
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
        } else {
            toast.warn('Không thể gửi tin nhắn, ' + res.message);
        }
    }

    const sendVideo = async (file) => {
        const preview = getPreviewImage(file);
        const ObjectId = objectId();
        const createMessage = {
            _id: ObjectId,
            chat: chat,
            type: MESSAGES.VIDEO,
            sender: user,
            createdAt: new Date(),
            updatedAt: new Date(),
            urls: [preview],
            unViewList: [],
            isDelete: false,
            reactions: []
        };

        setMessages(prev => [...prev, createMessage]);
        setSent(STATE.PENDING);
        // upload
        const url = await uploadToCloudiry(file);
        // save
        const res = await axios.post('/chat/message', {
            ...createMessage,
            urls: [url]
        });
        setSent(STATE.RESOLVE);
        if (res.errCode === 0) {
            userState.fetchChats();
            socket.then(socket => {
                setSent(STATE.RESOLVE);
                socket.emit('send-message', res.data);
                socket.emit('finish-typing', chat._id);
            })
        }
    }

    const handleFindMessageFirst = (ref) => {
        ref.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }

    const handleOnSearch = _.debounce((value) => {
        drawerMethods.setSearchDrawer(value);
    }, 500);

    const Content = () => {
        return (
            <div className="reply-content">
                <p>{messageReply?.content}</p>
                {
                    (messageReply?.sticker ||
                        (messageReply?.urls?.length > 0 && messageReply.type === MESSAGES.IMAGES)) ?
                        <img src={messageReply?.sticker} ></img> : (
                            messageReply?.urls?.length > 0 && messageReply.type === MESSAGES.VIDEO &&
                            <video src={messageReply?.urls[0]} />
                        )
                }
            </div>
        )
    };

    const handleOnClickReply = (message) => {
        setMessageReply(message);
        setOpenReply(true);
        textAreaRef.current.focus();
    }

    const handleRemoveReply = () => {
        setMessageReply(null);
        setOpenReply(false);
        textAreaRef.current.value = '';
    }



    return (
        <>
            <div className="chat-container"
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
                                mode="horizontal"
                                items={items}
                                className="menu-header"
                                style={{ color: headerColor }}
                            />
                        </div>
                    </header>

                    <div className="main-chat-content">
                        {
                            isSearching && (
                                <div className="searching">
                                    <Input
                                        value={drawerMethods.searchValue}
                                        placeholder="Tìm tin nhắn"
                                        prefix={<i className="fa-solid fa-search"></i>}
                                        onChange={(e) => handleOnSearch(e.target.value)}
                                        spellCheck={false}
                                        ref={searchRef}
                                    />
                                    <Button type="default" onClick={() => {
                                        setCurrent('');
                                        drawerMethods.onClose();
                                        setIsSearching(false);
                                    }}>Đóng</Button>
                                </div>
                            )
                        }
                        {
                            hasPin && !isSearching &&
                            <div className="pin-container">
                                <div className="pin-icon-item">
                                    <i className="fa-regular fa-message"></i>
                                </div>
                                <div className="pin-content-item" onClick={() => handleFindMessageFirst(listMessageIsPinRef.current?.[0].ref)}>
                                    <p className="title">Tin nhắn</p>
                                    <div className="content">
                                        <span>{listMessageIsPinRef.current?.[0]?.message?.sender?.userName}:</span>
                                        {
                                            listMessageIsPinRef.current?.[0]?.message?.type === MESSAGES.TEXT ?
                                                <span>{listMessageIsPinRef.current?.[0]?.message?.content}</span> : (
                                                    listMessageIsPinRef?.current?.[0]?.message?.type === MESSAGES.IMAGES ?
                                                        <span>Đã gửi ảnh</span> : (
                                                            listMessageIsPinRef.current?.[0]?.message?.type === MESSAGES.FILE_FOLDER ?
                                                                <span>File</span> : <span>Sticker</span>
                                                        )
                                                )

                                        }
                                    </div>

                                </div>
                                <div className="more-pin">
                                    <PinsModal
                                        data={listMessageIsPinState}
                                        handleFindMessageFirst={handleFindMessageFirst}
                                        fetchChats={userState.fetchChats}
                                    >
                                        <i className="fa-solid fa-circle-info"></i>
                                    </PinsModal>
                                </div>
                            </div>
                        }
                        <div className={`content-chat-messages ${(hasPin || isSearching) ? 'pt-50' : ''}`} ref={scroolRef}
                            style={{
                                height: `calc(100% - ${footerHeight - 10}px)`,
                                color: messageColor,
                            }}>
                            {
                                messages && messages.length > 0 && messages.map((message, index) => {
                                    if (message.unViewList.includes(user.id)) {
                                        return null;
                                    }
                                    return (
                                        <React.Fragment key={message._id}>
                                            {
                                                // no current user
                                                user?.id !== message.sender.id ?
                                                    <div className="group-message"
                                                        style={{
                                                            marginBottom: message?.reactions?.length > 0 ? '10px' : '0px',
                                                        }}
                                                        ref={(ref) => {
                                                            if (message.isPin === true) {
                                                                listMessageIsPinRef.current = _.unionBy([{ message: message, ref }], listMessageIsPinRef.current, 'message._id');
                                                                if (hasPin === false) {
                                                                    setHasPin(true);
                                                                }
                                                            }
                                                            if (drawerMethods.searchDrawer.toLowerCase().trim() !== '' && message?.content?.toLowerCase().includes(drawerMethods.searchDrawer.toLowerCase().trim())) {
                                                                drawerMethods.listMessageRef.current = _.unionBy([{ message: message, ref }], drawerMethods.listMessageRef.current, 'message._id');
                                                            }
                                                        }}
                                                    >
                                                        {
                                                            <div className="avatar">
                                                                {
                                                                    index == 0 ?
                                                                        <AvatarUser
                                                                            image={message?.sender?.avatar || '/images/user-dev.png'}
                                                                            name={message?.sender?.userName || 'Người dùng'}
                                                                        /> :
                                                                        (
                                                                            messages[index - 1].sender.id !== messages[index].sender.id &&
                                                                            <AvatarUser
                                                                                image={message?.sender?.avatar || '/images/user-dev.png'}
                                                                                name={message?.sender?.userName || 'Người dùng'}
                                                                            />
                                                                        )
                                                                }
                                                            </div>
                                                        }
                                                        <div
                                                            className={
                                                                (message.type === MESSAGES.TEXT || message.isDelete === true) ? 'message' : (
                                                                    (message.type === MESSAGES.IMAGES || message.type === MESSAGES.VIDEO ||
                                                                        message.type === MESSAGES.AUDIO
                                                                    ) ? 'message de-bg w-500' : 'message'
                                                                )
                                                            }
                                                        >
                                                            {
                                                                messages[index - 1]?.sender?.id !== messages[index].sender.id &&
                                                                <p style={{ color: messageColor }} className="name">{message?.sender?.userName || 'Người dùng'}</p>
                                                            }
                                                            {
                                                                message.isDelete === true ?
                                                                    <p style={
                                                                        {
                                                                            width: '100%',
                                                                            padding: '5px',
                                                                            fontSize: '14px',
                                                                            color: '#888'
                                                                        }
                                                                    } className='message-content-right'>{'Tin nhắn đã được thu hồi'}</p> :
                                                                    message.type === MESSAGES.TEXT ?
                                                                        <MessageChat
                                                                            handleModifyMessage={handleModifyMessage}
                                                                            isLeft={true} message={message}
                                                                            handleOnClickReply={handleOnClickReply}
                                                                        >
                                                                            <p style={{ width: '100%', padding: '5px' }} className='message-content-left'>{message.content}</p>
                                                                            {
                                                                                message.urls?.length > 0 && message.urls.map((image, index) => {
                                                                                    return (
                                                                                        <Zoom key={message._id + index} className='khohieu'>
                                                                                            <img className="image-message" src={image} alt="image" />
                                                                                        </Zoom>
                                                                                    )
                                                                                })
                                                                            }
                                                                            {
                                                                                messages[index + 1]?.sender?.id !== messages[index]?.sender?.id &&
                                                                                <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                            }
                                                                        </MessageChat> : (
                                                                            message.type === MESSAGES.STICKER ?
                                                                                <MessageChat
                                                                                    handleModifyMessage={handleModifyMessage}
                                                                                    isLeft={true}
                                                                                    message={message}
                                                                                    handleOnClickReply={handleOnClickReply}

                                                                                >
                                                                                    <img className="sticker"
                                                                                        src={message.sticker} alt="sticker"
                                                                                    />
                                                                                    {
                                                                                        messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                        <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                    }
                                                                                </MessageChat> : (
                                                                                    message.type === MESSAGES.IMAGES ?
                                                                                        <MessageChat
                                                                                            handleModifyMessage={handleModifyMessage}
                                                                                            isLeft={true}
                                                                                            message={message}
                                                                                            isImage
                                                                                            handleOnClickReply={handleOnClickReply}
                                                                                        >
                                                                                            {
                                                                                                message.urls.map((image, index) => {
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
                                                                                        </MessageChat> : (
                                                                                            message.type === MESSAGES.FILE_FOLDER ?
                                                                                                <MessageChat
                                                                                                    handleModifyMessage={handleModifyMessage}
                                                                                                    isLeft={true}
                                                                                                    message={message}
                                                                                                    handleOnClickReply={handleOnClickReply}
                                                                                                >
                                                                                                    {
                                                                                                        message.urls.map((url, index) => {
                                                                                                            const { name, size, type } = JSON.parse(message.content)[index];
                                                                                                            return (
                                                                                                                <File
                                                                                                                    key={message._id + index}
                                                                                                                    url={getLinkDownloadFile(url)}
                                                                                                                    name={name}
                                                                                                                    type={type}
                                                                                                                    size={size}
                                                                                                                    className={type}
                                                                                                                >
                                                                                                                    {
                                                                                                                        type === FILE_TYPE.PDF &&
                                                                                                                        <Document
                                                                                                                            file={url}
                                                                                                                            onLoadSuccess={() => { }}
                                                                                                                        >
                                                                                                                            <Page pageNumber={1}
                                                                                                                                width={370}
                                                                                                                            />
                                                                                                                        </Document>
                                                                                                                    }
                                                                                                                </File>
                                                                                                            )
                                                                                                        })
                                                                                                    }
                                                                                                    {
                                                                                                        messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                        <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                    }
                                                                                                </MessageChat> : (
                                                                                                    message.type === MESSAGES.AUDIO ?
                                                                                                        <MessageChat
                                                                                                            handleModifyMessage={handleModifyMessage}
                                                                                                            isLeft={true}
                                                                                                            message={message}
                                                                                                            handleOnClickReply={handleOnClickReply}
                                                                                                        >
                                                                                                            {
                                                                                                                message.urls.map((url, index) => {
                                                                                                                    return (
                                                                                                                        <audio
                                                                                                                            key={message._id + index}
                                                                                                                            controls
                                                                                                                            src={url}
                                                                                                                        />
                                                                                                                    )
                                                                                                                })
                                                                                                            }
                                                                                                            {
                                                                                                                messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                                <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                            }
                                                                                                        </MessageChat> : (
                                                                                                            message.type === MESSAGES.VIDEO &&
                                                                                                            <MessageChat
                                                                                                                handleModifyMessage={handleModifyMessage}
                                                                                                                isLeft={true}
                                                                                                                message={message}
                                                                                                                handleOnClickReply={handleOnClickReply}
                                                                                                            >
                                                                                                                {
                                                                                                                    message.urls.map((url, index) => {
                                                                                                                        return (
                                                                                                                            <video
                                                                                                                                key={message._id + index}
                                                                                                                                controls
                                                                                                                                src={url}
                                                                                                                            />
                                                                                                                        )
                                                                                                                    })
                                                                                                                }
                                                                                                                {
                                                                                                                    messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                                }
                                                                                                            </MessageChat>
                                                                                                        )
                                                                                                )
                                                                                        )
                                                                                )
                                                                        )}
                                                        </div>
                                                    </div>
                                                    // current user
                                                    :
                                                    <div
                                                        style={{
                                                            alignSelf: 'flex-end',
                                                            marginBottom: message?.reactions?.length > 0 ? '10px' : '0px',
                                                        }}
                                                        className={(message.type === MESSAGES.TEXT || message.isDelete) ? 'message' : (
                                                            (message.type === MESSAGES.AUDIO || message.type === MESSAGES.VIDEO)
                                                                ? 'message w-500 de-bg' : (
                                                                    message.type === MESSAGES.FILE_FOLDER ? 'message' : 'message de-bg'
                                                                )
                                                        )}
                                                        ref={(ref) => {
                                                            if (message.isPin === true) {
                                                                listMessageIsPinRef.current = _.unionBy([{ message: message, ref }], listMessageIsPinRef.current, 'message._id');
                                                                if (hasPin === false) {
                                                                    setHasPin(true);
                                                                }
                                                            }
                                                            if (drawerMethods.searchDrawer.toLowerCase().trim() !== '' && message?.content?.toLowerCase().includes(drawerMethods.searchDrawer.toLowerCase().trim())) {
                                                                drawerMethods.listMessageRef.current = _.unionBy([{ message: message, ref }], drawerMethods.listMessageRef.current, 'message._id');
                                                            }
                                                        }}
                                                    >
                                                        {
                                                            message.isDelete === true ?
                                                                <p style={{ width: '100%', padding: '5px' }} className='message-content-right-isDelete'>{'Tin nhắn đã được thu hồi'}</p> :
                                                                // render message
                                                                message.type === MESSAGES.TEXT ?
                                                                    <MessageChat
                                                                        handleModifyMessage={handleModifyMessage}
                                                                        isLeft={false} message={message}
                                                                        isImage={message.urls?.length > 0}
                                                                        handleOnClickReply={handleOnClickReply}
                                                                    >
                                                                        <p style={{ width: '100%', padding: '5px' }} className='message-content-right'>{message.content}</p>
                                                                        {
                                                                            message.urls?.length > 0 && message.urls.map((image, index) => {
                                                                                return (
                                                                                    <Zoom key={message._id + index}>
                                                                                        <img className="image-message" src={image} alt="image" />
                                                                                    </Zoom>
                                                                                )
                                                                            })
                                                                        }
                                                                        {
                                                                            messages[index + 1]?.sender?.id !== messages[index].sender?.id &&
                                                                            <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                        }
                                                                    </MessageChat>
                                                                    : (
                                                                        message.type === MESSAGES.STICKER ?
                                                                            <MessageChat
                                                                                handleModifyMessage={handleModifyMessage}
                                                                                isLeft={false}
                                                                                message={message}
                                                                                handleOnClickReply={handleOnClickReply}
                                                                            >
                                                                                <img className="sticker" src={message.sticker} alt="sticker" />
                                                                                {
                                                                                    messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                }
                                                                            </MessageChat> : (
                                                                                message.type === MESSAGES.IMAGES ?
                                                                                    <MessageChat
                                                                                        handleModifyMessage={handleModifyMessage}
                                                                                        isLeft={false}
                                                                                        message={message}
                                                                                        isImage
                                                                                        handleOnClickReply={handleOnClickReply}
                                                                                    >
                                                                                        {
                                                                                            message.urls.map((image, index) => {
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
                                                                                    </MessageChat> : (
                                                                                        message.type === MESSAGES.FILE_FOLDER ?
                                                                                            <MessageChat
                                                                                                handleModifyMessage={handleModifyMessage}
                                                                                                isLeft={false}
                                                                                                message={message}
                                                                                                handleOnClickReply={handleOnClickReply}
                                                                                            >
                                                                                                {
                                                                                                    message.urls.map((url, index) => {
                                                                                                        const { name, size, type } = JSON.parse(message.content)[index];
                                                                                                        return (
                                                                                                            <File
                                                                                                                key={message._id + index}
                                                                                                                url={getLinkDownloadFile(url)}
                                                                                                                name={name}
                                                                                                                type={type}
                                                                                                                size={size}
                                                                                                                className={type}
                                                                                                            >
                                                                                                                {
                                                                                                                    type === FILE_TYPE.PDF &&
                                                                                                                    <Document
                                                                                                                        file={url}
                                                                                                                        onLoadSuccess={() => { }}
                                                                                                                    >
                                                                                                                        <Page pageNumber={1}
                                                                                                                            width={370}
                                                                                                                        />
                                                                                                                    </Document>
                                                                                                                }
                                                                                                            </File>
                                                                                                        )
                                                                                                    })
                                                                                                }
                                                                                                {
                                                                                                    messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                    <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                }
                                                                                            </MessageChat> : (
                                                                                                message.type === MESSAGES.AUDIO ?
                                                                                                    <MessageChat
                                                                                                        handleModifyMessage={handleModifyMessage}
                                                                                                        isLeft={false}
                                                                                                        message={message}
                                                                                                        handleOnClickReply={handleOnClickReply}
                                                                                                    >
                                                                                                        {
                                                                                                            message.urls.map((url, index) => {
                                                                                                                return (
                                                                                                                    <audio
                                                                                                                        key={message._id + index}
                                                                                                                        controls
                                                                                                                        src={url}
                                                                                                                    />
                                                                                                                )
                                                                                                            })
                                                                                                        }
                                                                                                        {
                                                                                                            messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                            <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                        }
                                                                                                    </MessageChat> : (
                                                                                                        message.type === MESSAGES.VIDEO &&
                                                                                                        <MessageChat
                                                                                                            handleModifyMessage={handleModifyMessage}
                                                                                                            isLeft={false}
                                                                                                            message={message}
                                                                                                            handleOnClickReply={handleOnClickReply}
                                                                                                        >
                                                                                                            {
                                                                                                                message.urls.map((url, index) => {
                                                                                                                    return (
                                                                                                                        <video
                                                                                                                            key={message._id + index}
                                                                                                                            controls
                                                                                                                            src={url}
                                                                                                                        />
                                                                                                                    )
                                                                                                                })
                                                                                                            }
                                                                                                            {
                                                                                                                messages[index + 1]?.sender?.id !== messages[index].sender.id &&
                                                                                                                <p className='time'>{getTimeFromDate(message.createdAt)}</p>
                                                                                                            }
                                                                                                        </MessageChat>
                                                                                                    )
                                                                                            )
                                                                                    )
                                                                            )

                                                                    )}
                                                    </div>
                                            }
                                            {
                                                !message.isDelete &&
                                                index == messages.length - 1 && message?.sender?.id === user?.id &&
                                                <div
                                                    style={{ alignSelf: 'flex-end' }}
                                                >
                                                    <div
                                                        className="message-status"
                                                        style={{ color: headerColor }}
                                                    >
                                                        {
                                                            sent === STATE.PENDING ?
                                                                <span>Đang gửi</span> :
                                                                (
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

                        <InputSearchSticky
                            content={text}
                            sendMessage={sendMessage}
                            style={listImage?.length > 0 ? { height: '170px' } : {}}
                        >
                            <div style={listImage?.length > 0 ? { height: '170px' } : {}} className="footer" ref={footer}>
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

                                    <ChooseFileUploadPopover
                                        sendFileOrFolder={sendFileOrFolder}
                                        sendVideo={sendVideo}
                                        sendAudio={sendAudio}
                                    >
                                        <div className="item-icon">
                                            <i className="fa-solid fa-paperclip"></i>
                                        </div>
                                    </ChooseFileUploadPopover>

                                    <MicModal
                                        sendAudio={sendAudio}
                                    >
                                        <div className="item-icon">
                                            <i className="fa-solid fa-microphone"></i>
                                        </div>
                                    </MicModal>

                                </div>
                                <div className="footer-bottom footer-item" onClick={handleOnClickFooter}>
                                    <Popover
                                        content={
                                            <Content
                                            />
                                        }
                                        title={
                                            <div className="title-reply">
                                                <i className="fa-solid fa-reply"></i>
                                                <p>Trả lời: {messageReply?.sender?.userName}</p>
                                                <Button onClick={handleRemoveReply}><CloseOutlined /></Button>
                                            </div>}
                                        placement="topLeft"
                                        open={openReply}
                                    >
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
                                    </Popover>

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
                        </InputSearchSticky>
                    </div >
                </div >

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