import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Welcome from './main.welcome';
import ChatMain from '../main/chat/chat.main';
import ReactLoading from 'react-loading';
import { KEYITEMS } from '../../utils/keyMenuItem';
import { FRIEND_ITEM_MENU } from '../sidebar/friend.sidebar';
import InvitedFriend from './friend/invited.friend';
import ListFriend from './friend/list.friend';
import GroupFriend from './friend/group.friend';
import { STATE } from '../../redux/types/app.type';
import DragDrop from '../../components/customize/dropImage';

const ContentMain = ({ drawerMethods }) => {
  const [isLoading, setIsLoading] = useState(false);
  const stateUser = useSelector((state) => state?.userReducer);
  const stateApp = useSelector((state) => state?.appReducer);

  useEffect(() => {
    setIsLoading(true);
    const clock = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => {
      clearTimeout(clock);
    };
  }, []);

  const getRightSplitPane = () => {
    const nav = stateApp?.nav;
    const subNav = stateApp?.subNav;
    if (nav) {
      switch (nav) {
        case stateUser?.selectedChat && KEYITEMS.MESSAGE:
          return (
            <DragDrop>
              <ChatMain drawerMethods={drawerMethods} />
            </DragDrop>
          );
        case 'pb':
          switch (subNav) {
            case FRIEND_ITEM_MENU.INVITE_FRIEND:
              return <InvitedFriend />;
            case FRIEND_ITEM_MENU.LIST_FRIENDS:
              return <ListFriend />;
            case FRIEND_ITEM_MENU.LIST_GROUP:
              return <GroupFriend />;
            default:
              return <></>;
          }
        case 'ms':
          if (subNav?.key === STATE.ACCESS_CHAT) {
            return (
              <DragDrop fileTypes={['JPG', 'PNG', 'GIF']}>
                <ChatMain drawerMethods={drawerMethods} />
              </DragDrop>
            );
          }
        default:
          return <Welcome />;
      }
    }
    return <Welcome />;
  };

  return (
    <div
      className="content-main-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <ReactLoading
          type={'spokes'}
          color="#1A70FF"
          height={'100px'}
          width={'100px'}
        />
      ) : (
        getRightSplitPane()
      )}
    </div>
  );
};

export default ContentMain;
