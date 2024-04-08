import React, { useState } from 'react';
import { Modal } from 'antd';
import './pins.modal.scss';
import { MESSAGES } from '../../redux/types/type.user';

const PinsModal = ({ children, data, handleFindMessageFirst }) => {
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

    return (
        <div>
            <span onClick={showModal}>{children}</span>
            <Modal
                title="Tin nhắn đã ghim"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <div className='pined-modal'>
                    {
                        data && data.length > 0 &&
                        data.map(({ message, ref }) => {
                            return (
                                <div
                                    key={message._id}
                                    onClick={() => {
                                        handleFindMessageFirst(ref);
                                        handleOk();
                                    }}
                                    className='pined-message'
                                >
                                    <p>{message?.sender?.userName}</p>
                                    {
                                        <p>{message.content}</p> ? (
                                            message.type === MESSAGES.IMAGES ?
                                                <p>Đã gửi ảnh</p> : (
                                                    message.type === MESSAGES.FILE_FOLDER ?
                                                        <p>File</p> : <p>Sticker</p>
                                                )
                                        ) : ''
                                    }
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