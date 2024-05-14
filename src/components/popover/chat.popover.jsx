import React, { useState } from "react";
import { Popover } from 'antd';
import './chat.popover.scss';
import { useSelector } from "react-redux";
import axios from '../../utils/axios';
import { Popconfirm } from 'antd';
import { toast } from "react-toastify";


const content = ({ chat, handleOpenChange }) => {
    const user = useSelector(state => state.appReducer.userInfo.user);
    const userState = useSelector(state => state.userReducer);

    const handlePin = async () => {
        const res = await axios.put('/chat/pin', { chatId: chat._id });
        if (res.errCode === 0) {
            toast.success('Đã ghim hộp thoại thành công');
        } else if (res.errCode === 3) {
            toast.success('Đã bỏ ghim hộp thoại thành công');
        } else {
            toast.warn('Ghim hộp thoại thất bại');
        }
        userState.fetchChats();
        handleOpenChange(false);
    }

    const handleDeleteChat = async () => {
        const res = await axios.delete('/chat/delete', { data: { chatId: chat._id } });
        if (res.errCode === 0) {
            return true;
        } else {
            return false;
        }
    }

    const confirm = async () => {
        if (await handleDeleteChat()) {
            toast.success('Đã xóa hộp thoại thành công');
            userState.fetchChats();
        } else
            toast.warn('Xóa hộp thoại thất bại');

    };
    const cancel = () => {

    };


    return (
        <div className="chat-popover">
            <p onClick={handlePin}>{chat.listPin.includes(user.id) ? 'Bỏ ghim' : 'Ghim hội thoại'}</p>
            <Popconfirm
                title="Bạn có chắc chắn muốn xóa hội thoại này không?"
                description="Toàn bộ nội dung sẽ được xóa vĩnh viên, bạn có chắc chắn muốn xóa không ?"
                onConfirm={confirm}
                onCancel={cancel}
                okText="Xóa"
                cancelText="Không"
            >
                <p className="delete">
                    Xóa hội thoại
                </p>
            </Popconfirm>

            <p>Thêm vào nhóm</p>
            <p>Tắt thông báo</p>
        </div>
    )
}


const ChatPopover = ({ children, chat }) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (open) => {
        setOpen(open);
    }

    return (
        <Popover
            content={React.createElement(content, { chat, handleOpenChange })}
            trigger={['click']}
            open={open}
            onOpenChange={handleOpenChange}
        >
            <span>{children}</span>
        </Popover>
    )
}

export default ChatPopover;