import React, { useEffect, useState } from 'react';
import { Button, Flex, Modal } from 'antd';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import './changeBackground.modal.scss';

const ChangeBackgroundModal = ({ chat, children, handleChangeBackground }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const setBackgroundForChat = async (chatId, backgroundId) => {
    try {
      const response = await axios.put(`/chat/background`, {
        chatId,
        backgroundId,
      });
      if (response.errCode === 0) {
        handleChangeBackground(response.data.background);
      }
    } catch (error) {
      console.error('Failed to set background:', error);
    }
  };

  const handleOk = () => {
    // Xử lý logic nè
    const chatId = chat._id;
    const backgroundId = selectedBackground._id;
    if (backgroundId === 'none-bg') {
      setBackgroundForChat(chatId, null);
      setIsModalOpen(false);
      return;
    }
    setBackgroundForChat(chatId, backgroundId);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchBackgroundPaginate(page, limit);
  }, []);

  const fetchBackgroundPaginate = async (page, limit) => {
    try {
      const response = await axios.get(
        `/chat/background/pagination?page=${page}&limit=${limit}`
      );
      if (response.errCode === 0) {
        setBackgrounds(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch backgrounds:', error);
    }
  };

  const handleSelectBackground = async (background) => {
    setSelectedBackground(background);
  };

  return (
    <React.Fragment>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Chọn hình nền"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Đồng ý
          </Button>,
        ]}
      >
        <Flex
          wrap="wrap"
          justify="center"
          gap={'10px'}
          className="background-container"
        >
          <div className="background-body">
            <div
              key={'none-bg'}
              className={
                selectedBackground && selectedBackground._id === 'none-bg'
                  ? 'background-item selected'
                  : 'background-item'
              }
              onClick={() =>
                handleSelectBackground({
                  _id: 'none-bg',
                })
              }
            >
              <i className="fa-solid fa-ban"></i>
            </div>
            {backgrounds &&
              backgrounds.length > 0 &&
              backgrounds.map((background, index) => {
                return (
                  <div
                    key={background._id}
                    className={
                      selectedBackground &&
                      selectedBackground._id === background._id
                        ? 'background-item selected'
                        : 'background-item'
                    }
                    onClick={() => handleSelectBackground(background)}
                  >
                    <img
                      src={background.url}
                      alt={background.name}
                      style={{ width: '65px', height: '65px' }}
                    />
                  </div>
                );
              })}
          </div>
        </Flex>
      </Modal>
    </React.Fragment>
  );
};

export default ChangeBackgroundModal;
