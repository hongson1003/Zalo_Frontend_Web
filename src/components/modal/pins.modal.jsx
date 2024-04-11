import React, { useState } from 'react';
import { Modal } from 'antd';
import './pins.modal.scss';
import { MESSAGES } from '../../redux/types/type.user';
import axios from '../../utils/axios';

const PinsModal = ({ children, data, handleFindMessageFirst, fetchChats }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOnClickUnpin = async (message) => {
        const res = await axios.put('/chat/message/unPinMessage', { messageId: message._id });
        if (res.errCode === 0) {
            fetchChats();
            handleOk();
        }
    }

    return (
        <div>
            <span onClick={showModal}>{children}</span>
            <Modal
                title="Tin nhắn đã ghim"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                forceRender
            >
                <div className='pined-modal'>
                    {
                        data && data.length > 0 &&
                        data.map(({ message, ref }) => {
                            return (
                                <div
                                    key={message._id}
                                    className='pined-message'
                                >
                                    <p>{message?.sender?.userName}:</p>
                                    <p
                                        className='pined-item-content'
                                        onClick={() => {
                                            handleFindMessageFirst(ref);
                                            handleOk();
                                        }}
                                    >
                                        {
                                            message?.type === MESSAGES.TEXT ?
                                                message?.content : (
                                                    message?.type === MESSAGES.IMAGES ? 'Đã gửi ảnh' : (
                                                        message?.type === MESSAGES.FILE_FOLDER ? 'Đã gửi file' : (
                                                            message?.type === MESSAGES.VIDEO ? 'Đã gửi video' : (
                                                                message?.type === MESSAGES.STICKER ? 'Đã gửi sticker' : ''
                                                            )
                                                        )
                                                    )
                                                )
                                        }
                                    </p>

                                    <p className='unpin-item'>
                                        <i className="fa-solid fa-delete-left unpin"
                                            onClick={() => handleOnClickUnpin(message)}
                                        ></i>
                                    </p>
                                </div>
                            )
                        })
                    }
                </div>
            </Modal>
        </div>
    )
}

export default PinsModal;