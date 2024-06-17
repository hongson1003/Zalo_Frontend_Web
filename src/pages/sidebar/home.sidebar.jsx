import React, { useEffect, useState } from 'react';
import SearchMessage from './home.message.search';
import './home.message.sidebar.scss';
import { useSelector } from 'react-redux';
import { KEYITEMS } from '../../utils/keyMenuItem';
import FriendSideBar from './friend.sidebar';
import ChatSidebar from './chat.sidebar';
import { FILTER } from '../../redux/types/user.type';

const SidebarHome = ({ children }) => {
  const stateApp = useSelector((state) => state?.appReducer);
  const [current, setCurrent] = useState(FILTER.EMPTY);
  const [statusChat, setStatusChat] = useState(FILTER.ALL);

  const renderContent = () => {
    switch (stateApp?.nav) {
      case KEYITEMS.PHONEBOOK:
        return <FriendSideBar />;
      case KEYITEMS.MESSAGE:
        return (
          <ChatSidebar
            current={current}
            statusChat={statusChat}
            setStatusChat={setStatusChat}
          />
        );
      default:
        return (
          <ChatSidebar
            current={current}
            statusChat={statusChat}
            setStatusChat={setStatusChat}
          />
        );
    }
  };

  return (
    <div className="sidebar-home">
      <SearchMessage
        current={current}
        setCurrent={setCurrent}
        setStatusChat={setStatusChat}
        statusChat={statusChat}
      />
      {renderContent()}
    </div>
  );
};

export default SidebarHome;
