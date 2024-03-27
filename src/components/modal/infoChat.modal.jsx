import React, { useEffect, useRef } from 'react';
import { Button, Flex, Modal } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';
import 'react-medium-image-zoom/dist/styles.css';
import './infoChat.modal.scss';

const InforUserModal = ({ children }) => {
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
        <>
            <span className='infor-user-modal'
                onClick={() => {
                    setTimeout(() => {
                        showModal();
                    }, 50);
                }}
            >{children}</span >
            <Modal title="Thông tin nhóm" open={isModalOpen}
                onOk={handleOk} onCancel={handleCancel} width={400} centered
                style={{ borderRadius: "12px", overflow: "auto", padding: "0px" }}
                className='modal-infor-group'
            >
                <div>Hi cậu</div>

            </Modal >
        </>
    )
}

export default InforUserModal;