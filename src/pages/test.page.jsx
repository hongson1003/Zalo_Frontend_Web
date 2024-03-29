import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import './test.page.css'

const TestPage = ({ icon }) => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const [isClick, setIsClick] = useState(false);

    const handleOnClick = () => {
        setIsClick(!isClick);
    }

    useEffect(() => {
        if (isClick) {
            setTimeout(() => {
                setIsClick(false);
            }, 500);
        }
    }, [isClick]);

    return (
        <div className="tym-main-container-xyz">
            <div
                className={`tym-icon-123 ${isClick ? 'active' : ''}`}
                onClick={() => handleOnClick()}
            >
                ❤️
                <div className="tyms-frame">
                    <div className="tyms-heart">
                        <div className="tyms-heart-inner">
                            <div>❤️</div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                            <div>
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                            <div>
                                <div>❤️</div>
                                <div>❤️</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default TestPage;
