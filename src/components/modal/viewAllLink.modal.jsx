import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FixedSizeList as List } from 'react-window';
import './viewAllLinks.modal.scss'; // Import stylesheet for viewAllLinks

const ViewAllLinksModal = ({ links }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const Link = ({ title, url }) => (
    <div className="link">
      <p>{title}</p>
      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    </div>
  );

  const Row = ({ index, style }) => (
    <div style={style}>
      <Link title={links[index].title} url={links[index].url} />
    </div>
  );

  return (
    <div className="view-links">
      <div className='header'>
        <p className="title">Links</p>
        <div className="button" style={{ cursor: 'pointer' }} onClick={toggleExpanded}>
          <DownOutlined style={{ fontSize: '10px', fontWeight: '700', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '10px' }}>
          <List
            height={200}
            itemCount={links.length}
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

export default ViewAllLinksModal;
