import React, { useEffect } from 'react';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';

const InforUserModal = ({ children, userInfo }) => {
    const [profile, setProfile] = useState(null);

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

    const fetchInfoUser = async (userId) => {
        let res = await axios.get(`/users/profile?userId=${userId}`)
        setProfile(res.data);
    }

    useEffect(() => {
        if (userInfo) {
            fetchInfoUser(userInfo?.user?.id);
        }
    }, []);


    return (
        <>
            <span onClick={showModal}>{children}</span>
            <Modal title="Thông tin tài khoản" open={isModalOpen}
                onOk={handleOk} onCancel={handleCancel}
            >
                <div className='modal-background'></div>
            </Modal>
        </>
    )
}

export default InforUserModal;