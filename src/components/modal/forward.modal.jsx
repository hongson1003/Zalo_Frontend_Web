import React, { useEffect, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import axios from '../../utils/axios';
import './forward.modal.scss';
import { Checkbox } from 'antd';
import { CHAT_STATUS } from '../../redux/types/user.type';
import { getFriend } from '../../utils/handleChat';
import { useSelector } from 'react-redux';
import AvatarUser from '../user/avatar';
import { socket } from '../../utils/io';
const CheckboxGroup = Checkbox.Group;
import _ from 'lodash';
import { toast } from 'react-toastify';

const ForwardModal = ({ children, message }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const stateUser = useSelector((state) => state.userReducer);

  const [checkedList, setCheckedList] = useState([]);
  const [plainOptions, setPlainOptions] = useState([]);

  const showModal = () => {
    fetchChats();
    setIsModalOpen(true);
  };

  function objectId() {
    return (
      hex(Date.now() / 1000) +
      ' '.repeat(16).replace(/./g, () => hex(Math.random() * 16))
    );
  }

  function hex(value) {
    return Math.floor(value).toString(16);
  }

  const handleOk = async () => {
    try {
      const checkListParse = checkedList.map((item) => JSON.parse(item));
      const listMessages = checkListParse.map((item) => {
        return {
          ...message,
          _id: objectId(),
          chat: item,
        };
      });
      await new Promise((resolve, reject) => {
        let count = 0;
        listMessages.forEach(async (item) => {
          const res = await axios.post('/chat/message', item);
          if (res.errCode === 0) {
            ++count;
            socket.then((socket) => {
              socket.emit('send-message', res.data);
            });
            if (count === listMessages.length) {
              resolve();
            }
          }
        });
      });
      stateUser.fetchChats();
      let members = '';
      checkedList.forEach((item) => {
        const chat = JSON.parse(item);
        if (chat.type === CHAT_STATUS.GROUP_CHAT) {
          members = members.concat(chat.name);
        } else {
          members = members.concat(
            getFriend(user, chat.participants)?.userName
          );
        }
        members = members.concat(', ');
      });
      toast.success(`Chuyển tiếp tin nhắn đến ${members} thành công!`, {
        autoClose: 3000,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to forward message:', error);
      toast.error('Chuyển tiếp tin nhắn thất bại');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get('/chat/pagination?page=1&limit=20');
      if (response.errCode === 0) {
        const data = response.data;
        setPlainOptions(data);
      } else {
        setPlainOptions([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (list) => {
    setCheckedList(list);
  };

  return (
    <div>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Chuyến tiếp tin nhắn"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        forceRender
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Chuyển tiếp
          </Button>,
        ]}
      >
        <div className="forward-container">
          <div className="forward-input">
            <Input placeholder="Tìm hội thoại cần chia sẻ" />
          </div>
          <div className="main-chats-share">
            <p className="title">Trò chuyện gần đây</p>
            <div className="list-chats">
              {plainOptions && plainOptions.length > 0 && (
                <CheckboxGroup
                  options={plainOptions.map((item) => {
                    if (item.type === CHAT_STATUS.GROUP_CHAT) {
                      return {
                        label: (
                          <div className="group-checkbox">
                            <AvatarUser image={item.groupPhoto} />
                            <p>{item.name}</p>
                          </div>
                        ),
                        value: JSON.stringify(item),
                      };
                    } else {
                      return {
                        label: (
                          <div className="group-checkbox">
                            <AvatarUser
                              image={getFriend(user, item.participants)?.avatar}
                              name={
                                getFriend(user, item.participants)?.userName
                              }
                            />
                            <p>
                              {getFriend(user, item.participants)?.userName}
                            </p>
                          </div>
                        ),
                        value: JSON.stringify(item),
                      };
                    }
                  })}
                  value={checkedList}
                  onChange={onChange}
                  className="list-checkbox"
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForwardModal;
