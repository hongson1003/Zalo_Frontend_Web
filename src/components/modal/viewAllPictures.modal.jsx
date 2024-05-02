import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Image } from 'antd';
import './viewAllPictures.modal.scss';

const ViewAllPicturesModal = ({ message }) => {

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    console.log(message);
    setExpanded(!expanded);
  };
  
  return (
    <div className="view-images">
      <div className = 'header'>
      {/* Header */}
          <p className="title">Ảnh / Video</p>
          {/* Toggle Button */}
          <div className="button" style={{ cursor: 'pointer' }} onClick={toggleExpanded}>
            <DownOutlined style={{ fontSize: '10px', fontWeight: '700', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
      </div>
      {/* Content */}
      {expanded && (
        <div style={{ marginTop: '10px', marginLeft: '10px', flexDirection: 'column', alignItems: 'center' }}>
          <Image.PreviewGroup
                preview={{
                  onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
                }}
          >
                {message.map((item, index) => (
                  <Image
                    key={index}
                    width={80}
                    src={item.urls}
                    alt={item.sender}
                  />
                ))}
          </Image.PreviewGroup>
          <Button style = {{width: '95%', backgroundColor: '#F5F5F5', marginTop: '10px'}}>Xem tất cả</Button>
        </div>
      )}                
                      
    </div>
  )
}
export default ViewAllPicturesModal;
