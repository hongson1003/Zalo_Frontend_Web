import React, { useState } from 'react';
import { Button, Modal, Popconfirm } from 'antd';
import './grant.modal.scss';
import AvatarUser from '../user/avatar';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../utils/axios';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { editGroup } from '../../redux/actions/app.action';
import { socket } from '../../utils/io';
import { MESSAGES } from '../../redux/types/user.type';
import { toast } from 'react-toastify';

const GrantModal = ({ children, chat }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    try {
      setIsLoading(true);
      const res = await axios.put('/chat/group/grant', {
        chatId: chat._id,
        memberId: selected.id,
      });

      await sendNotifyToChatRealTime(
        chat._id,
        `🎉 ${selected.userName} đã trở thành trưởng nhóm 🎉`,
        MESSAGES.NOTIFY
      );
      if (res.errCode === 0) {
        dispatch(editGroup(res.data));
        socket.then((socket) => {
          socket.emit('grant', res.data);
        });
      }
      setIsLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to grant leader:', error);
      setIsLoading(false);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };
  const handleCancel = () => {
    setSelected(null);
    setIsModalOpen(false);
  };

  const handleGrantLeader = async (item) => {
    setSelected(item);
  };

  const confirm = (e) => {
    handleOk();
  };
  const cancel = (e) => {
    handleCancel();
  };

  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Chuyển quyền trưởng nhóm"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Popconfirm
            description="Bạn có chắc chắn muốn chuyển quyền trưởng nhóm?"
            onConfirm={confirm}
            onCancel={cancel}
            okText="Xác nhận"
            cancelText="Hủy"
            key="submit"
          >
            <Button disabled={!selected} type="primary" loading={isLoading}>
              Chuyển nhượng
            </Button>
          </Popconfirm>,
        ]}
      >
        <div className="grant-modal-container">
          <div className="note">
            Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý
            nhóm. Bạn sẽ mất quyền quản lý nhưng vẫn là một thành viên của nhóm.
            Hành động này không thể khôi phục.
          </div>
          <div className="main-content">
            {chat?.participants?.map((item, index) => {
              if (user?.id !== item.id) {
                return (
                  <div
                    key={index}
                    className={`group-user ${
                      selected?.id === item.id ? 'selected' : ''
                    }`}
                    onClick={() => handleGrantLeader(item)}
                  >
                    <AvatarUser image={item?.avatar} name={item?.userName} />
                    <p className="name">{item?.userName}</p>
                  </div>
                );
              } else return null;
            })}
          </div>
        </div>
      </Modal>
    </>
  );
};
export default GrantModal;
