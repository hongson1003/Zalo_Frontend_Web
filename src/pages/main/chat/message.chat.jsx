import React, { useCallback, useEffect, useRef, useState } from 'react';
import './message.chat.scss';
import { Popover } from 'antd';
import EmoijPopup from './emoijPopup.chat';
import Tym from '../../../components/customize/tym';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import axios from '../../../utils/axios';
import { socket } from '../../../utils/io';
import { MESSAGES, METHOD_MESSAGE } from '../../../redux/types/user.type';
import ForwardModal from '../../../components/modal/forward.modal';
import { sendNotifyToChatRealTime } from '../../../utils/handleChat';
import { toast } from 'react-toastify';

const items = [
  {
    key: METHOD_MESSAGE.COPY,
    item: () => (
      <div className="item-popover-message">
        <i className="fa-regular fa-copy"></i>
        <p>Copy tin nhắn</p>
      </div>
    ),
  },
  {
    key: METHOD_MESSAGE.PIN,
    item: () => (
      <div className="item-popover-message">
        <i className="fa-solid fa-thumbtack"></i>
        <p>Ghim tin nhắn</p>
      </div>
    ),
  },
  {
    key: METHOD_MESSAGE.VIEW_DETAIL,
    item: () => (
      <div className="item-popover-message">
        <i className="fa-solid fa-circle-info"></i>
        <p>Xem chi tiết</p>
      </div>
    ),
  },
  {
    key: METHOD_MESSAGE.DELETE_ALL,
    item: () => (
      <div className="item-popover-message error-item">
        <i className="fa-solid fa-trash-can"></i>
        <p>Thu hồi tin nhắn</p>
      </div>
    ),
  },
  {
    key: METHOD_MESSAGE.DELETE_MYSEFL,
    item: () => (
      <div className="item-popover-message error-item">
        <i className="fa-regular fa-square-minus"></i>
        <p>Xóa chỉ ở phía tôi</p>
      </div>
    ),
  },
];

const content = ({
  optionsRef,
  message,
  handleModifyMessage,
  isDelete,
  fetchChats,
  setOpenPopover,
}) => {
  const contentRef = useRef(null);
  const userState = useSelector((state) => state.userReducer);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);

  const deleteMessage = async (messageId) => {
    try {
      const res = await axios.put('/chat/message/deleteMessage', {
        messageId: messageId,
      });
      if (res.errCode === 0) {
        handleModifyMessage(res.data);
        socket.then((socket) => {
          socket.emit('modify-message', res.data);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMessageMySelf = async (messageId) => {
    try {
      const res = await axios.put('/chat/message/recall', {
        messageId: messageId,
      });
      if (res.errCode === 0) {
        handleModifyMessage(res.data);
        // socket.then(socket => {
        //     socket.emit('modify-message', res.data);
        // })
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      const res = await axios.put('/chat/message/pinMessage', {
        messageId: messageId,
        chat: message.chat,
      });
      if (res.errCode === 0) {
        await sendNotifyToChatRealTime(
          res.data?.chat?._id,
          `${user.userName} đã ghim 1 tin nhắn`,
          MESSAGES.NOTIFY
        );
        socket.then((socket) => {
          socket.emit('pin-message', res.data?.chat?._id);
        });
        userState.fetchMessages();
      }
      setOpenPopover(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setOpenPopover(false);
  };

  const handleOnClick = (Element) => {
    const { key } = Element;
    switch (key) {
      case METHOD_MESSAGE.COPY:
        handleCopy();
        break;
      case METHOD_MESSAGE.PIN:
        handlePinMessage(message._id);
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
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener('mouseover', () => {
        optionsRef.current.classList.add('show-options');
      });
      contentRef.current.addEventListener('mouseleave', () => {
        optionsRef.current.classList.remove('show-options');
      });
    }
  }, []);

  return (
    <div className="subOption" ref={contentRef}>
      {items &&
        items.length > 0 &&
        items.map((Element) => {
          if (Element.key === METHOD_MESSAGE.DELETE_ALL && !isDelete) {
            return null;
          }
          return (
            <div
              className="option-sub-item"
              key={Element.key}
              onClick={() => handleOnClick(Element)}
            >
              <Element.item />
            </div>
          );
        })}
    </div>
  );
};

const MessageChat = ({
  children,
  isLeft,
  message,
  handleModifyMessage,
  isImage,
  handleOnClickReply,
}) => {
  const optionsRef = useRef(null);
  const messageHoverContainerRef = useRef(null);
  const frameTymRef = useRef(null);
  const [selectedReaction, setSelectedReaction] = useState('👌');
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const [allowOpen, setAllowOpen] = useState(true);
  const [enableMouseOver, setEnableMouseOver] = useState(true);
  const [openPopover, setOpenPopover] = useState(false);
  const userState = useSelector((state) => state.userReducer);
  const messageRef = useRef(null);
  const previousReaction = useRef(JSON.stringify(message.reactions));

  useEffect(() => {
    const currentReaction = JSON.stringify(message?.reactions);
    const [objReaction] =
      currentReaction &&
      _.differenceWith(
        JSON.parse(currentReaction),
        JSON.parse(previousReaction.current),
        _.isEqual
      );
    if (!previousReaction.current) return;
    if (previousReaction.current !== currentReaction) {
      if (messageRef.current) {
        setSelectedReaction(objReaction?.icon || '👌');
        frameTymRef.current.classList.add('show-frame-tym');
        messageRef.current.classList.add('active');
        setTimeout(() => {
          messageRef.current.classList.remove('active');
        }, 1000);
      }
    }

    previousReaction.current = JSON.stringify(message.reactions);
  }, [message]);

  useEffect(() => {
    const addShowOptions = () => {
      optionsRef.current.classList.add('show-options');
    };
    const removeShowOptions = () => {
      optionsRef.current.classList.remove('show-options');
    };

    const addShowFrameTym = () => {
      frameTymRef.current.classList.add('show-frame-tym');
      if (enableMouseOver) {
        setAllowOpen(true);
      }
    };

    const removeShowFrameTym = (e) => {
      if (
        !(
          e.toElement?.className === 'emoij-popup-container' ||
          e.toElement?.className === 'reaction' ||
          e.toElement?.className === 'tym-message' ||
          e.toElement?.className === 'tym-icon-123 active' ||
          e.toElement?.className === 'tym-icon-123' ||
          e.toElement?.className === 'tym-main-container-xyz' ||
          e.toElement?.className === 'tyms-frame' ||
          e.toElement?.className === 'tyms-heart'
        )
      ) {
        frameTymRef.current.classList.remove('show-frame-tym');
        setAllowOpen(false);
      }
    };

    if (messageHoverContainerRef.current && frameTymRef.current) {
      messageHoverContainerRef.current.addEventListener(
        'mouseover',
        addShowOptions
      );
      messageHoverContainerRef.current.addEventListener(
        'mouseleave',
        removeShowOptions
      );
      messageHoverContainerRef.current.addEventListener(
        'mouseover',
        addShowFrameTym
      );
      messageHoverContainerRef.current.addEventListener(
        'mouseleave',
        removeShowFrameTym
      );
    }

    return () => {
      if (messageHoverContainerRef.current && frameTymRef.current) {
        messageHoverContainerRef.current.removeEventListener(
          'mouseover',
          addShowOptions
        );
        messageHoverContainerRef.current.removeEventListener(
          'mouseleave',
          removeShowOptions
        );
        messageHoverContainerRef.current.removeEventListener(
          'mouseover',
          addShowFrameTym
        );
        messageHoverContainerRef.current.removeEventListener(
          'mouseleave',
          removeShowFrameTym
        );
      }
    };
  }, [enableMouseOver]);

  const handleAllowOpen = useCallback(
    _.debounce((value) => {
      setAllowOpen(value);
      setEnableMouseOver(value);
    }, 500),
    []
  );

  const handleSendReaction = async (messageId, userId, icon) => {
    try {
      const res = await axios.post('/chat/feeling', {
        messageId,
        userId,
        icon,
      });
      if (res.errCode === 0) {
        socket.then((socket) => {
          socket.emit('send-reaction', res.data);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTymMessage = async (icon) => {
    setAllowOpen(false);
    setEnableMouseOver(false);
    handleAllowOpen(true);
    const newMessage = { ...message };
    const arrayReaction = newMessage?.reactions || [];
    const reactionExists = arrayReaction.find(
      (reaction) => reaction.userId === user.id && reaction.icon === icon
    );
    if (!reactionExists) {
      arrayReaction.push({
        userId: user.id,
        icon: icon,
        count: 1,
      });
    } else {
      arrayReaction.forEach((reaction) => {
        if (reaction.userId === user.id && reaction.icon === icon) {
          reaction.count += 1;
        }
      });
    }
    newMessage.reactions = arrayReaction;
    handleModifyMessage(newMessage);
    await handleSendReaction(newMessage._id, user.id, icon);
  };

  const handleOnContextMenu = (e) => {
    e.preventDefault();
    setOpenPopover(true);
  };

  return (
    <React.Fragment>
      <div className="group-message-hover-container">
        {message.reply && (
          <div className="message-reply">
            <p className="reply-name">{message.reply.sender.userName}</p>
            {/* handle content */}
            {message.reply.type === MESSAGES.TEXT ? (
              <p className="message-reply-content">{message.reply.content}</p>
            ) : message.reply.type === MESSAGES.IMAGES ? (
              <img src={message.reply.urls[0]} alt="image" />
            ) : message.reply.type === MESSAGES.VIDEO ? (
              <video src={message.reply.urls[0]} controls></video>
            ) : message.reply.type === MESSAGES.FILE_FOLDER ? (
              <p>{message.reply.files[0].name}</p>
            ) : message.reply.type === MESSAGES.AUDIO ? (
              <audio src={message.reply.urls[0]} controls></audio>
            ) : message.reply.type === MESSAGES.STICKER ? (
              <img
                className="sticker-reply"
                src={message.reply.sticker}
                alt="sticker"
              />
            ) : null // handle file // handle video
            }
          </div>
        )}
        <span
          className={
            isLeft
              ? `message-hover-container option-right ${isImage && 'w-500'}`
              : `message-hover-container option-left ${isImage && 'w-500'}`
          }
          ref={messageHoverContainerRef}
          onContextMenu={handleOnContextMenu}
        >
          {children}
          <div className="options" ref={optionsRef}>
            <div className="options-content">
              <div
                className="option-item"
                onClick={() => handleOnClickReply(message)}
              >
                <i title="Trả lời" className="fa-solid fa-reply"></i>
              </div>
              <ForwardModal message={message}>
                <div className="option-item">
                  <i title="Chuyển tiếp" className="fa-solid fa-share"></i>
                </div>
              </ForwardModal>
              <Popover
                content={React.createElement(content, {
                  optionsRef,
                  message,
                  handleModifyMessage,
                  isDelete: !isLeft,
                  fetchChats: userState.fetchChats,
                  setOpenPopover,
                })}
                trigger={'hover'}
                placement="topRight"
                className="popover-options"
                forceRender
                onOpenChange={(visible) => {
                  if (!visible) {
                    setOpenPopover(false);
                  }
                }}
                open={openPopover}
              >
                <div
                  className="option-item"
                  onClick={() => setOpenPopover((prev) => !prev)}
                >
                  <i title="Thêm" className="fa-solid fa-ellipsis"></i>
                </div>
              </Popover>
            </div>
          </div>

          {message?.reactions?.length > 0 && (
            <div className="reactions">
              {
                // customize reaction with reaction.icon unique
                message?.reactions &&
                  message?.reactions
                    .filter((reaction, index) => {
                      const icon = reaction.icon;
                      return (
                        message?.reactions.findIndex(
                          (reaction) => reaction.icon === icon
                        ) === index
                      );
                    })
                    .map((reaction, index) => {
                      if (index < 3) {
                        return (
                          <span
                            className="reaction-item"
                            key={reaction.userId + reaction.icon}
                          >
                            {reaction?.icon}
                          </span>
                        );
                      }
                    })
              }
              {message?.reactions?.length > 0 && (
                <span>
                  {message?.reactions?.reduce((partialSum, a) => {
                    return partialSum + a.count;
                  }, 0)}
                </span>
              )}
            </div>
          )}

          <div className="frame-tym" ref={frameTymRef}>
            <EmoijPopup
              placement={isLeft ? 'top' : 'topRight'}
              setSelectedReaction={setSelectedReaction}
              handleTymMessage={handleTymMessage}
              allowOpen={allowOpen}
              message={message}
              handleModifyMessage={handleModifyMessage}
            >
              <div
                className="tym-message"
                onClick={() => handleTymMessage(selectedReaction.trim())}
              >
                {/* <i className="fa-regular fa-thumbs-up reaction-icon"></i> */}
                <Tym icon={selectedReaction} messageRef={messageRef} />
              </div>
            </EmoijPopup>
          </div>
        </span>
      </div>
    </React.Fragment>
  );
};

export default MessageChat;
