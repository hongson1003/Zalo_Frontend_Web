import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import './grant.modal.scss';
import AvatarUser from '../user/avatar';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../utils/axios';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { editGroup } from '../../redux/actions/app.action';
import { socket } from '../../utils/io';

const GrantModal = ({ children, chat }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const [selected, setSelected] = useState(null);


    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        const res = await axios.put('/chat/group/grant', {
            chatId: chat._id,
            memberId: selected.id
        });

        const kq = await sendNotifyToChatRealTime(chat._id, `🎉 ${selected.userName} đã trở thành trưởng nhóm 🎉`)
        if (res.errCode === 0 && kq === true) {
            dispatch(editGroup(res.data));
            socket.then(socket => {
                socket.emit('grant', res.data);
            })
        }
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setSelected(null);
        setIsModalOpen(false);
    };

    const handleGrantLeader = async (item) => {
        setSelected(item);
    }

    return (
        <>
            <span onClick={showModal}>
                {children}
            </span>
            <Modal title="Chuyển quyền trưởng nhóm" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div className='grant-modal-container'>
                    <div className='note'>
                        Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý nhóm.
                        Bạn sẽ mất quyền quản lý nhưng vẫn là một thành viên của nhóm. Hành động này không thể khôi phục.
                    </div>
                    <div className='main-content'>
                        {
                            chat?.participants?.map((item, index) => {
                                if (user?.id !== item.id) {
                                    return (
                                        <div key={index} className={`group-user ${selected?.id === item.id ? 'selected' : ''}`}
                                            onClick={() => handleGrantLeader(item)}

                                        >
                                            <AvatarUser
                                                image={item?.avatar}
                                                name={item?.userName}
                                            />
                                            <p className='name'>{item?.userName}</p>
                                        </div>
                                    )
                                } else return null
                            })
                        }
                    </div>
                </div>
            </Modal>
        </>
    );
};
export default GrantModal;