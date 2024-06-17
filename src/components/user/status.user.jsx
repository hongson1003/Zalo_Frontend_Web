import React, { useEffect, useState } from 'react';
import AvatarUser from './avatar';
import './status.user.scss';
import InforUserModal from '../modal/inforUser.modal';
import { CHAT_STATUS } from '../../redux/types/user.type';
import InfoGroupModal from '../modal/infoGroup.modal';
import { getDetailListMembers, getFriend } from '../../utils/handleChat';
import { useSelector } from 'react-redux';
import axios from '../../utils/axios';
import { socket } from '../../utils/io';
import { accessTimeBefore } from '../../utils/handleUltils';
import { toast } from 'react-toastify';

const StatusUser = ({ chat }) => {
  const user = useSelector((state) => state.appReducer.userInfo.user);
  const [friendShipData, setFriendShipData] = useState(null);
  const [statusUser, setStatusUser] = useState(null);

  const fetchFriendShip = async (userId) => {
    try {
      const res = await axios.get(`/users/friendShip?userId=${userId}`);
      if (res.errCode === 0) {
        setFriendShipData(res.data);
      }
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi xảy ra khi lấy thông tin bạn bè');
    }
  };

  useEffect(() => {
    const friendId = getFriend(user, chat.participants)?.id;
    if (chat && friendId) {
      fetchFriendShip(friendId);
    }
  }, []);

  useEffect(() => {
    if (chat) {
      setStatusUser(getFriend(user, chat.participants));
    }
  }, [chat]);

  useEffect(() => {
    if (statusUser) {
      socket.then((socket) => {
        socket.on('online', (data) => {
          if (data === statusUser.id) {
            setStatusUser({
              ...statusUser,
              lastedOnline: null,
            });
          }
        });
        socket.on('offline', (data) => {
          if (data === statusUser.id) {
            setStatusUser({
              ...statusUser,
              lastedOnline: new Date(),
            });
          }
        });
      });
    }
    return () => {
      socket.then((socket) => {
        socket.off('online');
        socket.off('offline');
      });
    };
  }, [statusUser]);

  return (
    <div className="status-user-container">
      {chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
        <InforUserModal
          friendData={getFriend(user, chat.participants)}
          type={'button'}
          friendShipData={friendShipData}
          refuseAction
        >
          <AvatarUser
            image={getFriend(user, chat.participants)?.avatar}
            size={50}
            name={getFriend(user, chat.participants)?.userName}
            isOnline={statusUser?.lastedOnline === null ? true : false}
          />
        </InforUserModal>
      ) : (
        <InfoGroupModal>
          {chat?.groupPhoto ? (
            <AvatarUser image={chat?.groupPhoto} size={50} name={chat?.name} />
          ) : (
            <div className="avatar-group">
              {chat?.participants?.length > 0 &&
                chat?.participants?.map((item) => {
                  return (
                    <React.Fragment key={item.id}>
                      <AvatarUser
                        image={item.avatar}
                        size={25}
                        name={getFriend(user, chat.participants)?.userName}
                      />
                    </React.Fragment>
                  );
                })}
            </div>
          )}
        </InfoGroupModal>
      )}
      <div className="status">
        {chat?.type === CHAT_STATUS.GROUP_CHAT ? (
          <>
            <p className="username">{chat?.name}</p>
            <p className="connected-time">
              <span>
                <i className="fa-regular fa-user"></i>
              </span>
              <span>
                {getDetailListMembers(chat?.participants).total} thành viên
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="username">
              {getFriend(user, chat?.participants)?.userName}
            </p>
            <p className="connected-time">
              {statusUser?.lastedOnline === null
                ? 'Đang hoạt động'
                : accessTimeBefore(statusUser?.lastedOnline)}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusUser;
