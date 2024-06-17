import { Button, Flex, Input, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { PhoneOutlined } from '@ant-design/icons';
import './addFriend.modal.scss';
import axios from '../../utils/axios';
import InforUserModal from './inforUser.modal';
import { toast } from 'react-toastify';

const AddFriendModal = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friendData, setFriendData] = useState(null);
  const [friendShipData, setFriendShipData] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    // validate phone number
    if (phoneNumber.length <= 8) {
      toast.warn('Số điện thoại không hợp lệ');
      return false;
    }
    const res = await axios.get(`/users/detail?phoneNumber=${phoneNumber}`);
    if (res.errCode === 0) {
      setFriendData(res.data);
      fetchFriendShip(res?.data?.id);
      handleCancel();
      return true;
    } else {
      toast.warn('Không tìm thấy người dùng');
      return false;
    }
  };

  const fetchFriendShip = async (userId) => {
    const res = await axios.get(`/users/friendShip?userId=${userId}`);
    if (res.errCode === 0) {
      setFriendShipData(res.data);
    } else {
      setFriendShipData(null);
    }
  };

  useEffect(() => {
    if (friendData) {
      setIsModalOpen(false);
    }
  }, [friendData]);

  const renderFooter = () => {
    return (
      <Flex justify="flex-end" gap={10}>
        <Button className="warning" onClick={handleCancel}>
          Hủy bỏ
        </Button>
        <InforUserModal
          friendData={friendData}
          friendShipData={friendShipData}
          type={'button'}
          fetchFriendShip={fetchFriendShip}
          readOnly
        >
          <Button type="primary" onClick={handleOk}>
            Tìm kiếm
          </Button>
        </InforUserModal>
      </Flex>
    );
  };

  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Thêm bạn"
        open={isModalOpen}
        size="small"
        styles={{ padding: '50px' }}
        onOk={handleOk}
        onCancel={handleCancel}
        className="modal-add-friend"
        footer={renderFooter()}
        forceRender
      >
        {/* <Input style={{ gap: '5px' }} prefix={<PhoneOutlined className="site-form-item-icon" />}
                    placeholder="Số điện thoại" onChange={(e) => setPhoneNumber(e.target.value)}
                /> */}
        <InforUserModal
          friendData={friendData}
          friendShipData={friendShipData}
          type={'input'}
          handleOk={handleOk}
          fetchFriendShip={fetchFriendShip}
          readOnly
        >
          <Input
            style={{ gap: '5px' }}
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            placeholder="Số điện thoại"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </InforUserModal>
      </Modal>
    </>
  );
};

export default AddFriendModal;
