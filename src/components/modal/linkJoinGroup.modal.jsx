import React, { useState } from 'react';
import { Modal } from 'antd';
const url = import.meta.env.VITE_APP_URL;
import { Button, message } from 'antd';
import { QRCode } from 'antd';

const LinkJoinGroupModal = ({ group, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Đã sao chép link tham gia nhóm!',
      style: {
        marginTop: '20vh',
      },
    });
  };

  return (
    <>
      <span type="primary" onClick={showModal}>
        {children}
      </span>
      <Modal
        title="Chia sẻ link tham gia nhóm"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div>
            <p>Link tham gia nhóm:</p>
            <p
              style={{
                color: 'blue',
                marginLeft: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                fontStyle: 'italic',
              }}
            >
              <span>{`${url}/chat/${group._id}`}</span>
              &nbsp;
              {contextHolder}
              <span
                style={{
                  color: 'black',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  navigator.clipboard.writeText(`${url}/chat/${group._id}`);
                  success();
                }}
              >
                <i className="fa-solid fa-copy"></i>
              </span>
            </p>
          </div>
          <div>
            <QRCode
              style={{
                marginBottom: 16,
              }}
              value={JSON.stringify({
                type: 'JOIN-CHAT',
                groupId: group._id,
              })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LinkJoinGroupModal;
