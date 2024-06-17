import React, { useEffect, useRef } from 'react';
import { Button, Flex, Modal } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';
import 'react-medium-image-zoom/dist/styles.css';
import './infoGroup.modal.scss';
import { useSelector, useDispatch } from 'react-redux';
import AvatarUser from '../../components/user/avatar';
import Zoom from 'react-medium-image-zoom';
import { accessChat } from '../../redux/actions/user.action';
import { InstagramOutlined } from '@ant-design/icons';
import ChooseImageModal from './chooseImage.modal';
import { editGroup } from '../../redux/actions/app.action';
import { Input } from 'antd';
import LeaveGroupModal from './leaveGroup.modal';
import DisbandGroupModal from './disbandGroup.modal';
import {
  getDetailListMembers,
  sendNotifyToChatRealTime,
} from '../../utils/handleChat';
import { MESSAGES } from '../../redux/types/user.type';

const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;

const InforGroupModal = ({ children, selectChat }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chat = useSelector((state) => state.appReducer?.subNav);
  const dispatch = useDispatch();
  const [collections, setCollections] = useState([]);
  const [file, setFile] = useState(null);
  const [groupPhoto, setGroupPhoto] = useState('');
  const stateUser = useSelector((state) => state.userReducer);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(chat?.name || '');
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGroupPhotos = async () => {
      const response = await fetch('/groupPhoto/data.json');
      const images = await response.json();
      setCollections(images);
    };
    fetchGroupPhotos();
  }, []);

  useEffect(() => {
    if (!chat._id) handleCancel();
  }, [chat]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      setIsLoading(true);
      let url = '';
      if (file) {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: 'POST',
            body: file,
          }
        );
        await sendNotifyToChatRealTime(
          chat?._id,
          `${user?.userName} đã thay đổi ảnh nhóm`,
          MESSAGES.NOTIFY
        );
        const { secure_url } = await response.json();
        setGroupPhoto(secure_url);
        url = secure_url;
      } else {
        url = groupPhoto;
      }
      if (!url && name === chat?.name) {
        setIsModalOpen(false);
        return;
      }
      // save to db
      const res = await axios.put('/chat/group', {
        _id: chat._id,
        groupPhoto: url,
        name,
      });
      if (chat?.groupPhoto !== groupPhoto && !file) {
        sendNotifyToChatRealTime(
          chat?._id,
          `${user?.userName} đã thay đổi ảnh nhóm`,
          MESSAGES.NOTIFY
        );
      }
      if (res.errCode === 0) {
        dispatch(editGroup(res.data));
        stateUser.fetchChats();
      }
      setIsLoading(false);
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOnSend = () => {
    dispatch(accessChat(selectChat || chat));
    handleCancel();
  };

  const handleEditName = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <>
      <span
        className="infor-user-modal"
        onClick={() => {
          setTimeout(() => {
            showModal();
          }, 50);
        }}
      >
        {children}
      </span>
      <Modal
        title="Thông tin nhóm"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={400}
        centered
        style={{ borderRadius: '12px', overflow: 'auto', padding: '0px' }}
        footer={
          !selectChat && [
            <Button key="back" onClick={handleCancel}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              loading={isLoading}
            >
              Lưu
            </Button>,
          ]
        }
      >
        <div className="info-group-container">
          <div className="header">
            <AvatarUser
              image={
                selectChat?.groupPhoto ||
                groupPhoto ||
                chat?.groupPhoto ||
                '/images/group.png'
              }
              size={50}
              zoom
            >
              <ChooseImageModal
                setGroupPhoto={setGroupPhoto}
                setFile={setFile}
                data={collections}
              >
                <div className="camara-container">
                  <InstagramOutlined />
                </div>
              </ChooseImageModal>
            </AvatarUser>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                spellCheck={false}
              />
            ) : (
              <p>{selectChat?.name || name}</p>
            )}
            <p>
              {!selectChat && !isEditing ? (
                <i
                  className="fa-solid fa-pen-to-square"
                  onClick={handleEditName}
                ></i>
              ) : (
                <i className="fa-solid fa-check" onClick={handleEditName}></i>
              )}
            </p>
          </div>
          <div className="send-message">
            <Button className="send-btn" type="default" onClick={handleOnSend}>
              Nhắn tin
            </Button>
          </div>
          <div className="members">
            <p className="title">
              Thành viên {`(${getDetailListMembers(chat?.participants).total})`}
            </p>
            <div className="members-items">
              {chat?.participants?.map((item, index) => {
                return (
                  <div className="member" key={item.id}>
                    <AvatarUser
                      image={item?.avatar}
                      name={item?.userName}
                      zoom
                      size={50}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {!selectChat && (
            <>
              <div className="setting-group-item">
                <i className="fa-solid fa-gear"></i>
                <p>Quản lý nhóm</p>
              </div>

              <div className="out-group-item">
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                {user?.id === chat?.administrator ? (
                  <DisbandGroupModal>
                    <p>Rời nhóm</p>
                  </DisbandGroupModal>
                ) : (
                  <LeaveGroupModal>
                    <p>Rời nhóm</p>
                  </LeaveGroupModal>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InforGroupModal;
