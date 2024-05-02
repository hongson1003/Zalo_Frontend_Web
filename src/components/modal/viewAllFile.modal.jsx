import React, { useState } from 'react';
import { DownOutlined, FileOutlined, FileTextOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined } from '@ant-design/icons';
import { Button} from 'antd';
import { FixedSizeList as List } from 'react-window';
import './viewAllFiles.modal.scss'; 
const ViewAllFilesModal = ({ files }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  const getFileIcon = (fileExtension) => {
    switch (fileExtension) {
        case 'txt':
            return <FileWordOutlined />;
        case 'doc':
            return <FileWordOutlined />;
        case 'docx':
            return <FileTextOutlined />;
        case 'pdf':
            return <FilePdfOutlined />;
        case 'xls':
        case 'xlsx':
            return <FileExcelOutlined />;
        default:
            return <FileOutlined />;
    }
  };
  const FileItem = ({ file }) => {
    const url = file.urls[0]; // Lấy URL đầu tiên từ mảng urls
    const fileExtension = url.substring(url.lastIndexOf('.') + 1).toLowerCase(); // Lấy phần mở rộng của tệp từ URL
    const IconComponent = getFileIcon(fileExtension);
    const fileName = url.substring(url.lastIndexOf('/') + 1).toLowerCase();
    return (
        <div>
            {IconComponent}
            <span>{fileName}</span>
        </div>
    );
  };

  return (
    <div className="view-files">
      <div className='header'>
        <p className="title">Files</p>
        <div className="button" style={{ cursor: 'pointer' }} onClick={toggleExpanded}>
          <DownOutlined style={{ fontSize: '10px', fontWeight: '700', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>
      </div>
      {expanded && (
         <div style={{ marginTop: '10px', marginLeft: '10px', flexDirection: 'column', alignItems: 'center' }}>
          {/* <List
            height={200}
            itemCount={files.length}
            itemSize={80}
            width={300}
          > */}
             {files.map((item, index) => (
                  <FileItem key={index} file={item} />
              ))}
          {/* </List> */}
          <Button style = {{width: '95%', backgroundColor: '#F5F5F5', marginTop: '10px'}}>Xem tất cả</Button>
        </div>
      )}                
    </div>
  )
}

export default ViewAllFilesModal;
