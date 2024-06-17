import React, { useEffect, useState } from 'react';
import AvatarUser from './avatar';
import { Button, Flex } from 'antd';
import './invited.user.scss';
import moment from 'moment';
import InforUserModal from '../modal/inforUser.modal';
import axios from '../../utils/axios';
import { socket } from '../../utils/io';
import { useSelector } from 'react-redux';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { CHAT_STATUS, MESSAGES } from '../../redux/types/user.type';
import { toast } from 'react-toastify';

const InvitedUser = ({
  user,
  content,
  date,
  fetchInvitedFriends,
  fetchSentInvitedFriends,
  isReceived,
}) => {
  const me = useSelector((state) => state.appReducer.userInfo.user);

  const handleResolve = async () => {
    try {
      const res = await axios.put('/users/friendShip', { userId: user.id });
      if (res.errCode === 0) {
        toast.success('Đã thêm bạn bè thành công');
        const resChat = await axios.post('/chat/access', {
          type: CHAT_STATUS.PRIVATE_CHAT,
          participants: [me.id, user.id],
          seenBy: [me.id, user.id],
        });
        if (resChat.errCode === 0 || resChat.errCode === 2) {
          await sendNotifyToChatRealTime(
            resChat.data._id,
            'Hai bạn đã trở thành bạn bè, hãy nhắn tin cho nhau để hiểu rõ nhau hơn ╮ (. ❛ ᴗ ❛.) ╭',
            MESSAGES.NEW_FRIEND
          );
          socket.then((socket) => {
            socket.emit('join-room', resChat.data._id);
            socket.emit('new-chat', resChat.data);
          });
        }
        await fetchInvitedFriends();
      } else {
        toast.warn('Đồng ý thất bại');
        fetchInvitedFriends();
      }
    } catch (error) {
      toast.warn('Đồng ý thất bại');
      fetchInvitedFriends();
    }
  };

  const handleReject = async () => {
    try {
      const res = await axios.put('/users/friendShip/reject', {
        userId: user.id,
      });
      if (res.errCode === 0) {
        await fetchInvitedFriends();
      } else {
        toast.warn('Từ chối thất bại');
        fetchInvitedFriends();
      }
    } catch (error) {
      console.log(error);
      toast.warn('Từ chối thất bại');
      fetchInvitedFriends();
    }
  };

  const handleRecallInvited = async () => {
    try {
      const res = await axios.post('/users/friendShip', {
        userId: user?.id,
        content: 'Thu hồi lời mời kết bạn',
      });
      if (res.errCode === 3) {
        await fetchSentInvitedFriends();
      }
    } catch (error) {
      console.log(error);
      fetchSentInvitedFriends();
      toast.warn('Thu hồi thất bại');
    }
  };

  return (
    <Flex vertical className="invited-user-container">
      <div className="top">
        <InforUserModal friendData={user} type={'button'} readOnly refuseAction>
          <AvatarUser image={user.avatar} name={user.userName} size={50} />
        </InforUserModal>
        <div className="description">
          <p className="username">{user.userName}</p>
          <p className="date">{moment(date).format('DD/MM')}</p>
          <textarea
            className="content"
            defaultValue={content}
            readOnly
          ></textarea>
        </div>
      </div>
      <div className="footer">
        {isReceived ? (
          <>
            <Button type="default" onClick={handleResolve}>
              Đồng ý
            </Button>
            <Button type="default" onClick={handleReject}>
              Từ chối
            </Button>
          </>
        ) : (
          <Button type="default" onClick={handleRecallInvited}>
            Thu hồi lời mời
          </Button>
        )}
      </div>
    </Flex>
  );
};

export default InvitedUser;
