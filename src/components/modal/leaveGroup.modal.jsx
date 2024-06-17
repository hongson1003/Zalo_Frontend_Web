import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../utils/axios';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { accessChat } from '../../redux/actions/user.action';
import { socket } from '../../utils/io';
import { MESSAGES } from '../../redux/types/user.type';
import { toast } from 'react-toastify';
const LeaveGroupModal = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chat = useSelector((state) => state.appReducer?.subNav);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const stateUser = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    try {
      const res = await axios.put('/chat/group/out', {
        chatId: chat._id,
      });
      if (res.errCode === 0) {
        toast.warn('Rời nhóm thành công');
        await sendNotifyToChatRealTime(
          chat._id,
          `${user.userName} đã rời nhóm`,
          MESSAGES.NOTIFY
        );
        socket.then((socket) => {
          socket.emit('leave-group', { chatId: chat._id, userId: user.id });
        });
        dispatch(accessChat(null));
        stateUser.fetchChats();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      toast.error('Rời nhóm thất bại');
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Xác nhận"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" type="primary" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" danger onClick={handleOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn rời nhóm, mọi tin nhắn sẽ bị xóa</p>
      </Modal>
    </>
  );
};

export default LeaveGroupModal;
