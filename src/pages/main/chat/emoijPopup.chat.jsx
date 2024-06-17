import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, message } from 'antd';
import './emoijPopup.chat.scss';
import _ from 'lodash';
import Tym from '../../../components/customize/tym';
import axios from '../../../utils/axios';
import { toast } from 'react-toastify';

const Content = ({
  setSelectedReaction,
  handleTymMessage,
  setOpen,
  message,
  handleModifyMessage,
}) => {
  const emoijContainerRef = useRef(null);
  const reactions = [
    { name: 'like', icon: '👍' },
    { name: 'tym', icon: '❤️' },
    { name: 'haha', icon: '😂' },
    { name: 'bốc cứt', icon: '💩' }, // Thay thế "bỡ ngỡ" bằng biểu tượng "bốc cứt"
    { name: 'khóc', icon: '😢' },
    { name: 'tức giận', icon: '😡' },
    { name: 'Clear', icon: '✖' },
  ];

  const handleGetReaction = (reaction) => {
    setSelectedReaction(reaction.icon);
    handleTymMessage(String(reaction.icon).trim());
    setOpen(false);
  };

  useEffect(() => {
    if (emoijContainerRef.current) {
      emoijContainerRef.current.addEventListener('mouseleave', () => {
        setOpen(false);
      });
    }
  }, []);

  const handleClearReaction = async () => {
    try {
      if (!message || message.reactions.length === 0) return;
      const res = await axios.put('/chat/feeling', {
        messageId: message._id,
      });
      const messageData = res.data;
      if (res.errCode === 0) {
        setOpen(false);
        handleModifyMessage({
          _id: messageData._id,
          reactions: messageData.reactions,
        });
      }
    } catch (error) {
      console.log('Error at handleClearReaction', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };

  return (
    <div className="emoij-popup-container" ref={emoijContainerRef}>
      {reactions.map((reaction, index) => {
        if (reactions?.length - 1 !== index) {
          return (
            <Tym
              key={reaction.name}
              icon={
                <span
                  key={index}
                  className="reaction"
                  onClick={() => handleGetReaction(reaction)}
                >
                  {reaction.icon}
                </span>
              }
            />
          );
        } else {
          return (
            <span
              key={reaction.name}
              className="reaction"
              onClick={() => handleClearReaction()}
            >
              {reaction.icon}
            </span>
          );
        }
      })}
    </div>
  );
};

const EmoijPopup = ({
  children,
  placement,
  setSelectedReaction,
  handleTymMessage,
  allowOpen,
  message,
  handleModifyMessage,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen) => {
    if (allowOpen && newOpen) {
      setOpen(newOpen);
    }
  };

  return (
    <Popover
      content={React.createElement(Content, {
        setSelectedReaction,
        handleTymMessage,
        setOpen,
        message,
        handleModifyMessage,
      })}
      trigger={'hover'}
      open={open && allowOpen}
      onOpenChange={handleOpenChange}
      placement={placement}
      overlayClassName="popover-emoij"
      mouseLeaveDelay={0.2}
    >
      {children}
    </Popover>
  );
};

export default EmoijPopup;
