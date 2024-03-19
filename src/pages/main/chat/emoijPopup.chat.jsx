import React, { useEffect, useState } from "react";
import { Popover } from 'antd';
import './emoijPopup.chat.scss';

const Content = ({ setSelectedReaction, handleTymMessage }) => {


    const reactions = [
        { name: 'like', icon: '👍' },
        { name: 'tym', icon: '❤️' },
        { name: 'haha', icon: '😂' },
        { name: 'bốc cứt', icon: '💩' }, // Thay thế "bỡ ngỡ" bằng biểu tượng "bốc cứt"
        { name: 'khóc', icon: '😢' },
        { name: 'tức giận', icon: '😡' }
    ];

    const handleGetReaction = (reaction) => {
        setSelectedReaction(reaction.icon);
        handleTymMessage(String(reaction.icon).trim());
    }

    return (
        <div className="emoij-popup-container">
            {reactions.map((reaction, index) => (
                <span
                    key={index} className="reaction"
                    onClick={() => handleGetReaction(reaction)}
                >{reaction.icon}</span>
            ))}
        </div>
    );
};


const EmoijPopup = ({ children, placement, trigger, setSelectedReaction, handleTymMessage }) => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={React.createElement(Content, { setSelectedReaction, handleTymMessage })}
            trigger={trigger}
            open={open}
            onOpenChange={handleOpenChange}
            placement={placement}
            overlayClassName="popover-emoij"
            mouseLeaveDelay={0.2}
        >
            {children}
        </Popover>
    )
}

export default EmoijPopup;