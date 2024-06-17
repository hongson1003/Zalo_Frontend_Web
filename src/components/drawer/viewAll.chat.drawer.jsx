import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import './viewAll.chat.drawer.scss';
import { Tabs } from 'antd';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import { Image } from 'antd';
import { toast } from 'react-toastify';

const items = [
  {
    key: '1',
    label: 'Ảnh/video',
    children: <ListImages />,
  },
  {
    key: '2',
    label: 'Tệp đính kèm',
    children: <ListFiles />,
  },
  {
    key: '3',
    label: 'Links',
    children: <ListLinks />,
  },
];

function ListImages() {
  const [images, setImages] = useState([]);
  const [limit, setLimit] = useState(30);
  const chat = useSelector((state) => state.appReducer?.subNav);

  const fetchAllImages = async () => {
    try {
      const res = await axios.get(
        `/chat/message/getAllPicture?chatId=${chat._id}&limit=${limit}`
      );
      if (res.errCode === 0) {
        setImages(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  useEffect(() => {
    fetchAllImages();
  }, []);

  return (
    <div className="list-images">
      {images.map((item, index) => {
        return (
          <div key={index} className="image-item">
            <Image width={100} src={item.urls[0]} />
          </div>
        );
      })}
    </div>
  );
}

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

function ListFiles() {
  const [files, setFiles] = useState([]);
  const [limit, setLimit] = useState(30);
  const chat = useSelector((state) => state.appReducer?.subNav);

  // const fetch

  useEffect(() => {}, []);

  return <div>List Files</div>;
}

function ListLinks() {
  return <div>List Links</div>;
}

const ListChatDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const onChange = (key) => {};

  const TitleDrawer = () => {
    return (
      <div className="images-drawer-title">
        <i className="fa-solid fa-chevron-left" onClick={onClose}></i>
        <span>Kho lưu trữ</span>
        <span>Chọn</span>
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          marginTop: 16,
        }}
      >
        <span onClick={showDrawer}>{children}</span>
      </div>
      <Drawer
        title={<TitleDrawer />}
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        getContainer={false}
        className="my-drawer-images"
        destroyOnClose={true}
      >
        <div className="drawer-body">
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      </Drawer>
    </div>
  );
};
export default ListChatDrawer;
