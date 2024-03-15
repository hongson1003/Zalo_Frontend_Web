import React, { useEffect, useRef, useState } from "react";
import './message.chat.scss';
import { Popover } from 'antd';
import EmoijPopup from "./emoijPopup.chat";

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

    useEffect(() => {
        if (messageHoverContainerRef.current) {
            messageHoverContainerRef.current.addEventListener('mouseover', () => {
                optionsRef.current.classList.add('show-options');
            })
            messageHoverContainerRef.current.addEventListener('mouseleave', (e) => {
                optionsRef.current.classList.remove('show-options');
            })
        }
    }, [])

    const handleTymMessage = () => {
        console.log('tym')
    }

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
                <div className="frame-tym">
                    <div className="tym-message" onClick={handleTymMessage}>
                        <EmoijPopup placement={isLeft ? 'top' : 'topRight'}>
                            <i className="fa-regular fa-thumbs-up reaction-icon"></i>
                        </EmoijPopup>

                    </div>
                </div>

            </span>
        </React.Fragment>
    )
}

export default MessageChat;