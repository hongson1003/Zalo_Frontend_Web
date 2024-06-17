import React, { useEffect, useState } from 'react';
import AvatarUser from './avatar';
import { useDispatch, useSelector } from 'react-redux';
import './chat.user.scss';
import { accessChat } from '../../redux/actions/user.action';
import { CHAT_STATUS, MESSAGES } from '../../redux/types/user.type';
import { getFriend } from '../../utils/handleChat';
import _ from 'lodash';

const ChatUser = ({ chat }) => {
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  return (
    <div className={'chat-user-container'}>
      <div className="chat-left">
        {chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
          <AvatarUser
            image={getFriend(user, chat.participants)?.avatar}
            size={50}
            name={getFriend(user, chat.participants)?.userName}
          />
        ) : (
          <div className="avatar-group">
            {chat?.groupPhoto ? (
              <AvatarUser image={chat?.groupPhoto} size={50} />
            ) : (
              chat?.participants?.length > 0 &&
              chat?.participants?.map((item) => {
                return (
                  <React.Fragment key={item.id}>
                    <AvatarUser
                      image={item.avatar}
                      style={{
                        width: '50%',
                        height: '50%',
                      }}
                      name={getFriend(user, chat.participants)?.userName}
                    />
                  </React.Fragment>
                );
              })
            )}
          </div>
        )}

        <div className="right">
          <div className="top">
            {chat?.type === CHAT_STATUS.GROUP_CHAT ? (
              <>
                <div className="group-name">
                  <img
                    style={{ width: '15px', height: '15px' }}
                    src={'/groupPhoto/group.png'}
                  />
                  <span className="name">{chat?.name}</span>
                </div>
                {chat.listPin.includes(user.id) && (
                  <p className="pin">
                    <i className="fa-solid fa-thumbtack"></i>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="name">
                  {getFriend(user, chat.participants)?.userName}
                </p>
                {chat.listPin.includes(user.id) && (
                  <p className="pin">
                    <i className="fa-solid fa-thumbtack"></i>
                  </p>
                )}
              </>
            )}
          </div>
          {chat.lastedMessage && (
            <div className="bottom">
              <p>
                {chat.lastedMessage?.sender?.userName}:<> </>
                {chat?.lastedMessage?.type === MESSAGES.TEXT
                  ? chat.lastedMessage?.content
                  : chat.lastedMessage?.type === MESSAGES.IMAGES
                  ? 'Đã gửi ảnh'
                  : chat.lastedMessage?.type === MESSAGES.FILE_FOLDER
                  ? 'Đã gửi file'
                  : chat.lastedMessage?.type === MESSAGES.VIDEO
                  ? 'Đã gửi video'
                  : chat.lastedMessage?.type === MESSAGES.STICKER
                  ? 'Đã gửi sticker'
                  : chat.lastedMessage?.type === MESSAGES.AUDIO
                  ? 'Đã gửi audio'
                  : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUser;
