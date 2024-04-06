import { Popover } from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { SearchComponent, PickerComponent, StoreComponent } from 'stipop-react-sdk'
import { MESSAGES } from "../../redux/types/type.user";
import './sticky.popover.scss';
const TYPE_STICKER = {
    PICKER: 'PICKER',
    STORE: 'STORE',
    SEARCH: 'SEARCH',
}

const customizeTitle = ({ handleOnChangeSticky, currentSticker, setCurrentSticker }) => {

    const handleOpenStickySearch = () => {
        handleOnChangeSticky(TYPE_STICKER.SEARCH);
    }

    const handleOnClick = () => {
        if (currentSticker !== TYPE_STICKER.PICKER) {
            setCurrentSticker(TYPE_STICKER.PICKER);
        }
    }

    return (
        <div className="sticky-title-container">
            <button className="btn-sticky" onClick={handleOnClick}>
                {
                    currentSticker !== TYPE_STICKER.PICKER &&
                    <>
                        <i className="fa-regular fa-hand-point-left"></i>
                        &nbsp;
                    </>
                }
                <span>Sticky</span>
            </button>
            <p className="search-item" onClick={handleOpenStickySearch}>
                <i className="fa-brands fa-searchengin"></i>
            </p>
        </div>
    );

}

const content = ({ handleClose, currentSticker, setCurrentSticker }) => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const userState = useSelector(state => state.userReducer);

    const handleStickerClick = async (stickerData) => {
        const { url } = stickerData;
        const { sendMessageFunc } = userState;
        await sendMessageFunc(url, MESSAGES.STICKER);
        handleClose();
    };

    const handleStoreClick = (stickerData) => {
        setCurrentSticker(TYPE_STICKER.STORE);
    }

    return (
        <div className="picker-content">
            {
                currentSticker === TYPE_STICKER.PICKER ? (
                    <PickerComponent
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
                    currentSticker === TYPE_STICKER.SEARCH ? (
                        <SearchComponent
                            params={{
                                apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
                                userId: user?.id,
                                countryCode: 'VN',
                                lang: 'vi',
                            }}
                            stickerClick={handleStickerClick}
                        />
                    ) : (
                        <StoreComponent
                            params={{
                                apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
                                userId: user?.id,
                                countryCode: 'VN',
                                lang: 'vi',
                            }}
                            downloadParams={
                                {
                                    apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
                                    userId: user?.id,
                                    countryCode: 'VN',
                                    lang: 'vi',
                                    isPurchase: false,
                                }
                            }
                            stickerClick={handleStickerClick}
                        />
                    )
                )
            }
        </div>
    );

}

const StickyPopover = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [currentSticker, setCurrentSticker] = useState(TYPE_STICKER.PICKER);

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const handleOnChangeSticky = (type) => {
        setCurrentSticker(type);
    }


    return (
        <div className="sticky-popover">
            <Popover
                content={React.createElement(content, {
                    handleClose: () => setOpen(false),
                    currentSticker,
                    setCurrentSticker
                })}
                title={React.createElement(customizeTitle, { handleOnChangeSticky, currentSticker, setCurrentSticker })}
                trigger="click"
                open={open}
                onOpenChange={handleOpenChange}
                className="sticky-popover__popover"
            >
                <span>{children}</span>
            </Popover>
        </div>


    );
}

export default StickyPopover;