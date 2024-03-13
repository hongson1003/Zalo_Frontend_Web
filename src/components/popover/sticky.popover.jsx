import { Popover } from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { SearchComponent } from 'stipop-react-sdk'
import { MESSAGES } from "../../redux/types/type.user";


const content = ({ handleClose }) => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const userState = useSelector(state => state.userReducer);
    const handleStickerClick = async (stickerData) => {
        const { url } = stickerData;
        const { sendMessageFunc } = userState;
        await sendMessageFunc(url, MESSAGES.STICKER);
        handleClose();
    };
    return (
        <div>
            <SearchComponent
                params={{
                    apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
                    userId: user?.id,
                    countryCode: 'VN',
                    lang: 'vi',
                }}
                stickerClick={handleStickerClick}
            />
        </div>
    );

}

const StickyPopover = ({ children }) => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };
    return (
        <div className="sticky-popover">
            <Popover
                content={React.createElement(content, { handleClose: () => setOpen(false) })}
                title="STICKERS"
                trigger="click"
                open={open}
                onOpenChange={handleOpenChange}
            >
                <span>{children}</span>
            </Popover>
        </div>


    );
}

export default StickyPopover;