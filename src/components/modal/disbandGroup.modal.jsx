import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import './disbandGroup.modal.scss';
import { Input } from 'antd';
import { Radio } from 'antd';
import AvatarUser from '../user/avatar';
import axios from '../../utils/axios';
import { accessChat } from '../../redux/actions/user.action';
import { socket } from '../../utils/io';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';

const DisbandGroupModal = ({ children }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const chat = useSelector(state => state.appReducer?.subNav);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const [value, setValue] = useState('');
    const dispatch = useDispatch();
    const stateUser = useSelector(state => state.userReducer);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        const res = await axios.put('/chat/grantGroupLeader', {
            memberId: value.id,
            chatId: chat._id
        })
        const kq = await sendNotifyToChatRealTime(chat._id,
            `${user?.userName} đã rời nhóm, ${value.userName} đã trở thành nhóm trưởng.`
        );
        if (res.errCode === 0 && kq === true) {
            socket.then(socket => {
                socket.emit('transfer-disband-group', { _id: chat._id });
                dispatch(accessChat(null));
                stateUser.fetchChats();
            })
        }
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onChange = (e) => {
        setValue(e.target.value);
    };



    return (
        <>
            <span onClick={showModal}>{children}</span>
            <Modal
                title="Chọn nhóm trưởng mới trước khi rời nhóm"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <hr />
                <div className='disband-content'>
                    <Input
                        prefix={<i className="fa-solid fa-magnifying-glass"></i>}
                    />
                    <div className='disband-main'>
                        <Radio.Group
                            onChange={onChange}
                            value={value}
                            className='group-radio'
                        >
                            {
                                chat?.participants?.map(item => {
                                    if (item.id === user.id) return null;
                                    return (
                                        <Radio
                                            value={item}
                                            key={item.id}
                                            checked={item.id === value.id}
                                        >
                                            <div className='group-radio-item'>
                                                <AvatarUser
                                                    name={item?.userName}
                                                    image={item?.avatar}
                                                />
                                                <p>{item?.userName}</p>
                                            </div>
                                        </Radio>
                                    )
                                })
                            }

                        </Radio.Group>
                    </div>
                </div>
                <hr />

            </Modal>
        </>
    );
};


export default DisbandGroupModal;