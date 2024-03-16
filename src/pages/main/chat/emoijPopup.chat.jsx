import React, { useState } from "react";
import { Popover } from 'antd';
import './emoijPopup.chat.scss';

const Content = () => {
    const reactions = [
        { name: 'like', icon: '👍' },
        { name: 'tym', icon: '❤️' },
        { name: 'haha', icon: '😂' },
        { name: 'bốc cứt', icon: '💩' }, // Thay thế "bỡ ngỡ" bằng biểu tượng "bốc cứt"
        { name: 'khóc', icon: '😢' },
        { name: 'tức giận', icon: '😡' }
    ];

    const handleGetReaction = (reaction) => {
        console.log(reaction.icon);
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


const EmoijPopup = ({ children, placement, trigger }) => {
    const [open, setOpen] = useState(false);
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };
    return (
        <Popover
            content={Content}
            trigger={trigger}
            open={open}
            onOpenChange={handleOpenChange}
            placement={placement}
            overlayClassName="popover-emoij"
            mouseLeaveDelay={0.1}
        >
            {children}
        </Popover>
    )
}

export default EmoijPopup;