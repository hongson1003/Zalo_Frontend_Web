import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatusUser from '../../../components/user/status.user';
import './chat.main.scss';
import { MergeCellsOutlined } from '@ant-design/icons';
import data from '@emoji-mart/data/sets/14/facebook.json';
// import data from '../../../mocks/facebook.json';
import Picker from '@emoji-mart/react';
import axios from '../../../utils/axios';
import AvatarUser from '../../../components/user/avatar';
import { Button, Menu, message } from 'antd';
import { socket } from '../../../utils/io';
import { toast } from 'react-toastify';
import _ from 'lodash';
import ReactLoading from 'react-loading';
import { STATE } from '../../../redux/types/app.type';
import TextareaAutosize from 'react-textarea-autosize';
import {
  CHAT_STATUS,
  FILE_TYPE,
  MESSAGES,
} from '../../../redux/types/user.type';
import ChangeBackgroundModal from '../../../components/modal/changeBackground.modal';
import MessageChat from './message.chat';
import {
  customizeFile,
  getLinkDownloadFile,
  getPreviewImage,
  getTimeFromDate,
} from '../../../utils/handleUltils';
import { useNavigate } from 'react-router-dom';
import { getFriend, sendNotifyToChatRealTime } from '../../../utils/handleChat';
import { COLOR_BACKGROUND } from '../../../type/rootCss.type';
import Zoom from 'react-medium-image-zoom';
import InputSearchSticky from '../../../components/customize/inputSearchSticky';
import ChooseFileUploadPopover from '../../../components/popover/chooseFileUpload.popover';
import File from '../../../components/upload/file.upload';
const uploadPreset = import.meta.env.VITE_APP_CLOUNDINARY_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;
const folder = import.meta.env.VITE_APP_CLOUNDINARY_FOLDER;
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import MicModal from '../../../components/modal/mic.modal';
import PinsModal from '../../../components/modal/pins.modal';
import { Input } from 'antd';
import { Popover } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { changeKeySubMenu, editGroup } from '../../../redux/actions/app.action';
import WrapperVideo from '../../../components/customize/wrapperVideo';
import AddMemberModal from '../../../components/modal/addMember.modal';
import InforGroupModal from '../../../components/modal/infoGroup.modal';
import MemberDrawer from '../../../components/drawer/members.drawer';
import DisbandGroupModal from '../../../components/modal/disbandGroup.modal';
import GrantModal from '../../../components/modal/grant.modal';
import ViewAllPicturesModal from '../../../components/modal/viewAllPictures.modal';
import ViewAllFilesModal from '../../../components/modal/viewAllFile.modal';
import ViewAllLinksModal from '../../../components/modal/viewAllLink.modal';
import ViewSettingModal from '../../../components/modal/securitySetting.modal';
import LeaveGroupModal from '../../../components/modal/leaveGroup.modal';
import ChatTogetherDrawer from '../../../components/drawer/chatTogether.drawer';
import LinkJoinGroupModal from '../../../components/modal/linkJoinGroup.modal';
import { accessChat, fetchMessages } from '../../../redux/actions/user.action';
import { Popconfirm } from 'antd';

const ChatMain = ({ file, fileTypes, drawerMethods }) => {
  const chat = useSelector((state) => state.appReducer.subNav);
  const moreInfoRef = useRef(null);
  const [show, setShow] = useState(
    localStorage.getItem('show') === 'true' ? true : false
  );
  const [showEmoij, setShowEmoij] = useState(false);
  const [messages, setMessages] = useState([]);
  const [limit, setLimit] = useState(30);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
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
  const [listImageMessage, setListImageMessage] = useState([]);
  const [listFileMessage, setListFileMessage] = useState([]);
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
  const userState = useSelector((state) => state.userReducer);
  const [listMessageIsPinState, setListMessageIsPinState] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const [openReply, setOpenReply] = useState(false);
  const [messageReply, setMessageReply] = useState(null);
  const [totalChatTogethers, setTotalChatTogethers] = useState([]);
  const leftRef = useRef(null);
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  // text để theo dõi thay đổi
  const [text, setText] = useState('');
  // Emoij

  useEffect(() => {
    // filter is Pin
    let messagesIsPin = messages.filter((item) => {
      return item.isPin === true && item.ref;
    });
    if (messagesIsPin.length > 0) {
      setListMessageIsPinState(messagesIsPin);
    } else {
      setListMessageIsPinState([]);
    }
  }, [messages]);

  useEffect(() => {
    if (chat?._id && messages.length === 0) {
      fetchNotification();
    }
    if (chat?._id && chat.seenBy.includes(user?.id) === false) {
      updateSeenBy();
    }
  }, [messages.length, chat, userState.fetchChats]);

  useEffect(() => {
    if (!chat._id) {
      dispatch(changeKeySubMenu(''));
    }
    textAreaRef.current.focus();
  }, [chat]);

  const handleReceiveReaction = (data) => {
    handleModifyMessage(data);
  };

  const handleTransferDisbandGroup = (data) => {
    fetchMessagePaginate();
    dispatch(editGroup(data));
  };

  const handleLeaveGroup = (data) => {
    if (chat?._id === data.chatId) {
      const participants = chat.participants.filter(
        (item) => item.id !== data.userId
      );
      dispatch(editGroup({ ...chat, participants }));
    }
  };

  const updateSeenBy = async () => {
    try {
      const res = await axios.put('/chat/seen', {
        chatId: chat._id,
      });
      if (res.errCode === 0 && userState.fetchChats) {
        userState.fetchChats();
      }
    } catch (error) {
      console.log(error);
      toast.warn('Có lỗi xảy ra, không thể cập nhật trạng thái đã xem');
    }
  };

  const fetchNotification = async () => {
    await updateSeenBy();
    userState.fetchNotificationChats();
  };

  // get all images
  const getAllImagesMessage = async () => {
    try {
      const limit = 8;
      const res = await axios.get(
        `/chat/message/getAllPicture?chatId=${chat._id}&limit=${limit}`
      );
      if (res.errCode === 0) {
        setListImageMessage(res?.data);
      } else {
        setListImageMessage([]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // get all files
  const getAllFilesMessage = async () => {
    try {
      const limit = 10;
      const res = await axios.get(
        `/chat/message/getAllFile?chatId=${chat._id}&limit=${limit}`
      );
      if (res.errCode === 0) {
        setListFileMessage(res?.data);
      } else {
        setListFileMessage([]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  // get all links
  // const getAllLinksMessage = async () => {
  //     try {
  //         const limit = 10;
  //         const res = await axios.get(`/chat/message/getAllLink?chatId=${chat._id}&limit=${limit}`);
  //         if (res.errCode === 0) {
  //             setListLinkMessage(res?.data);
  //         } else {
  //             setListLinkMessage([]);
  //         }
  //     } catch (err) {
  //         console.log(err);
  //     }
  // }

  const confirm = async (e) => {
    try {
      const res = await axios.post('/chat/group/dissolution', chat);
      if (res.errCode === 0) {
        socket.then((socket) => {
          socket.emit('dissolutionGroupChat', chat);
          setTimeout(() => {
            dispatch(accessChat(null));
          }, 500);
        });
        userState.fetchChats();
      } else {
        toast.warn('Có lỗi xảy ra, không thể giải tán nhóm');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const cancel = (e) => {};

  const handleGrant = (data) => {
    dispatch(editGroup(data));
  };

  useEffect(() => {
    socket.then((socket) => {
      socket.on('receive-reaction', handleReceiveReaction);
      socket.on('transfer-disband-group', handleTransferDisbandGroup);
      socket.on('leave-group', handleLeaveGroup);
      socket.on('grant', handleGrant);
    });

    return () => {
      socket.then((socket) => {
        socket.off('receive-reaction', handleReceiveReaction);
        socket.off('transfer-disband-group', handleTransferDisbandGroup);
        socket.off('leave-group', handleLeaveGroup);
        socket.off('grant', handleGrant);
      });
    };
  }, []);
  // get file
  useEffect(() => {
    if (file) {
      const preview = getPreviewImage(file);
      sendImage(preview, file);
      setTimeout(() => {
        scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
      }, 500);
    }
  }, [file]);

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
        handleClickMoreInfor();
      }
      if (event.ctrlKey && event.key === 'M' && event.ctrlKey) {
        event.preventDefault();
        handleClickMoreInfor();
      }

      if (key === ' ' && event.ctrlKey) {
        event.preventDefault();
        textAreaRef.current.focus();
      }
    };
    const handleFocusTextArea = (e) => {
      if (e.ctrlKey && e.key === ' ') textAreaRef.current.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleFocusTextArea);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTextArea);
    };
  }, []);

  // Emoij
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    setShowEmoij(false);
  }, [user]);

  useEffect(() => {
    setMessages([]);
  }, [chat._id]);

  // fetch mount
  useEffect(() => {
    if (user && chat) {
      fetchMessagePaginate();
    }
  }, [chat, limit]);

  // Get all message img, files, links
  useEffect(() => {
    if (chat?._id) {
      getAllImagesMessage();
    }
  }, [chat._id]);

  useEffect(() => {
    if (chat?._id) {
      getAllFilesMessage();
    }
  }, [chat._id]);

  // useEffect(() => {
  //     if (chat?._id) {
  //         getAllLinksMessage();
  //     }
  // }, [chat._id]);

  // socket
  const handleTypingSocket = (room) => {
    if (room === chat._id) {
      setTyping(true);
    }
  };

  const handleFinishTypingSocket = (room) => {
    if (room === chat._id) {
      setTyping(false);
    }
  };

  const handleReceiveMessageSocket = (data) => {
    if (data._id && data.chat === chat._id) {
      setMessages((prev) => [...prev, data]);
      fetchMessagePaginate();
      scroolRef.current.scrollTop = scroolRef.current?.scrollHeight || 0;
    }
  };

  const handleReceiveModifyMessageSocket = (data) => {
    if (data._id && data?.chat?._id === chat._id) {
      handleModifyMessage(data);
    }
  };

  const handleChangeBackgroundSocket = (data) => {
    if (data.chatId === chat._id) {
      setBackgroundUrl(data.background?.url);
    } else {
      setBackgroundUrl('');
    }
  };

  const handlePinMessageSocket = (data) => {
    if (data._id === chat._id) fetchMessagePaginate();
  };

  const handleDissolutionChat = (data) => {
    userState.fetchChats();
    if (chat?._id === data._id) {
      dispatch(accessChat(null));
    }
  };

  useEffect(() => {
    socket.then((socket) => {
      socket.on('typing', handleTypingSocket);
      socket.on('finish-typing', handleFinishTypingSocket);
      socket.on('receive-message', handleReceiveMessageSocket);
      socket.on('receive-modify-message', handleReceiveModifyMessageSocket);
      socket.on('change-background', handleChangeBackgroundSocket);
      socket.on('pin-message', handlePinMessageSocket);
      socket.on('dissolutionGroupChat', handleDissolutionChat);
    });

    return () => {
      socket.then((socket) => {
        socket.off('typing', handleTypingSocket);
        socket.off('finish-typing', handleFinishTypingSocket);
        socket.off('receive-message', handleReceiveMessageSocket);
        socket.off('receive-modify-message', handleReceiveModifyMessageSocket);
        socket.off('change-background', handleChangeBackgroundSocket);
        socket.off('pin-message', handlePinMessageSocket);
        socket.off('dissolutionGroupChat', handleDissolutionChat);
      });
    };
  }, [chat]);

  // footer
  useEffect(() => {
    if (footer.current?.clientHeight) {
      setFooterHeight(footer.current?.clientHeight);
    }
  }, [footer.current?.clientHeight]);

  // set size cho scrool
  useEffect(() => {
    if (scroolRef.current) {
      scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
    }
  }, [typing, footerHeight]);

  // first load message and scrool to bottom
  useEffect(() => {
    let clock = null;
    if (
      scroolRef.current &&
      scroolFirst.current === false &&
      messages.length > 0
    ) {
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
    };
  }, [messages.length, scroolRef.current?.scrollHeight]);

  useEffect(() => {
    if (scroolFirst.current === true && isLoadingFetch === false) {
      scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
    }
  }, [messages.length]);

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
    };
    const lock = setTimeout(() => {
      checkFullMessage();
    }, 1000);
    return () => {
      clearTimeout(lock);
    };
  }, [isLoadingFetch, messages.length]);

  useEffect(() => {
    if (
      scroolRef.current?.scrollTop &&
      heightScroolTopRef.current < scroolRef.current.scrollTop
    ) {
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
      if (
        scroolRef.current.scrollTop < heightScroolTopRef.current / 2.5 &&
        scroolToTopRef.current === false
      ) {
        scroolToTopRef.current = true;
        setIsLoadingFetch(true);
        setLimit((prev) => prev + 60);
      }
    };
    if (scroolRef.current) {
      scroolRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scroolRef.current) {
        scroolRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scroolRef.current]);

  // handle file
  const sendImage = async (preview, file) => {
    try {
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
        reactions: [],
      };
      setMessages((prev) => [...prev, createMessage]);
      setSent(STATE.PENDING);
      // upload ảnh lên cloudinary
      const url = await uploadToCloudiry(file);
      // save vào db
      const res = await axios.post('/chat/message', {
        ...createMessage,
        urls: [url],
      });
      setSent(STATE.RESOLVE);
      if (res.errCode === 0) {
        userState.fetchChats();
        socket.then((socket) => {
          setSent(STATE.RESOLVE);
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      } else {
        setSent(STATE.REJECT);
        toast.warn('Không thể gửi tin nhắn, ' + res.message);
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const sendImagesFromBase64 = async (urls) => {
    try {
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
        reactions: [],
      };
      setMessages((prev) => [...prev, createMessage]);
      setSent(STATE.PENDING);
      // save ảnh vào db
      const res = await axios.post('/chat/message', {
        ...createMessage,
        urls,
      });
      setSent(STATE.RESOLVE);
      if (res.errCode === 0) {
        userState.fetchChats();
        socket.then((socket) => {
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      } else {
        setSent(STATE.REJECT);
        toast.warn('Không thể gửi tin nhắn, ' + res.message);
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const fetchMessagePaginate = async () => {
    try {
      if (!chat._id) return;
      const res = await axios.get(
        `/chat/message/pagination?chatId=${chat._id}&limit=${limit}`
      );
      if (res.errCode === 0) {
        const data = res.data;
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.log(error);
      setMessages([]);
      toast.warn('Có lỗi xảy ra, không thể lấy tin nhắn');
    }
  };

  useEffect(() => {
    dispatch(fetchMessages(fetchMessagePaginate));
  }, [chat?._id]);

  const handleModifyMessage = (message) => {
    setMessages((prev) =>
      prev.map((item) => {
        if (item._id === message._id) {
          return {
            ...item,
            ...message,
          };
        }
        return item;
      })
    );
  };

  const items = [
    {
      key: 'search',
      icon: (
        <div
          className="box-icon"
          onClick={() => {
            setIsSearching(true);
            drawerMethods.showDrawer();
            setTimeout(() => {
              if (searchRef.current) {
                searchRef.current.focus();
              }
            }, 500);
          }}
        >
          <i className="fa-solid fa-magnifying-glass icon"></i>
        </div>
      ),
    },
    // {
    //     key: 'phone',
    //     icon: <div className="box-icon">
    //         <i className="fa-solid fa-phone icon"></i>
    //     </div>
    // },
    // {
    //     key: 'video-call',
    //     icon: <WrapperVideo>
    //         <div className="box-icon">
    //             <i className="fa-solid fa-video icon"></i>
    //         </div>
    //     </WrapperVideo>
    // },
    {
      key: 'foremore',
      icon: (
        <div className="box-icon" onClick={handleClickMoreInfor}>
          <MergeCellsOutlined className="icon" />
        </div>
      ),
      className: 'info-button',
    },
  ];

  function objectId() {
    return (
      hex(Date.now() / 1000) +
      ' '.repeat(16).replace(/./g, () => hex(Math.random() * 16))
    );
  }

  function hex(value) {
    return Math.floor(value).toString(16);
  }

  const sendMessage = async (data, type) => {
    try {
      if (!data.trim()) {
        if (listImage.length === 0) return;
        else {
          sendImagesFromBase64(listImage);
        }
        setListImage([]);
        setText('');
        return;
      }
      setHasText(false);
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
        reactions: [],
      };
      if (openReply) {
        createMessage.reply = messageReply;
      }
      if (type === MESSAGES.TEXT) {
        createMessage.content = data;
        if (listImage.length > 0) {
          createMessage.urls = [...listImage];
          setListImage([]);
        }
      } else if (type === MESSAGES.STICKER) createMessage.sticker = data;
      setMessages((prev) => [...prev, createMessage]);
      setText('');
      setOpenReply(false);
      setSent(STATE.PENDING);
      const res = await axios.post('/chat/message', {
        ...createMessage,
        chatId: chat._id,
      });
      if (res.errCode === 0) {
        socket.then((socket) => {
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
          setSent(STATE.RESOLVE);
          userState.fetchChats();
          scroolRef.current.scrollTop = scroolRef.current.scrollHeight;
        });
        // fetchMessagePaginate();
      } else {
        setSent(STATE.REJECT);
        toast.warn('Không thể gửi tin nhắn, ' + res.message);
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  function handleClickMoreInfor() {
    setShow((prev) => !prev);
    localStorage.setItem('show', !show);
  }

  useEffect(() => {
    if (chat) {
      if (windowSize < 768) {
        if (show) {
          leftRef.current.style.display = 'none';
          leftRef.current.style.width = '0px';
          moreInfoRef.current.style.width = '100%';
          moreInfoRef.current.style.maxWidth = '100%';
        } else {
          leftRef.current.style.display = 'block';
          leftRef.current.style.width = '100%';
          moreInfoRef.current.style.width = '0px';
          moreInfoRef.current.style.maxWidth = '0px';
        }
      } else {
        if (show) {
          moreInfoRef.current.style.width = '100%';
        } else {
          moreInfoRef.current.style.width = '0px';
        }
      }
    }
  }, [show]);

  const handleResize = (size, meta) => {
    textAreaRef.current.style.height = 'auto !important';
    if (footer.current?.clientHeight) {
      setFooterHeight(footer.current?.clientHeight);
    }
  };

  let emitFinishTyping = useCallback(
    _.debounce(() => {
      if (sendTyping.current === true) {
        socket.then((socket) => {
          socket.emit('finish-typing', chat._id);
          sendTyping.current = false;
        });
      }
    }, 700),
    []
  );

  let startTyping = useCallback(() => {
    if (sendTyping.current === false) {
      socket.then((socket) => {
        socket.emit('typing', chat._id);
      });
      sendTyping.current = true;
    }
  }, []);

  const handleSetText = _.debounce((value) => {
    setText(value);
  }, 700);

  const handleDebouceOnChange = _.debounce((e) => {
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
    emitFinishTyping();
  }, 700);

  const handleOnChange = (e) => {
    if (sendTyping.current === false) {
      startTyping();
    }
    handleDebouceOnChange(e);
  };
  const handleShowHideEmoij = () => {
    setShowEmoij((prev) => !prev);
  };

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
  };

  const handleRemoveImage = (index) => {
    if (listImage.length === 1) {
      setHasText(false);
    }
    setListImage((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePaste = () => {
    setHasText(true);
    if (listImage.length > 6) {
      toast.warn('Bạn chỉ có thể chọn tối đa 7 ảnh');
      return;
    }
    navigator.clipboard.read().then((clipboardItems) => {
      clipboardItems.forEach(async (item) => {
        if (
          item.types.includes('image/png') ||
          item.types.includes('image/jpeg')
        ) {
          const blob =
            (await item.getType('image/png')) || item.getType('image/jpeg');
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            // Xử lý ảnh ở đây, có thể hiển thị nó hoặc lưu vào state
            setListImage((prev) => [...prev, result]);
          };
          reader.readAsDataURL(blob);
        }
      });
    });
  };

  const handleOnClickOutSide = (e) => {
    if (showEmoij) {
      if (!e.target.className.includes('emoijj')) {
        setShowEmoij(false);
      }
    }
  };

  const handleChooseEmoij = (e) => {
    if (textAreaRef.current) {
      textAreaRef.current.value += e.native;
      setHasText(true);
    }
  };

  const handleDispatchSendMessageFunc = () => {
    if (dispatchRef.current === false) {
      dispatch({ type: MESSAGES.SEND_MESSAGE_FUNC, payload: sendMessage });
      dispatchRef.current = true;
    }
  };

  const handleOnClickFooter = () => {
    textAreaRef.current.focus();
  };

  const handleChangeBackground = async (background) => {
    if (background) {
      setBackgroundUrl(background.url);
      setHeaderColor(COLOR_BACKGROUND[background.headerColor]);
      setMessageColor(COLOR_BACKGROUND[background.messageColor]);
      await sendNotifyToChatRealTime(
        chat._id,
        `Đã thay đổi hình nền`,
        MESSAGES.NOTIFY
      );
      fetchMessagePaginate();
    } else {
      setBackgroundUrl('');
    }
    socket.then((socket) => {
      socket.emit('change-background', { chatId: chat._id, background });
    });
  };

  const handleOnChangeMessageImage = async (e) => {
    try {
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
        reactions: [],
      };
      setMessages((prev) => [...prev, createMessage]);
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
        urls: urls,
      });
      setSent(STATE.RESOLVE);
      if (res.errCode === 0) {
        userState.fetchChats();
        getAllImagesMessage();
        socket.then((socket) => {
          setSent(STATE.RESOLVE);
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      } else {
        setSent(STATE.REJECT);
        toast.warn('Không thể gửi tin nhắn, ' + res.message);
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const sendAudio = async (file) => {
    // preview
    try {
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
        reactions: [],
      };
      setMessages((prev) => [...prev, createMessage]);
      setSent(STATE.PENDING);
      // upload
      const url = await uploadToCloudiry(file);
      // save
      const res = await axios.post('/chat/message', {
        ...createMessage,
        urls: [url],
      });
      setSent(STATE.RESOLVE);
      if (res.errCode === 0) {
        socket.then((socket) => {
          setSent(STATE.RESOLVE);
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const uploadToCloudiry = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    formData.append('folder', folder);
    formData.append('resource_type', 'raw');

    if (file) {
      const origin = file.name;
      const name = origin.split('.')[0];
      const extName = origin.split('.')[1];
      const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
      formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload?secure=true`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const { secure_url } = await response.json();
      return secure_url;
    }
  };

  const sendFileOrFolder = async (filesOrFolders) => {
    try {
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
        reactions: [],
      };
      setMessages((prev) => [...prev, createMessage]);
      // const data = await uploadToCloudiry(filesOrFolders[0]);
      //save
      const urls = [];
      for (let i = 0; i < filesOrFolders.length; i++) {
        const url = await uploadToCloudiry(filesOrFolders[i]);
        urls.push(url);
      }
      const res = await axios.post('/chat/message', {
        ...createMessage,
        urls,
        content: JSON.stringify(dataFiles),
      });
      if (res.errCode === 0) {
        userState.fetchChats();
        socket.then((socket) => {
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      } else {
        toast.warn('Không thể gửi tin nhắn, ' + res.message);
      }
    } catch (error) {
      console.log(error);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const sendVideo = async (file) => {
    try {
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
        reactions: [],
      };

      setMessages((prev) => [...prev, createMessage]);
      setSent(STATE.PENDING);
      // upload
      let url = '';
      try {
        url = await uploadToCloudiry(file);
        if (!url) {
          setSent(STATE.REJECT);
          toast.warn('Không thể gửi tin nhắn, ' + 'Lỗi không xác định');
          return;
        }
      } catch (error) {
        setSent(STATE.REJECT);
        toast.warn('Không thể gửi tin nhắn, ' + error.message);
      }
      // save
      const res = await axios.post('/chat/message', {
        ...createMessage,
        urls: [url],
      });
      setSent(STATE.RESOLVE);
      if (res.errCode === 0) {
        userState.fetchChats();
        socket.then((socket) => {
          setSent(STATE.RESOLVE);
          socket.emit('send-message', res.data);
          socket.emit('finish-typing', chat._id);
        });
      }
    } catch (error) {
      console.log(error);
      setSent(STATE.REJECT);
      toast.warn('Không thể gửi tin nhắn, ' + error.message);
    }
  };

  const handleFindMessageFirst = (ref) => {
    ref.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  };

  const handleOnSearch = _.debounce((value) => {
    drawerMethods.setSearchDrawer(value);
  }, 500);

  const handlePin = async () => {
    try {
      const res = await axios.put('/chat/pin', { chatId: chat._id });
      if (res.errCode === 0) {
        toast.success('Đã ghim hộp thoại thành công');
      } else if (res.errCode === 3) {
        toast.success('Đã bỏ ghim hộp thoại thành công');
      } else {
        toast.warn('Ghim hộp thoại thất bại');
      }
      userState.fetchChats();
    } catch (error) {
      console.log(error);
      toast.warn('Ghim hộp thoại thất bại');
    }
  };

  const Content = () => {
    return (
      <div className="reply-content">
        <p>{messageReply?.content}</p>
        {messageReply?.sticker ||
        (messageReply?.urls?.length > 0 &&
          messageReply.type === MESSAGES.IMAGES) ? (
          <img src={messageReply?.sticker || messageReply?.urls[0]}></img>
        ) : (
          messageReply?.urls?.length > 0 &&
          messageReply.type === MESSAGES.VIDEO && (
            <video src={messageReply?.urls[0]} />
          )
        )}
      </div>
    );
  };

  const handleOnClickReply = (message) => {
    setMessageReply(message);
    setOpenReply(true);
    textAreaRef.current.focus();
  };

  const handleRemoveReply = () => {
    setMessageReply(null);
    setOpenReply(false);
    textAreaRef.current.value = '';
  };

  const handleGetToTalChatTogethers = async () => {
    try {
      const friend = getFriend(user, chat.participants);
      const res = await axios.get(`/chat/total-together?friendId=${friend.id}`);
      setTotalChatTogethers(res.data);
    } catch (error) {
      console.log(error);
      toast.warn('Không thể lấy số lượng tin nhắn chung');
    }
  };

  useEffect(() => {
    if (chat?._id && chat.type === CHAT_STATUS.PRIVATE_CHAT) {
      handleGetToTalChatTogethers();
    }
  }, [chat]);

  return (
    <>
      <div className="chat-container">
        <div className="left chat-item" ref={leftRef}>
          <header>
            {isLoadingFetch && (
              <ReactLoading
                type={'spokes'}
                color={'#006CE5'}
                width={30}
                height={30}
                className={'chat-main-loading'}
              />
            )}
            <div className="friend-info">
              <StatusUser chat={chat} />
            </div>
            <div className="tools">
              <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
                className="menu-header"
              />
            </div>
          </header>
          <div className="main-chat-content">
            {isSearching && (
              <div className="searching">
                <Input
                  value={drawerMethods.searchValue}
                  placeholder="Tìm tin nhắn"
                  prefix={<i className="fa-solid fa-search"></i>}
                  onChange={(e) => handleOnSearch(e.target.value)}
                  spellCheck={false}
                  ref={searchRef}
                />
                <Button
                  type="default"
                  onClick={() => {
                    setCurrent('');
                    drawerMethods.onClose();
                    setIsSearching(false);
                  }}
                >
                  Đóng
                </Button>
              </div>
            )}
            {listMessageIsPinState.length > 0 && !isSearching && (
              <div className="pin-container">
                <div className="pin-icon-item">
                  <i className="fa-regular fa-message"></i>
                </div>
                <div
                  className="pin-content-item"
                  onClick={() =>
                    handleFindMessageFirst(listMessageIsPinState[0].ref)
                  }
                >
                  <p className="title">Tin nhắn</p>
                  <div className="content">
                    <span>{listMessageIsPinState[0]?.sender?.userName}:</span>
                    {listMessageIsPinState[0].type === MESSAGES.TEXT ? (
                      <span>{listMessageIsPinState[0]?.content}</span>
                    ) : listMessageIsPinState[0]?.type === MESSAGES.IMAGES ? (
                      <span>Đã gửi ảnh</span>
                    ) : listMessageIsPinState[0]?.type ===
                      MESSAGES.FILE_FOLDER ? (
                      <span>File</span>
                    ) : (
                      <span>Sticker</span>
                    )}
                  </div>
                </div>
                <div className="more-pin">
                  <PinsModal
                    data={listMessageIsPinState}
                    handleFindMessageFirst={handleFindMessageFirst}
                    fetchChats={userState.fetchChats}
                    fetchMessagePaginate={fetchMessagePaginate}
                  >
                    <i className="fa-solid fa-circle-info"></i>
                  </PinsModal>
                </div>
              </div>
            )}
            <div
              className={`content-chat-messages ${
                listMessageIsPinState.length > 0 || isSearching ? 'pt-50' : ''
              }`}
              ref={scroolRef}
              style={{
                height: `calc(100% - ${footerHeight - 10}px)`,
                color: messageColor,
              }}
            >
              {messages &&
                messages.length > 0 &&
                messages.map((message, index) => {
                  if (message.unViewList.includes(user.id)) {
                    return null;
                  }
                  if (message.type === MESSAGES.NOTIFY) {
                    return (
                      <div className="notify-message" key={message._id}>
                        <p>{message.content}</p>
                      </div>
                    );
                  } else if (message.type === MESSAGES.NEW_FRIEND) {
                    return (
                      <div className="new-friend-message" key={message._id}>
                        <div className="group-avatar">
                          <AvatarUser
                            image={user?.avatar}
                            name={user?.userName}
                            size={80}
                          />
                          <AvatarUser
                            image={getFriend(user, chat.participants).avatar}
                            name={getFriend(user, chat.participants).userName}
                            size={80}
                          />
                        </div>
                        <p>{message.content}</p>
                      </div>
                    );
                  }
                  return (
                    <React.Fragment key={message._id}>
                      {
                        // no current user
                        user?.id !== message.sender.id ? (
                          <div
                            className={`group-message ${
                              message.type === MESSAGES.TEXT ? 'bg-white' : ''
                            }`}
                            style={{
                              marginBottom:
                                message?.reactions?.length > 0 ? '10px' : '0px',
                            }}
                            ref={(ref) => {
                              if (message.isPin === true) {
                                message.ref = ref;
                              }
                              if (
                                drawerMethods.searchDrawer
                                  .toLowerCase()
                                  .trim() !== '' &&
                                message?.content
                                  ?.toLowerCase()
                                  .includes(
                                    drawerMethods.searchDrawer
                                      .toLowerCase()
                                      .trim()
                                  )
                              ) {
                                drawerMethods.listMessageRef.current =
                                  _.unionBy(
                                    [{ message: message, ref }],
                                    drawerMethods.listMessageRef.current,
                                    'message._id'
                                  );
                              }
                            }}
                          >
                            {
                              <div className="avatar">
                                {index === 1 ? (
                                  <AvatarUser
                                    image={
                                      message?.sender?.avatar ||
                                      '/images/user-dev.png'
                                    }
                                    name={
                                      message?.sender?.userName || 'Người dùng'
                                    }
                                  />
                                ) : (
                                  messages[index - 1]?.sender.id !==
                                    messages[index]?.sender.id && (
                                    <AvatarUser
                                      image={
                                        message?.sender?.avatar ||
                                        '/images/user-dev.png'
                                      }
                                      name={
                                        message?.sender?.userName ||
                                        'Người dùng'
                                      }
                                    />
                                  )
                                )}
                              </div>
                            }
                            <div
                              // className={
                              //     (message.type === MESSAGES.TEXT || message.isDelete === true) ? 'message' : (
                              //         (message.type === MESSAGES.IMAGES || message.type === MESSAGES.VIDEO ||
                              //             message.type === MESSAGES.AUDIO
                              //         ) ? 'message de-bg w-500' : 'message'
                              //     )
                              // }
                              className={
                                message.type === MESSAGES.TEXT ||
                                message.isDelete
                                  ? 'message'
                                  : message.type === MESSAGES.AUDIO ||
                                    message.type === MESSAGES.VIDEO
                                  ? 'message w-500 de-bg'
                                  : message.type === MESSAGES.FILE_FOLDER
                                  ? 'message'
                                  : 'message de-bg'
                              }
                            >
                              {messages[index - 1]?.sender?.id !==
                                messages[index].sender.id && (
                                <p
                                  style={{ color: messageColor }}
                                  className="name"
                                >
                                  {message?.sender?.userName || 'Người dùng'}
                                </p>
                              )}
                              {message.isDelete === true ? (
                                <p
                                  style={{
                                    width: '100%',
                                    padding: '5px',
                                    fontSize: '14px',
                                    color: '#888',
                                  }}
                                  className="message-content-right"
                                >
                                  {'Tin nhắn đã được thu hồi'}
                                </p>
                              ) : message.type === MESSAGES.TEXT ? (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={true}
                                  message={message}
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  <p
                                    style={{ width: '100%', padding: '5px' }}
                                    className="message-content-left"
                                  >
                                    {message.content}
                                  </p>
                                  {message.urls?.length > 0 &&
                                    message.urls.map((image, index) => {
                                      return (
                                        <Zoom
                                          key={message._id + index}
                                          className="khohieu"
                                        >
                                          <img
                                            className="image-message"
                                            src={image}
                                            alt="image"
                                          />
                                        </Zoom>
                                      );
                                    })}
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index]?.sender?.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              ) : message.type === MESSAGES.STICKER ? (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={true}
                                  message={message}
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  <img
                                    className="sticker"
                                    src={message.sticker}
                                    alt="sticker"
                                  />
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index].sender.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              ) : message.type === MESSAGES.IMAGES ? (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={true}
                                  message={message}
                                  isImage
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  {message.urls.map((image, index) => {
                                    return (
                                      <Zoom key={message._id + index}>
                                        <img
                                          className="image-message"
                                          src={image}
                                          alt="image"
                                        />
                                      </Zoom>
                                    );
                                  })}
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index].sender.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              ) : message.type === MESSAGES.FILE_FOLDER ? (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={true}
                                  message={message}
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  {message.urls.map((url, index) => {
                                    const { name, size, type } = JSON.parse(
                                      message.content
                                    )[index];
                                    return (
                                      <File
                                        key={message._id + index}
                                        url={getLinkDownloadFile(url)}
                                        name={name}
                                        type={type}
                                        size={size}
                                        className={type}
                                      >
                                        {type === FILE_TYPE.PDF && (
                                          <Document
                                            file={url}
                                            onLoadSuccess={() => {}}
                                          >
                                            <Page pageNumber={1} width={370} />
                                          </Document>
                                        )}
                                      </File>
                                    );
                                  })}
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index].sender.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              ) : message.type === MESSAGES.AUDIO ? (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={true}
                                  message={message}
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  {message.urls.map((url, index) => {
                                    return (
                                      <audio
                                        key={message._id + index}
                                        controls
                                        src={url}
                                      />
                                    );
                                  })}
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index].sender.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              ) : (
                                message.type === MESSAGES.VIDEO && (
                                  <MessageChat
                                    handleModifyMessage={handleModifyMessage}
                                    isLeft={true}
                                    message={message}
                                    handleOnClickReply={handleOnClickReply}
                                  >
                                    {message.urls.map((url, index) => {
                                      return (
                                        <video
                                          key={message._id + index}
                                          controls
                                          src={url}
                                        />
                                      );
                                    })}
                                    {messages[index + 1]?.sender?.id !==
                                      messages[index].sender.id && (
                                      <p className="time">
                                        {getTimeFromDate(message.createdAt)}
                                      </p>
                                    )}
                                  </MessageChat>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          // current user
                          <div
                            style={{
                              alignSelf: 'flex-end',
                              marginBottom:
                                message?.reactions?.length > 0 ? '10px' : '0px',
                            }}
                            className={
                              message.type === MESSAGES.TEXT || message.isDelete
                                ? 'message'
                                : message.type === MESSAGES.AUDIO ||
                                  message.type === MESSAGES.VIDEO
                                ? 'message w-500 de-bg'
                                : message.type === MESSAGES.FILE_FOLDER
                                ? 'message'
                                : 'message de-bg'
                            }
                            ref={(ref) => {
                              if (message.isPin === true) {
                                message.ref = ref;
                              }
                              if (
                                drawerMethods.searchDrawer
                                  .toLowerCase()
                                  .trim() !== '' &&
                                message?.content
                                  ?.toLowerCase()
                                  .includes(
                                    drawerMethods.searchDrawer
                                      .toLowerCase()
                                      .trim()
                                  )
                              ) {
                                drawerMethods.listMessageRef.current =
                                  _.unionBy(
                                    [{ message: message, ref }],
                                    drawerMethods.listMessageRef.current,
                                    'message._id'
                                  );
                              }
                            }}
                          >
                            {message.isDelete === true ? (
                              <p
                                style={{ width: '100%', padding: '5px' }}
                                className="message-content-right-isDelete"
                              >
                                {'Tin nhắn đã được thu hồi'}
                              </p>
                            ) : // render message
                            message.type === MESSAGES.TEXT ? (
                              <MessageChat
                                handleModifyMessage={handleModifyMessage}
                                isLeft={false}
                                message={message}
                                isImage={message.urls?.length > 0}
                                handleOnClickReply={handleOnClickReply}
                              >
                                <p
                                  style={{ width: '100%', padding: '5px' }}
                                  className="message-content-right"
                                >
                                  {message.content}
                                </p>
                                {message.urls?.length > 0 &&
                                  message.urls.map((image, index) => {
                                    return (
                                      <Zoom key={message._id + index}>
                                        <img
                                          className="image-message"
                                          src={image}
                                          alt="image"
                                        />
                                      </Zoom>
                                    );
                                  })}
                                {messages[index + 1]?.sender?.id !==
                                  messages[index].sender?.id && (
                                  <p className="time">
                                    {getTimeFromDate(message.createdAt)}
                                  </p>
                                )}
                              </MessageChat>
                            ) : message.type === MESSAGES.STICKER ? (
                              <MessageChat
                                handleModifyMessage={handleModifyMessage}
                                isLeft={false}
                                message={message}
                                handleOnClickReply={handleOnClickReply}
                              >
                                <img
                                  className="sticker"
                                  src={message.sticker}
                                  alt="sticker"
                                />
                                {messages[index + 1]?.sender?.id !==
                                  messages[index].sender.id && (
                                  <p className="time">
                                    {getTimeFromDate(message.createdAt)}
                                  </p>
                                )}
                              </MessageChat>
                            ) : message.type === MESSAGES.IMAGES ? (
                              <MessageChat
                                handleModifyMessage={handleModifyMessage}
                                isLeft={false}
                                message={message}
                                isImage
                                handleOnClickReply={handleOnClickReply}
                              >
                                {message.urls.map((image, index) => {
                                  return (
                                    <Zoom key={message._id + index}>
                                      <img
                                        className="image-message"
                                        src={image}
                                        alt="image"
                                      />
                                    </Zoom>
                                  );
                                })}
                                {messages[index + 1]?.sender?.id !==
                                  messages[index].sender.id && (
                                  <p className="time">
                                    {getTimeFromDate(message.createdAt)}
                                  </p>
                                )}
                              </MessageChat>
                            ) : message.type === MESSAGES.FILE_FOLDER ? (
                              <MessageChat
                                handleModifyMessage={handleModifyMessage}
                                isLeft={false}
                                message={message}
                                handleOnClickReply={handleOnClickReply}
                              >
                                {message.urls.map((url, index) => {
                                  const { name, size, type } = JSON.parse(
                                    message.content
                                  )[index];
                                  return (
                                    <File
                                      key={message._id + index}
                                      url={getLinkDownloadFile(url)}
                                      name={name}
                                      type={type}
                                      size={size}
                                      className={type}
                                    >
                                      {type === FILE_TYPE.PDF && (
                                        <Document
                                          file={url}
                                          onLoadSuccess={() => {}}
                                        >
                                          <Page pageNumber={1} width={370} />
                                        </Document>
                                      )}
                                    </File>
                                  );
                                })}
                                {messages[index + 1]?.sender?.id !==
                                  messages[index].sender.id && (
                                  <p className="time">
                                    {getTimeFromDate(message.createdAt)}
                                  </p>
                                )}
                              </MessageChat>
                            ) : message.type === MESSAGES.AUDIO ? (
                              <MessageChat
                                handleModifyMessage={handleModifyMessage}
                                isLeft={false}
                                message={message}
                                handleOnClickReply={handleOnClickReply}
                              >
                                {message.urls.map((url, index) => {
                                  return (
                                    <audio
                                      key={message._id + index}
                                      controls
                                      src={url}
                                    />
                                  );
                                })}
                                {messages[index + 1]?.sender?.id !==
                                  messages[index].sender.id && (
                                  <p className="time">
                                    {getTimeFromDate(message.createdAt)}
                                  </p>
                                )}
                              </MessageChat>
                            ) : (
                              message.type === MESSAGES.VIDEO && (
                                <MessageChat
                                  handleModifyMessage={handleModifyMessage}
                                  isLeft={false}
                                  message={message}
                                  handleOnClickReply={handleOnClickReply}
                                >
                                  {message.urls.map((url, index) => {
                                    return (
                                      <video
                                        key={message._id + index}
                                        controls
                                        src={url}
                                      />
                                    );
                                  })}
                                  {messages[index + 1]?.sender?.id !==
                                    messages[index].sender.id && (
                                    <p className="time">
                                      {getTimeFromDate(message.createdAt)}
                                    </p>
                                  )}
                                </MessageChat>
                              )
                            )}
                          </div>
                        )
                      }
                      {!message.isDelete &&
                        index == messages.length - 1 &&
                        message?.sender?.id === user?.id && (
                          <div style={{ alignSelf: 'flex-end' }}>
                            <div
                              className="message-status"
                              style={{ color: headerColor }}
                            >
                              {sent === STATE.PENDING ? (
                                <span>Đang gửi</span>
                              ) : sent === STATE.RESOLVE ? (
                                <span>
                                  <i className="fa-solid fa-check-double"></i>
                                  &nbsp; Đã nhận
                                </span>
                              ) : (
                                <span>Gửi thất bại</span>
                              )}
                            </div>
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}
            </div>

            {typing && (
              <div className="sending">
                <div className="message-status">
                  <span>
                    {chat.type === CHAT_STATUS.PRIVATE_CHAT ? (
                      <span className="message-status-user">
                        {getFriend(user, chat.participants)?.userName}
                      </span>
                    ) : (
                      <span className="message-status-user">
                        Thành viên nhóm
                      </span>
                    )}
                    &nbsp;
                    <span>đang soạn tin nhắn</span>
                  </span>
                </div>
                <ReactLoading
                  type={'bubbles'}
                  color={'grey'}
                  className="sending-loading"
                />
              </div>
            )}

            {/* Init position */}
            <div className="emoij-container">
              {showEmoij && (
                <Picker
                  data={data}
                  onEmojiSelect={handleChooseEmoij}
                  onClickOutside={(e) => handleOnClickOutSide(e)}
                  skin={6}
                  isNative
                />
              )}
            </div>

            <InputSearchSticky
              content={text}
              sendMessage={sendMessage}
              style={listImage?.length > 0 ? { height: '170px' } : {}}
            >
              <div
                style={listImage?.length > 0 ? { height: '170px' } : {}}
                className="footer"
                ref={footer}
              >
                <div className="footer-top footer-item">
                  {/* <StickyPopover >
                                        <div
                                            className="item-icon"
                                            onClick={() => handleDispatchSendMessageFunc()}
                                        >
                                            <img src="/images/sticker.png" />
                                        </div>
                                    </StickyPopover> */}
                  <label htmlFor="message-inpt-image">
                    <div className="item-icon">
                      <i className="fa-regular fa-image"></i>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="message-inpt-image"
                    hidden
                    accept="image/png, image/gif, image/jpeg"
                    onChange={(e) => handleOnChangeMessageImage(e)}
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

                  <MicModal sendAudio={sendAudio}>
                    <div className="item-icon">
                      <i className="fa-solid fa-microphone"></i>
                    </div>
                  </MicModal>
                </div>
                <div
                  className="footer-bottom footer-item"
                  onClick={handleOnClickFooter}
                >
                  <Popover
                    content={<Content />}
                    title={
                      <div className="title-reply">
                        <i className="fa-solid fa-reply"></i>
                        <p>Trả lời: {messageReply?.sender?.userName}</p>
                        <Button onClick={handleRemoveReply}>
                          <CloseOutlined />
                        </Button>
                      </div>
                    }
                    placement="topLeft"
                    open={openReply}
                  >
                    <TextareaAutosize
                      className="input-text"
                      onChange={(e) => handleOnChange(e)}
                      placeholder="Nhập tin nhắn..."
                      onKeyDown={(e) => handleOnKeyDown(e)}
                      autoFocus
                      spellCheck={false}
                      onHeightChange={(height, meta) =>
                        handleResize(height, meta)
                      }
                      ref={textAreaRef}
                      type="text"
                    />
                  </Popover>

                  <div className="text-quick-group">
                    <div
                      className="item-icon emoijj"
                      onClick={handleShowHideEmoij}
                    >
                      <i className="fa-regular fa-face-smile emoijj"></i>
                    </div>
                    <div className="item-icon emoij-like">
                      {!hasText ? (
                        <div
                          style={{ padding: '10px' }}
                          onClick={() => sendMessage('👌', MESSAGES.TEXT)}
                        >
                          👌
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            sendMessage(
                              textAreaRef.current?.value,
                              MESSAGES.TEXT
                            )
                          }
                        >
                          <i className="fa-regular fa-paper-plane"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {listImage && listImage.length > 0 && (
                  <div className="list-images">
                    {listImage.map((image, index) => {
                      return (
                        <div key={index} className="image-item">
                          <Zoom>
                            <img src={image} alt="image" />
                          </Zoom>
                          <div className="image-item-remove">
                            <button onClick={() => handleRemoveImage(index)}>
                              X
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </InputSearchSticky>
          </div>
        </div>

        {
          <div className="right chat-item" ref={moreInfoRef}>
            <header>
              <div className="back-btn" onClick={handleClickMoreInfor}>
                <i className="fa-solid fa-circle-chevron-left"></i>
              </div>
              {chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                <h3 className="title">Thông tin trò chuyện</h3>
              ) : (
                <h3 className="title">Thông tin nhóm</h3>
              )}
            </header>
            <div className="right-body">
              <div className="item-avatar">
                {chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                  <AvatarUser
                    image={getFriend(user, chat.participants)?.avatar}
                    size={50}
                    name={getFriend(user, chat.participants)?.userName}
                  />
                ) : (
                  <div className="avatar-group">
                    {chat?.groupPhoto ? (
                      <img src={chat?.groupPhoto} alt="avatar" />
                    ) : (
                      chat?.participants?.length > 0 &&
                      chat?.participants?.map((item) => {
                        return (
                          <React.Fragment key={item.id}>
                            <AvatarUser
                              image={item.avatar}
                              size={25}
                              name={
                                getFriend(user, chat.participants)?.userName
                              }
                            />
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                )}
                {chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                  <p className="name">
                    <span>{getFriend(user, chat.participants)?.userName}</span>
                    <span
                      style={{
                        padding: '0 5px',
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square edit"></i>
                    </span>
                  </p>
                ) : (
                  <p className="name">
                    <span>{chat?.name}</span>
                    <span
                      style={{
                        padding: '0 5px',
                      }}
                    >
                      <InforGroupModal>
                        <i className="fa-solid fa-pen-to-square edit"></i>
                      </InforGroupModal>
                    </span>
                  </p>
                )}
              </div>

              <div className="item-change-bg">
                <ChangeBackgroundModal
                  chat={chat}
                  handleChangeBackground={handleChangeBackground}
                >
                  <Button className="change-background-btn">
                    Đổi hình nền
                  </Button>
                </ChangeBackgroundModal>
              </div>

              <div className="hyphen"></div>

              <div className="options-list">
                {/* <div className="button-wrapper">
                                    <button className="button">
                                        <div className="button-icon">
                                            <img src="/images/notification.png" alt="Turn Off Notification Icon" />
                                        </div>
                                        <p>Tắt thông báo</p>
                                    </button>
                                </div> */}
                <div className="button-wrapper">
                  <button className="button" onClick={handlePin}>
                    <div className="button-icon">
                      <img src="/images/pin.png" alt="Pin Dialog Icon" />
                    </div>
                    <p>Ghim hội thoại</p>
                  </button>
                </div>
                {chat.type === CHAT_STATUS.GROUP_CHAT && (
                  <div className="button-wrapper">
                    <AddMemberModal chat={chat}>
                      <button className="button">
                        <div className="button-icon">
                          <img
                            src="/images/add-member.png"
                            alt="Create Group Icon"
                          />
                        </div>
                        <p>Thêm thành viên</p>
                      </button>
                    </AddMemberModal>
                  </div>
                )}
                {chat.type === CHAT_STATUS.GROUP_CHAT && (
                  <div className="button-wrapper">
                    <LinkJoinGroupModal group={chat}>
                      <button className="button">
                        <div className="button-icon">
                          <img src="/images/share-icon.png" alt="Share group" />
                        </div>
                        <p>Chia sẻ nhóm</p>
                      </button>
                    </LinkJoinGroupModal>
                  </div>
                )}
                {chat.type === CHAT_STATUS.PRIVATE_CHAT && (
                  <div className="button-wrapper">
                    <button className="button">
                      <div className="button-icon">
                        <img src="/images/group.png" alt="Create Group Icon" />
                      </div>
                      <p>Tạo nhóm chat</p>
                    </button>
                  </div>
                )}
              </div>

              <div className="hyphen"></div>

              {chat.type === CHAT_STATUS.GROUP_CHAT && (
                <div className="right-members">
                  <MemberDrawer chat={chat}>
                    <p className="title">Thành viên</p>
                    <div className="content">
                      <img src="/images/group.png" alt="Create Group Icon" />
                      <p className="count-members">
                        {chat.participants?.length} thành viên
                      </p>
                    </div>
                  </MemberDrawer>
                </div>
              )}
              {chat.type === CHAT_STATUS.PRIVATE_CHAT && (
                <div className="info-list">
                  <div className="common-group">
                    <img
                      className="icon"
                      src="/images/people.png"
                      alt="Create Group Icon"
                    />
                    <ChatTogetherDrawer chats={totalChatTogethers}>
                      <p>{totalChatTogethers.length} nhóm chung</p>
                    </ChatTogetherDrawer>
                  </div>
                </div>
              )}
              {listImageMessage.length > 0 && (
                <div className="view-all-image">
                  <div className="hyphen"></div>
                  <ViewAllPicturesModal
                    message={listImageMessage}
                  ></ViewAllPicturesModal>
                </div>
              )}
              {listFileMessage.length > 0 && (
                <div className="view-all-file">
                  <div className="hyphen"></div>
                  <ViewAllFilesModal
                    files={listFileMessage}
                  ></ViewAllFilesModal>
                </div>
              )}
              {/* {
                                <div className="view-all-link">
                                    <div className="hyphen"></div>
                                    <ViewAllLinksModal links={[]}>
                                    </ViewAllLinksModal>
                                </div>
                            } */}
              {
                <div className="security-setting">
                  <div className="hyphen"></div>
                  <ViewSettingModal></ViewSettingModal>
                  <div className="hyphen"></div>
                </div>
              }

              {chat.type === CHAT_STATUS.GROUP_CHAT &&
                chat.administrator === user.id && (
                  <>
                    <div className="grant-adminstrator">
                      <GrantModal chat={chat}>
                        <Button>Chuyển trưởng nhóm</Button>
                      </GrantModal>
                    </div>
                  </>
                )}

              {chat.type === CHAT_STATUS.GROUP_CHAT && (
                <div className="leave-group">
                  {chat?.administrator === user?.id ? (
                    <div className="group-important-delete">
                      <DisbandGroupModal>
                        <Button
                          icon={<i className="fa-solid fa-sign-out"></i>}
                          className="leave-group-btn"
                        >
                          <p>Rời nhóm</p>
                        </Button>
                      </DisbandGroupModal>
                      <Popconfirm
                        description="Bạn có chắc chắn muốn giải tán nhóm không?"
                        onConfirm={confirm}
                        onCancel={cancel}
                        okText="Đồng ý"
                        cancelText="Hủy bỏ"
                        placement="top"
                      >
                        <Button>Giải tán nhóm</Button>
                      </Popconfirm>
                    </div>
                  ) : (
                    <LeaveGroupModal>
                      <Button
                        icon={<i className="fa-solid fa-sign-out"></i>}
                        className="leave-group-btn"
                      >
                        <p>Rời nhóm</p>
                      </Button>
                    </LeaveGroupModal>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      </div>
      <div
        className="bg"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
    </>
  );
};

export default ChatMain;
