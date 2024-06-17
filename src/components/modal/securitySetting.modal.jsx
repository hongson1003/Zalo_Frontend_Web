import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './viewSetting.modal.scss'; // Import stylesheet for viewSetting

const ViewSettingModal = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="view-settings" onClick={toggleExpanded}>
      <div className="header">
        <p className="title">Thiết lập bảo mật</p>
        <div className="button" style={{ cursor: 'pointer' }}>
          <DownOutlined
            style={{
              fontSize: '10px',
              fontWeight: '700',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {expanded && (
        <div className="setting-body" style={{ marginTop: '10px' }}>
          <div className="info-list">
            <button className="common-group">
              <img src="/images/clock_time.png" alt="Create Group Icon" />
              <p>Tin nhắn tự xóa</p>
            </button>
          </div>
          <div className="info-list">
            <button className="common-group">
              <img src="/images/unsee.png" alt="Create Group Icon" />
              <p>Ẩn trò chuyện</p>
            </button>
          </div>
          <div className="info-list">
            <button className="common-group">
              <img src="/images/warning.png" alt="Create Group Icon" />
              <p>Báo xấu</p>
            </button>
          </div>
          <div className="info-list">
            <button className="common-group">
              <img src="/images/bin.png" alt="Create Group Icon" />
              <p style={{ color: 'red' }}>Xóa lịch sử trò chuyện</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSettingModal;
