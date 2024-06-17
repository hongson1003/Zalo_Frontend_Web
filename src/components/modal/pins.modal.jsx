import React, { useState } from 'react';
import { Modal } from 'antd';
import './pins.modal.scss';
import { MESSAGES } from '../../redux/types/user.type';
import axios from '../../utils/axios';
import { socket } from '../../utils/io';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const PinsModal = ({
  children,
  data,
  handleFindMessageFirst,
  fetchChats,
  fetchMessagePaginate,
}) => {
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOnClickUnpin = async (message) => {
    try {
      const res = await axios.put('/chat/message/unPinMessage', {
        messageId: message._id,
      });
      if (res.errCode === 0) {
        const notifyRes = await sendNotifyToChatRealTime(
          res.data?.chat?._id,
          `${user.userName} đã bỏ ghim 1 tin nhắn`,
          MESSAGES.NOTIFY
        );
        socket.then((socket) => {
          socket.emit('pin-message', res.data?.chat?._id);
        });
        fetchMessagePaginate();
        handleOk();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Tin nhắn đã ghim"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        forceRender
        destroyOnClose={true}
      >
        <div className="pined-modal">
          {data &&
            data.length > 0 &&
            data.map((message) => {
              return (
                <div key={message._id} className="pined-message">
                  <p>{message?.sender?.userName}:</p>
                  <p
                    className="pined-item-content"
                    onClick={() => {
                      handleFindMessageFirst(message.ref);
                      handleOk();
                    }}
                  >
                    {message?.type === MESSAGES.TEXT
                      ? message?.content
                      : message?.type === MESSAGES.IMAGES
                      ? 'Đã gửi ảnh'
                      : message?.type === MESSAGES.FILE_FOLDER
                      ? 'Đã gửi file'
                      : message?.type === MESSAGES.VIDEO
                      ? 'Đã gửi video'
                      : message?.type === MESSAGES.STICKER
                      ? 'Đã gửi sticker'
                      : ''}
                  </p>

                  <p className="unpin-item">
                    <i
                      className="fa-solid fa-delete-left unpin"
                      onClick={() => handleOnClickUnpin(message)}
                    ></i>
                  </p>
                </div>
              );
            })}
        </div>
      </Modal>
    </div>
  );
};

export default PinsModal;
