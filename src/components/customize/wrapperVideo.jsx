import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getFriend } from '../../utils/handleChat';
import { socket } from '../../utils/io';

const WrapperVideo = ({ children }) => {
  const chat = useSelector((state) => state.appReducer.subNav);
  const user = useSelector((state) => state.appReducer.userInfo.user);

  const handleOpenCallVideo = () => {
    const width = 1000; // Độ rộng của cửa sổ mới
    const height = 500; // Độ cao của cửa sổ mới
    const left = (window.screen.width - width) / 2; // Tính toán vị trí trung tâm theo trục X
    const top = (window.screen.height - height) / 2; // Tính toán vị trí trung tâm theo trục Y
    const newWindow = window.open(
      `/video-call?chat=${chat._id}&isCalled=false`,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (newWindow) {
      // Thực hiện các hành động cần thiết khi cửa sổ mới được mở
    } else {
      alert('Popup blocked! Please enable popups for this site.');
    }
  };

  return <span onClick={handleOpenCallVideo}>{children}</span>;
};

export default WrapperVideo;
