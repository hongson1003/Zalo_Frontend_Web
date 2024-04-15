import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import './addMember.modal.scss';
import { Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
const CheckboxGroup = Checkbox.Group;
import axios from '../../utils/axios';
import { getFriend, sendNotifyToChatRealTime } from '../../utils/handleChat';
import AvatarUser from '../user/avatar';
import { editGroup } from '../../redux/actions/app.action';
import { socket } from '../../utils/io';

const AddMemberModal = ({ children, chat }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const stateUser = useSelector(state => state.userReducer);
    const [disableMembers, setDisableMembers] = useState([]);

    const [checkedList, setCheckedList] = useState([]);
    const [plainOptions, setPlainOptions] = useState([]);

    const dispatch = useDispatch();


    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        const res = await axios.put('/chat/addMembers', {
            chatId: chat._id,
            members: checkedList.map(item => JSON.parse(item).id)
        })
        const kq = await sendNotifyToChatRealTime(chat._id,
            `${user?.userName} đã thêm thành viên vào nhóm.`
        )
        if (res.errCode === 0 && kq === true) {
            dispatch(editGroup(res.data));
            socket.then(socket => {
                socket.emit('add-member', res.data);
                stateUser.fetchChats();
            })
        }
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchFriends = async () => {
        const res = await axios.get('/users/friends?page=1&limit=10');
        if (res.errCode === 0) {
            const data = res.data;
            const friends = [];
            data.forEach(item => {
                friends.push(getFriend(user, [item.user1, item.user2]));
            })
            setPlainOptions(friends);
        }
    }

    const handleCheckMembersChat = async () => {
        const participants = chat?.participants;
        const members = [];
        participants.forEach(item => {
            if (user.id !== item.id) {
                members.push(JSON.stringify(item));
            }
        })
        setDisableMembers(members);
        setCheckedList(members);
    }

    const onChange = (list) => {
        setCheckedList(list);
    };

    useEffect(() => {
        fetchFriends();
        handleCheckMembersChat();
    }, [chat._id])



    return (
        <>
            <span onClick={showModal}>
                {children}
            </span>
            <Modal
                title="Thêm thành viên"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                forceRender={true}
            >
                <div className='add-member-modal'>
                    <header>
                        <Input placeholder='Nhập tên tìm kiếm' />
                    </header>
                    <div className='list-main'>
                        {
                            plainOptions && plainOptions.length > 0 &&
                            <CheckboxGroup
                                options={plainOptions.map(item => {
                                    return {
                                        label:
                                            <div className='group-friend'>
                                                <AvatarUser
                                                    image={item?.avatar}
                                                    name={item?.userName}
                                                />
                                                <p>{item?.userName}</p>
                                            </div>,
                                        value: JSON.stringify(item),
                                        disabled: disableMembers.includes(JSON.stringify(item))
                                    }
                                })}
                                value={checkedList}
                                onChange={onChange}
                                className='list-friend'
                            />
                        }
                    </div>
                </div>
            </Modal>
        </>
    );
};
export default AddMemberModal;