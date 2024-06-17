import React, { useEffect } from 'react';
import AvatarUser from '../../../components/user/avatar';
import { useSelector, useDispatch } from 'react-redux';
import './listFriends.friends.scss';
import axios from '../../../utils/axios';
import { accessChat } from '../../../redux/actions/user.action';
import { changeKeyMenu } from '../../../redux/actions/app.action';
import { KEYITEMS } from '../../../utils/keyMenuItem';
import { STATE } from '../../../redux/types/app.type';
import FriendPopover from '../../../components/popover/friend.popover';
import { toast } from 'react-toastify';

const ListFriends = ({ data, fetchFriends }) => {
  const [friends, setFriends] = React.useState([]);
  const stateApp = useSelector((state) => state.appReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.length > 0) {
      const newData = data?.map((item) => {
        let user = null;
        if (stateApp.userInfo.user.id === item.sender.id) user = item.receiver;
        else user = item.sender;
        return user;
      });
      setFriends(newData);
    }
  }, [data]);

  const handleOpenChat = async (friendId) => {
    try {
      const res = await axios.post('/chat/access', {
        type: 'PRIVATE_CHAT',
        participants: [stateApp.userInfo.user.id, friendId],
        status: true,
      });
      if (res.errCode !== -1) {
        dispatch(changeKeyMenu(KEYITEMS.MESSAGE));
        dispatch(accessChat(res.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="friends-list">
      {friends.map((item, index) => (
        <div key={index} className="friend-item">
          <div
            className="friend-item-left"
            onClick={() => handleOpenChat(item.id)}
          >
            <AvatarUser
              image={item.avatar}
              name={item.userName}
              size={50}
              zoom
            />
            <span className="name">{item.userName}</span>
          </div>
          <div className="friend-item-right">
            <FriendPopover user={item} fetchFriends={fetchFriends}>
              <i className="fa-solid fa-ellipsis"></i>
            </FriendPopover>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListFriends;
