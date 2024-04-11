import React, { useEffect, useRef } from 'react';
import { Button, Flex, Modal } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';
import 'react-medium-image-zoom/dist/styles.css';
import './infoGroup.modal.scss';
import { useSelector } from 'react-redux';
import { Avatar } from 'antd';
import AvatarUser from '../../components/user/avatar';


const InforUserModal = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chat = useSelector(state => state.appReducer?.subNav);

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
            >
                <div className='info-group-container'>
                    <div className='header'>
                        <img className='groupPhoto' src={chat?.groupPhoto} />
                        <p>{chat?.name}</p>
                        <p>
                            <i className="fa-solid fa-pen-to-square"></i>
                        </p>
                    </div>
                    <div className='send-message'>
                        <Button className='send-btn' type="default">Nhắn tin</Button>
                    </div>
                    <div className='members'>
                        {
                            chat?.participants?.map((item, index) => {
                                return (
                                    <div className='member' key={item.id}>
                                        <AvatarUser
                                            image={item?.avatar}
                                            name={item?.userName}
                                            zoom size={50}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

            </Modal >
        </>
    )
}

export default InforUserModal;