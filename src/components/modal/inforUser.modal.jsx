import React, { useEffect, useRef } from 'react';
import { Button, Flex, Modal } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';
import AvatarUser from '../user/avatar';
import { InstagramOutlined, EditOutlined } from '@ant-design/icons';
import 'react-medium-image-zoom/dist/styles.css'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import { STATE } from '../../redux/types/type.app';
import { useSelector } from 'react-redux';
import { socket } from '../../utils/io';
import { toast } from 'react-toastify';

const InforUserModal = ({ children, friendData, friendShipData, type, handleOk: myHandleOk, fetchFriendShip, itsMe }) => {
    const [profile, setProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [acceptOpenModal, setAcceptOpenModal] = useState(false);
    const user = useSelector(state => state?.appReducer?.userInfo?.user);
    const [needAddFriend, setNeedAddFriend] = useState(STATE.PENDING);
    const modalContentRef = useRef(null);
    const actionRef = useRef(null);
    const updateRef = useRef(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        setDescription(`Xin chào, tôi là ${friendData?.userName}`);
    }, [friendData])

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setAcceptOpenModal(false);
    };

    const fetchInfoUser = async (userId) => {
        let res = await axios.get(`/users/profile?userId=${userId}`)
        setProfile(res.data);
    }

    useEffect(() => {
        if (friendData) {
            fetchInfoUser(friendData?.id);
        }
    }, [friendData]);

    const handleSetting = () => {
        console.log('setting')
    };


    const handleOnMouse = (e) => {
        const element = e.target;
        if (element.className === 'modal-footer') {
            element.style.backgroundColor = '#ffffff';
        }
    }



    const renderFooter = () => {
        return (
            <React.Fragment>
                {
                    !itsMe && (
                        needAddFriend === false || needAddFriend === STATE.PENDING ?
                            <Flex justify='center' gap={10} className={`modal-footer ${needAddFriend === false && 'appear'}`} ref={updateRef}>
                                <EditOutlined style={{ fontSize: '18px' }} />
                                <p style={{ fontWeight: 'bold' }}>Cập nhật</p>
                            </Flex > : (
                                <div className='modal-footer' onMouseOver={e => handleOnMouse(e)}>
                                    <Button type='default' onClick={() => handleComeBack()}>Thông tin</Button>
                                    <Button type='default' onClick={() => handleAddFriend()}>Thêm bạn</Button>
                                </div>
                            )
                    )
                }
            </React.Fragment>
        )
    }

    const handleAddFriend = async () => {
        const res = await axios.post('/users/friendShip',
            { userId: friendData?.id, content: description }
        );
        if (res.errCode === 0) {
            fetchFriendShip(friendData?.id);
            socket.then(socket => {
                socket.emit('send-add-friend', friendData);
            })
            handleCancel();
        } else {
            toast.warn(res.message);
        }

    }
    useEffect(() => {
        if (friendData && acceptOpenModal) {
            showModal();
        } else {
            if (acceptOpenModal) {
                setAcceptOpenModal(false);
            }
        }
    }, [acceptOpenModal])

    const handleNeedAddFriend = () => {
        modalContentRef.current.className = 'modal-content dissapear';
        actionRef.current.className = 'add-friends dissapear';
        updateRef.current.className = 'modal-footer dissapear';
        setTimeout(() => {
            setNeedAddFriend(true);
        }, 500)
    }

    const handleComeBack = () => {
        setNeedAddFriend(false);
    }


    return (
        <>
            <span
                onClick={() => {
                    if (type === 'button') {
                        setTimeout(() => {
                            if ((!friendShipData && myHandleOk)) {
                                myHandleOk();
                            }
                            setAcceptOpenModal(true);
                        }, 50);
                    }
                }}
                onKeyDown={async e => {
                    if (e.key === 'Enter') {
                        const result = await myHandleOk();
                        if (result)
                            setTimeout(() => {
                                // showModal();
                                setAcceptOpenModal(true);
                            }, 50);
                    }
                }}
            >{children}</span >
            <Modal title="Thông tin tài khoản" open={isModalOpen}
                onOk={handleOk} onCancel={handleCancel} width={400} centered
                footer={renderFooter} style={{ borderRadius: "12px", overflow: "auto", padding: "0px" }}
                className='modal-infor-user'
            >
                {
                    friendData &&
                    <Zoom>
                        <img src={`${profile?.coverImage}`} className='modal-background' />
                    </Zoom>
                }
                <div className='modal-avatar'>
                    <div className='modal-avatar-info'>
                        <AvatarUser image={friendData?.avatar} zoom size={50}>
                            <div className='camara-container' onClick={handleSetting}>
                                <InstagramOutlined />
                            </div>
                        </AvatarUser>
                        <div className='top-10px'>
                            <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{friendData?.userName}</span>
                            <EditOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                        </div>
                    </div>
                    {
                        needAddFriend === true &&
                        <div className='description-modal'>
                            <textarea
                                className='text-description'
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                spellCheck={false}
                            ></textarea>

                        </div>
                    }
                    {
                        !itsMe && user?.id !== friendData?.id && (needAddFriend === false || needAddFriend === STATE.PENDING) &&
                        <div className={`add-friends ${needAddFriend === false && 'appear'}`} ref={actionRef}>
                            {
                                friendShipData?.status === STATE.RESOLVE ?
                                    <Button type='default'>Gọi điện</Button> :
                                    (
                                        friendShipData?.status === STATE.REJECT || !friendShipData?.status ?
                                            <Button type='default' onClick={() => handleNeedAddFriend()}>Thêm bạn</Button> :
                                            (
                                                friendShipData?.status === STATE.PENDING && friendShipData?.user1?.id === user?.id ?
                                                    <Button type='default' onClick={() => handleAddFriend()}>Thu hồi lời mời</Button> :
                                                    <Button type='default' onClick={() => handleAddFriend()}>Chấp nhận kết bạn</Button>
                                            )
                                    )
                            }
                            <Button type='default'>Nhắn tin</Button>
                        </div>
                    }
                </div>
                {
                    (needAddFriend === false || needAddFriend === STATE.PENDING) &&
                    <div className={`modal-content ${needAddFriend === false && 'appear'}`} ref={modalContentRef}>
                        <div className='title'>
                            <p>Thông tin cá nhân</p>
                        </div>
                        <div className='info-detail'>
                            <div className='info-item'>
                                <p className='item-label'>Giới tính:</p>
                                <p className='item-value'>{profile?.gender ? 'Nam' : 'Nữ'}</p>
                            </div>
                            <div className='info-item'>
                                <p className='item-label'>Ngày sinh:</p>
                                <p className='item-value'>{moment(profile?.birthdate).format('DD/MM/yyyy')}</p>
                            </div>
                            <div className='info-item'>
                                <p className='item-label'>Số điện thoại:</p>
                                <p className='item-value'>{friendData?.phoneNumber}</p>
                            </div>
                            <div className='info-item'>
                                <p className='item-label note'>Chỉ bạn bè có lưu số của bạn trong danh bạn máy xem được số này</p>
                            </div>
                        </div>
                    </div>
                }
            </Modal >
        </>
    )
}

export default InforUserModal;