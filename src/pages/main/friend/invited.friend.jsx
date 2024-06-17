import React, { useEffect } from 'react';
import './invited.friend.scss';
import { Flex, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { items } from '../../sidebar/friend.sidebar';
import InvitedUser from '../../../components/user/invited.user';
import axios from '../../../utils/axios';
import { socket } from '../../../utils/io';
import { toast } from 'react-toastify';

const headerData = items[2];
const options = [
  {
    value: 'received',
    label: <span>Đã nhận</span>,
  },
  {
    value: 'sent',
    label: <span>Đã gửi</span>,
  },
];

const InvitedFriend = () => {
  const stateUser = useSelector((state) => state?.userReducer);
  const [invitedFriends, setInvitedFriends] = React.useState([]);
  const [optionValue, setOptionValue] = React.useState('received');

  const handleNeedAcceptAddFriend = (data) => {
    fetchInvitedFriends();
  };

  useEffect(() => {
    socket.then((socket) => {
      socket.on('need-accept-addFriend', handleNeedAcceptAddFriend);
    });
    return () => {
      socket.then((socket) => {
        socket.off('need-accept-addFriend', handleNeedAcceptAddFriend);
      });
    };
  }, []);

  useEffect(() => {
    if (stateUser.fetchNotificationsFriends) {
      const ids = stateUser.notificationsFriends.map((item) => item?.id);
      handleReadNotifications(ids);
    }
  }, [stateUser.fetchNotificationsFriends]);

  useEffect(() => {
    if (optionValue === 'received') {
      fetchInvitedFriends();
    } else {
      fetchSentInvitedFriends();
    }
  }, [optionValue]);

  const handleReadNotifications = async (ids) => {
    try {
      await axios.post('/users/notifications/friendShip', { ids });
      stateUser.fetchNotificationsFriends();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchInvitedFriends = async () => {
    try {
      const res = await axios.get(`/users/notifications/friendShip/invited`);
      if (res.errCode === 0) {
        setInvitedFriends(res?.data);
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSentInvitedFriends = async () => {
    try {
      const res = await axios.get(
        '/users/notifications/friendShip/sentInvited'
      );
      if (res.errCode === 0) {
        setInvitedFriends(res?.data);
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onChange = (value) => {
    setOptionValue(value);
  };

  return (
    <div className="invited-container friend-ultils-container">
      <header>
        <p className="header-left">
          <span className="icon">{headerData.icon}</span>
          <span className="label">{headerData.label}</span>
        </p>
        <Select
          onChange={onChange}
          className="header-right select-invited"
          defaultValue={optionValue}
        >
          {options.map((item) => {
            return (
              <Select.Option key={item?.value} value={item?.value}>
                {item?.label}
              </Select.Option>
            );
          })}
        </Select>
      </header>
      <div className="invited-body">
        {invitedFriends.length <= 0 ? (
          <div className="not-found">
            <i className="fa-regular fa-envelope-open"></i>
            <p>Bạn không có lời mời nào</p>
          </div>
        ) : (
          <div className="list-invited-friends">
            {invitedFriends.map((item) => {
              return (
                <InvitedUser
                  key={item?.id}
                  user={
                    item?.friendShip[
                      optionValue === 'received' ? 'sender' : 'receiver'
                    ]
                  }
                  content={item?.content}
                  date={item?.updatedAt}
                  fetchInvitedFriends={fetchInvitedFriends}
                  fetchSentInvitedFriends={fetchSentInvitedFriends}
                  isReceived={optionValue === 'received'}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitedFriend;
