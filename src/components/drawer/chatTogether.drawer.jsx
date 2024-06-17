import React, { useState } from 'react';
import { Drawer } from 'antd';
import './chatTogether.drawer.scss';
import ChatUser from '../user/chat.user';
import InforGroupModal from '../modal/infoGroup.modal';

const ChatTogetherDrawer = ({ children, chats }) => {
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <span onClick={showDrawer}>{children}</span>
      <Drawer
        title="Các cuộc trò chuyện chung"
        onClose={onClose}
        open={open}
        getContainer={false}
        className="drawer-chat-together"
      >
        <div className="drawer-chat-together-body">
          {chats &&
            chats.map((item, index) => (
              <div key={index} className="drawer-chat-together-item">
                <div className="drawer-chat-together-item-avatar">
                  <InforGroupModal selectChat={item}>
                    <ChatUser chat={item} />
                  </InforGroupModal>
                </div>
                {/* <div className="drawer-chat-together-item-info">
                                <div className="drawer-chat-together-item-info-name">
                                    {item.name}
                                </div>
                            </div> */}
              </div>
            ))}
        </div>
      </Drawer>
    </>
  );
};

export default ChatTogetherDrawer;
