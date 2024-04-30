import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FixedSizeList as List } from 'react-window';
import './viewAllFiles.modal.scss'; 
const ViewAllFilesModal = ({ files }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const File = ({ name, size }) => (
    <div className="file">
      <p>{name}</p>
      <p>{size}</p>
    </div>
  );

  const Row = ({ index, style }) => (
    <div style={style}>
      <File name={files[index].name} size={files[index].size} />
    </div>
  );

  return (
    <div className="view-files">
      <div className='header'>
        <p className="title">Files</p>
        <div className="button" style={{ cursor: 'pointer' }} onClick={toggleExpanded}>
          <DownOutlined style={{ fontSize: '10px', fontWeight: '700', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '10px' }}>
          <List
            height={200}
            itemCount={files.length}
            itemSize={80}
            width={300}
          >
            {Row}
          </List>
          <Button style={{ marginTop: '10px' }}>View All</Button> 
        </div>
      )}                
    </div>
  )
}

export default ViewAllFilesModal;
