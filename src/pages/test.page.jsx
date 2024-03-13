import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SearchComponent } from 'stipop-react-sdk'


const TestPage = () => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);

    const [component, setComponent] = useState(null);

    const handleStickerClick = (stickerData) => {
        const { url, stickerId, packageId } = stickerData;
        setComponent(
            <div>
                <img src={url} alt={`Sticker ${stickerId}`} style={{
                    width: '100px',
                    height: '100px'

                }} />
                <p>Sticker ID: {stickerId}</p>
                <p>Package ID: {packageId}</p>
            </div>)
    };


    return (
        <div>
            <h1>Test Page</h1>
            <SearchComponent
                params={{
                    apikey: import.meta.env.VITE_APP_API_KEY_STIPOP,
                    userId: user?.id,
                    countryCode: 'VN',
                    lang: 'vi',
                }}
                stickerClick={handleStickerClick}
            />
            <div>
                <p>Ảnh nè</p>
                {component}

            </div>
        </div >
    )
}

export default TestPage;