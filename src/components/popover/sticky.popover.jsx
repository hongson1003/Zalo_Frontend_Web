import { Popover } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { StoreComponent, UnifiedComponent } from 'stipop-react-sdk';
import { MESSAGES } from '../../redux/types/user.type';
import './sticky.popover.scss';

const content = ({ handleClose, openStore, setOpenStore }) => {
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const userState = useSelector((state) => state.userReducer);

  const handleStickerClick = async (stickerData) => {
    const { url } = stickerData;
    const { sendMessageFunc } = userState;
    handleClose();
    await sendMessageFunc(url, MESSAGES.STICKER);
  };

  const handleStoreClick = async (value) => {
    // toast.warn('Chức năng đang phát triển');
    if (value && !openStore) {
      setOpenStore(true);
    }
  };

  return (
    <div className="picker-content">
      {openStore === false ? (
        <UnifiedComponent
          params={{
            apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
            userId: user?.id,
            countryCode: 'VN',
            lang: 'vi',
          }}
          stickerClick={handleStickerClick}
          onClose={handleClose}
          storeClick={handleStoreClick}
        />
      ) : (
        <StoreComponent
          params={{
            apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
            userId: user?.id,
            countryCode: 'VN',
            lang: 'vi',
            animated: 'N',
          }}
          downloadParams={{
            isPurchase: 'N',
          }}
          onClose={() => setOpenStore(false)}
        />
      )}
    </div>
  );
};

const StickyPopover = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [openStore, setOpenStore] = useState(false);

  return (
    <div className="sticky-popover">
      <Popover
        content={React.createElement(content, {
          handleClose: () => setOpen(false),
          openStore,
          setOpenStore,
        })}
        trigger="click"
        open={open}
        className="sticky-popover__popover"
        onOpenChange={(visible) => setOpen(visible)}
      >
        <span>{children}</span>
      </Popover>
    </div>
  );
};

export default StickyPopover;
