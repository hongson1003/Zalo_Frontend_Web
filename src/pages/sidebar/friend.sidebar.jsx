import React, { useEffect, useLayoutEffect, useState } from 'react';
import { TeamOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useDispatch } from 'react-redux';
import { changeKeySubMenu } from '../../redux/actions/app.action';

export const FRIEND_ITEM_MENU = {
  LIST_FRIENDS: 'LIST_FRIENDS',
  LIST_GROUP: 'LIST_GROUP',
  INVITE_FRIEND: 'INVITE_FRIEND',
};

export const items = [
  {
    label: 'Danh sách bạn bè',
    key: FRIEND_ITEM_MENU.LIST_FRIENDS,
    icon: <i className="fa-regular fa-user"></i>,
  },
  {
    label: 'Danh sách nhóm',
    key: FRIEND_ITEM_MENU.LIST_GROUP,
    icon: <TeamOutlined />,
  },
  {
    label: 'Lời mời kết bạn',
    key: FRIEND_ITEM_MENU.INVITE_FRIEND,
    icon: <i className="fa-regular fa-envelope-open"></i>,
  },
];

const FriendSideBar = () => {
  const [current, setCurrent] = useState(FRIEND_ITEM_MENU.LIST_FRIENDS);
  const dispatch = useDispatch();

  const [windowSize, setWindowSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setWindowSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const onClick = (e) => {
    setCurrent(e.key);
    dispatch(changeKeySubMenu(e.key));
  };

  useEffect(() => {
    if (windowSize[0] < 768) {
      setCurrent('');
    } else {
      dispatch(changeKeySubMenu(FRIEND_ITEM_MENU.LIST_FRIENDS));
      setCurrent(FRIEND_ITEM_MENU.LIST_FRIENDS);
    }
  }, [windowSize[0]]);

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="vertical"
      items={items}
      style={{ fontSize: 'calc(8px + 0.5vw)' }}
    />
  );
};

export default FriendSideBar;
