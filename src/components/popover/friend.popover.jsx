import React from 'react';
import { Button, Popover } from 'antd';
import './friend.popover.scss';
import InforUserModal from '../modal/inforUser.modal';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const FriendPopover = ({ children, user, fetchFriends }) => {
  const handleBlockUser = () => {
    toast.warn('Chức năng chặn người dùng đang được phát triển!');
  };

  const handleDeleteFriend = async () => {
    try {
      const res = await axios.put('/users/friendShip/unfriend', {
        userId: user.id,
      });
      if (res.errCode === 0) {
        toast.success(`Đã xóa ${user.userName} khỏi danh sách bạn bè!`);
      } else {
        toast.warn('Có lỗi xảy ra, vui lòng thử lại sau!');
      }
      fetchFriends();
    } catch (error) {
      console.log('Error at handleDeleteFriend', error);
      toast.warn('Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };

  return (
    <Popover
      content={
        <div className="friend-popover-content">
          <InforUserModal
            friendData={user}
            readOnly
            refuseAction
            type={'button'}
          >
            <p>Xem thông tin</p>
          </InforUserModal>
          <p onClick={handleBlockUser}>Chặn người này</p>
          <p onClick={handleDeleteFriend}>Xóa bạn</p>
        </div>
      }
      trigger={['click']}
      placement="topLeft"
    >
      {children}
    </Popover>
  );
};

export default FriendPopover;
