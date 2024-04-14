import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { useSelector } from 'react-redux';


const LeaveGroupModal = ({ children }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const chat = useSelector(state => state.appReducer?.subNav);
    const user = useSelector(state => state.appReducer?.userInfo?.user);

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
            <span onClick={showModal}>{children}</span>
            <Modal title="Xác nhận" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Bạn có chắc chắn muốn rời nhóm, mọi tin nhắn sẽ bị xóa</p>
            </Modal>
        </>
    );
};


export default LeaveGroupModal;