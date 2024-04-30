import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './viewAllPictures.modal.scss';
import { FixedSizeList as List } from 'react-window';

const ViewAllPicturesModal = ({ message }) => {

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    console.log(message);
    setExpanded(!expanded);
  };
  const Image = ({url, sender}) => (
    <div className="image">
      <img src={url} alt={sender} />
    </div>
  );
  const Row = ({ index, style }) => (
    <div style={style}>
      <Image url={message[index].urls[0]} sender={message[index].sender} />
    </div>
  );
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
        <div style={{ marginTop: '10px' }}>
          <List
            height={200} // Chiều cao của list
            itemCount={message.length} // Số lượng phần tử trong list
            itemSize={120} // Chiều cao của mỗi phần tử trong list
            width={300} // Chiều rộng của list
          >
            {Row}
          </List>
          <Button style={{ marginTop: '10px' }}>Xem tất cả</Button> 
        </div>
      )}                
                      
    </div>
  )
}
export default ViewAllPicturesModal;
