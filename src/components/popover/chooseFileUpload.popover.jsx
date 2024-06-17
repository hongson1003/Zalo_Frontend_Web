import React, { useEffect } from 'react';
import { Button, Popover } from 'antd';
import './chooseFileUpload.popover.scss';
import { toast } from 'react-toastify';

const content = ({ sendFileOrFolder, sendVideo, sendAudio }) => {
  const handleOnChangeFiles = (e) => {
    const files = e.target.files;
    const type = e.target.files[0].type;
    if ((files?.[0] && type === 'audio/mpeg') || type === 'audio/mp3') {
      sendAudio(files[0]);
    } else if (files?.[0] && type === 'video/mp4') {
      sendVideo(files[0]);
    } else {
      sendFileOrFolder(files);
    }
  };

  const handleChooseFolder = () => {
    toast.warn('Chức năng chưa được hỗ trợ');
  };

  return (
    <div className="content-upload">
      <label htmlFor="file-upload">
        <div className="file-item item">
          <span>
            <i className="fa-regular fa-file"></i>
            <input
              type="file"
              id="file-upload"
              hidden
              multiple
              onChange={handleOnChangeFiles}
            />
          </span>
          <span>Chọn File</span>
        </div>
      </label>
      <div className="folder-item item" onClick={handleChooseFolder}>
        <span>
          <i className="fa-regular fa-folder"></i>
        </span>
        <span>Chọn thư mục</span>
      </div>
    </div>
  );
};

const ChooseFileUploadPopover = ({
  children,
  sendFileOrFolder,
  sendVideo,
  sendAudio,
}) => {
  return (
    <React.Fragment>
      <Popover
        content={React.createElement(content, {
          sendFileOrFolder,
          sendVideo,
          sendAudio,
        })}
        forceRender
        trigger={['click', 'hover']}
      >
        <span>{children}</span>
      </Popover>
    </React.Fragment>
  );
};

export default ChooseFileUploadPopover;
