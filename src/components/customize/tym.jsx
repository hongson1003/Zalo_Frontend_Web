import React, { useEffect, useState } from "react";
import './tym.css';

const Tym = ({ icon, clickRef }) => {
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

    useEffect(() => {
        if (clickRef && clickRef.current) {
            clickRef.current = handleOnClick;
        }
    }, []);


    return (
        <div className="tym-main-container-xyz">
            <div
                className={`tym-icon-123 ${isClick ? 'active' : ''}`}
                onClick={() => handleOnClick()}
            >
                {icon}
                <div className="tyms-frame">
                    <div className="tyms-heart">
                        <div className="tyms-heart-inner">
                            <div>{icon}</div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                            <div className="tyms-heart-inner">
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                            <div>
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                        </div>
                        <div className="tyms-heart-inner">
                            <div>
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                            <div>
                                <div>{icon}</div>
                                <div>{icon}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Tym;