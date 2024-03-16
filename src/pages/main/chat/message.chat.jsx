import React, { useCallback, useEffect, useRef, useState } from "react";
import './message.chat.scss';
import { Popover } from 'antd';
import EmoijPopup from "./emoijPopup.chat";
import Tym from "../../../components/customize/tym";
import _ from 'lodash';
const content = ({ optionsRef }) => {
    const contentRef = useRef(null);
    const items = [
        {
            key: 1,
            item: () => (
                <div >
                    <i className="fa-regular fa-copy"></i>
                    <p>Copy hình ảnh</p>
                </div>
            )
        },
        {
            key: 2,
            item: () => (
                <div >
                    <i className="fa-solid fa-thumbtack"></i>
                    <p>Ghim tin nhắn</p>
                </div>
            )
        },
        {
            key: 3,
            item: () => (
                <div >
                    <i className="fa-solid fa-circle-info"></i>
                    <p>Xem chi tiết</p>
                </div>
            )
        }, {
            key: 4,
            item: () => (
                <div className="thu-hoi-tin-nhan">
                    <i className="fa-regular fa-square-minus"></i>
                    <p>Thu hồi tin nhắn</p>
                </div>
            )
        }
    ]

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.addEventListener('mouseover', () => {
                optionsRef.current.classList.add('show-options');
            })
            contentRef.current.addEventListener('mouseleave', (e) => {
                optionsRef.current.classList.remove('show-options');
            })
        }
    }, [])

    return (
        <div className="subOption" ref={contentRef}>
            {
                items && items.length > 0 &&
                items.map((Element, index) => (
                    <div className="option-sub-item" key={Element.key}>
                        <Element.item />
                    </div>
                ))
            }

        </div>
    )
}


const MessageChat = ({ children, isLeft }) => {
    const optionsRef = useRef(null);
    const messageHoverContainerRef = useRef(null);
    const frameTymRef = useRef(null);
    const [trigger, setTrigger] = useState('hover');

    useEffect(() => {
        if (messageHoverContainerRef.current && frameTymRef.current) {
            messageHoverContainerRef.current.addEventListener('mouseover', () => {
                optionsRef.current.classList.add('show-options');
            })
            messageHoverContainerRef.current.addEventListener('mouseleave', () => {
                optionsRef.current.classList.remove('show-options');
            })
            messageHoverContainerRef.current.addEventListener('mouseover', () => {
                frameTymRef.current.classList.add('show-frame-tym');
            })
            messageHoverContainerRef.current.addEventListener('mouseleave', (e) => {
                if (!(e.toElement.className === 'emoij-popup-container' || e.toElement.className === 'reaction' || e.toElement.className === 'tym-message' || e.toElement.className === 'tym-icon-123 active' || e.toElement.className === 'tym-icon-123' || e.toElement.className === 'tym-main-container-xyz' || e.toElement.className === 'tyms-frame' || e.toElement.className === 'tyms-heart')) {
                    frameTymRef.current.classList.remove('show-frame-tym');
                }
            })
        }
    }, [])

    const handleTymMessage = () => {
        setTrigger('contextMenu');
        setHoverTrigger();
    }

    const setHoverTrigger = useCallback(_.debounce(() => {
        setTrigger('hover');
    }, 500));




    return (
        <React.Fragment>
            <span
                className={isLeft ? "message-hover-container option-right" : "message-hover-container option-left"}
                ref={messageHoverContainerRef}
            >
                {children}
                <div className="options" ref={optionsRef}>
                    <div className="options-content">
                        <div className="option-item">
                            <i className="fa-solid fa-reply"></i>
                        </div>
                        <div className="option-item">
                            <i className="fa-solid fa-share"></i>
                        </div>
                        <Popover
                            content={React.createElement(content, { optionsRef })}
                            trigger={"click"}
                            placement="topRight"
                            className="popover-options"
                        >
                            <div className="option-item">
                                <i className="fa-solid fa-ellipsis"></i>
                            </div>
                        </Popover>

                    </div>
                </div>
                <div className="frame-tym" ref={frameTymRef}>
                    <EmoijPopup placement={isLeft ? 'top' : 'topRight'} trigger={trigger}>
                        <div className="tym-message" onClick={handleTymMessage}>
                            {/* <i className="fa-regular fa-thumbs-up reaction-icon"></i> */}
                            <Tym icon={'❤️'} />
                        </div>
                    </EmoijPopup>
                </div>

            </span>
        </React.Fragment>
    )
}

export default MessageChat;