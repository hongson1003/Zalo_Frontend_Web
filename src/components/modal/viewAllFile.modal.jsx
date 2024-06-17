import React, { useState } from 'react';
import {
  DownOutlined,
  FileOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import { Button, Image } from 'antd';
import './viewAllFiles.modal.scss';
import ListDrawer from '../drawer/viewAll.chat.drawer';

const ViewAllFilesModal = ({ files }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  const getFileIcon = (fileExtension) => {
    switch (fileExtension) {
      case 'txt':
        return <Image width={40} src={'public/images/txt.jpg'} />;
      case 'doc':
        return <Image width={40} src={'public/images/word.jpg'} />;
      case 'docx':
        return <Image width={40} src={'public/images/word.jpg'} />;
      case 'pdf':
        return <Image width={40} src={'public/images/pdf.jpg'} />;
      case 'xls':
        return <Image width={40} src={'public/images/excel.jpg'} />;
      case 'xlsx':
        return <Image width={40} src={'public/images/excel.jpg'} />;
      default:
        return <Image width={40} src={'public/images/txt.jpg'} />;
    }
  };
  const FileItem = ({ file }) => {
    const url = file.urls[0]; // Lấy URL đầu tiên từ mảng urls
    const fileExtension = url.substring(url.lastIndexOf('.') + 1).toLowerCase(); // Lấy phần mở rộng của tệp từ URL
    const IconComponent = getFileIcon(fileExtension);
    let fileName = url.substring(url.lastIndexOf('/') + 1).toLowerCase();
    fileName =
      fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
    // return (
    //     <div>
    //         {IconComponent}
    //         <span style = {{marginLeft: '10px'}}>{fileName}</span>
    //     </div>
    // );
    return (
      <div className="info-list">
        <button
          className="common-group"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {IconComponent}
          <span style={{ marginLeft: '10px', textAlign: 'left' }}>
            {fileName}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="view-files">
      <div
        className="header"
        style={{ cursor: 'pointer' }}
        onClick={toggleExpanded}
      >
        <p className="title">Files</p>
        <div className="button">
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
        <div className="view-files-body">
          {files.map((item, index) => (
            <FileItem key={index} file={item} />
          ))}
          <ListDrawer>
            <Button
              style={{
                width: '95%',
                backgroundColor: '#F5F5F5',
                marginTop: '10px',
              }}
            >
              Xem tất cả
            </Button>
          </ListDrawer>
        </div>
      )}
    </div>
  );
};

export default ViewAllFilesModal;
