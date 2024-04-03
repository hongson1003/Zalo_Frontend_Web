import React, { useEffect, useRef } from 'react';
import { Button, Flex, Modal, Input } from 'antd';
import { useState } from 'react';
import './inforUser.modal.scss';
import axios from '../../utils/axios';
import AvatarUser from '../user/avatar';
import { InstagramOutlined, EditOutlined } from '@ant-design/icons';
import 'react-medium-image-zoom/dist/styles.css'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import { STATE } from '../../redux/types/type.app';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/io';
import { toast } from 'react-toastify';
import { accessChat } from '../../redux/actions/user.action';
import ChooseImageModal from './chooseImage.modal';
import { DatePicker, Radio } from 'antd'
import dayjs from 'dayjs';
import { editUser } from '../../redux/actions/app.action';


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
    const dispatch = useDispatch();
    const [avatar, setAvatar] = useState(null);
    const [image, setImage] = useState(null);
    const [editing, setEditing] = useState(STATE.PENDING);
    const dateFormat = 'YYYY/MM/DD';

    //Handle date
    const [newInfo, setInfo] = useState({
        name: user?.userName,
        gender: 0,
        dob: dayjs(new Date(), dateFormat)
    })

    const onDateChange = (date, dateString) => {
        const newDayInfo = { ...newInfo };
        newDayInfo.dob = date;
        setInfo(newDayInfo);
    }

    useEffect(() => {
        setDescription(`Xin chào, tôi là ${user?.userName}`);
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
        setEditing(STATE.PENDING);
        setNeedAddFriend(STATE.PENDING);
        if (editing) {
            setInfo({
                name: user?.userName,
                dob: profile?.birthdate && dayjs(profile?.birthdate, dateFormat),
                gender: profile?.gender,
            })
        }
    };

    const fetchInfoUser = async (userId) => {
        let res = await axios.get(`/users/profile?userId=${userId}`)
        if (res.errCode === 0) {
            setInfo(pre => ({
                ...pre,
                gender: profile?.gender,
                dob: res.data?.birthdate && dayjs(res.data.birthdate)
            }))
            setProfile(res.data);
        }
    }

    useEffect(() => {
        if (friendData) {
            fetchInfoUser(friendData?.id);
        }
    }, [friendData]);

    const handleOnMouse = (e) => {
        const element = e.target;
        if (element.className === 'modal-footer') {
            element.style.backgroundColor = '#ffffff';
        }
    }

    const handleChangeAvatar = (avatar, image) => {
        setAvatar(avatar);
        setImage(image);
    }

    const handleOpenUpdate = () => {
        modalContentRef.current.className = 'modal-content dissapear';
        if (updateRef.current) {
            updateRef.current.className = 'modal-footer dissapear';
        }
        setTimeout(() => {
            setEditing(true);
        }, 300)
    }

    const handleUpdate = async () => {
        const data = {
            id: user?.id,
            userName: newInfo.name,
            gender: newInfo.gender,
            birthdate: newInfo.dob
        }
        const res = await axios.put('/users/updateInfor', data);
        if (res.errCode === 0) {
            toast.success('Cập nhật thông tin thành công');
            dispatch(editUser({
                ...user,
                userName: data?.userName,
            }));
            fetchInfoUser(user?.id);
        } else
            toast.error(res.message);
        setEditing(STATE.PENDING);
    }

    const renderFooter = () => {
        return (
            <React.Fragment>
                {
                    needAddFriend === false || needAddFriend === STATE.PENDING ?
                        (
                            itsMe &&
                            (
                                editing === false || editing === STATE.PENDING ?
                                    <Flex
                                        justify='center'
                                        gap={10}
                                        className={`modal-footer ${editing === false && 'appear'}`}
                                        ref={updateRef}
                                        onClick={handleOpenUpdate}
                                    >
                                        <EditOutlined style={{ fontSize: '18px' }} />
                                        <p style={{ fontWeight: 'bold' }}>Cập nhật</p>
                                    </Flex > :
                                    <Flex
                                        justify='center'
                                        gap={10}
                                        className={`modal-footer ${true && 'appear'}`}
                                        ref={updateRef}
                                    >
                                        <Button type='default' onClick={handleComeBack}>Hủy</Button>
                                        <Button type='default' className='update-button' onClick={handleUpdate}>Cập nhật</Button>
                                    </Flex >
                            )
                        ) : (
                            <div className={`modal-footer ${needAddFriend && 'appear'}`} onMouseOver={e => handleOnMouse(e)}>
                                <Button type='default' onClick={handleComeBack}>Thông tin</Button>
                                <Button type='dashed' onClick={handleAddFriend}>Thêm bạn</Button>
                            </div>
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
        if (updateRef.current) {
            updateRef.current.className = 'modal-footer dissapear';
        }
        setTimeout(() => {
            setNeedAddFriend(true);
        }, 300)
    }

    const handleComeBack = () => {
        setNeedAddFriend(STATE.PENDING);
        setInfo({
            name: user?.userName,
            dob: profile?.birthdate && dayjs(profile?.birthdate, dateFormat),
            gender: profile?.gender,
        })
        if (editing) {
            setEditing(STATE.PENDING);

        }

    }

    const handleJoinChat = async () => {
        const res = await axios.post('/chat/access', {
            "type": "PRIVATE_CHAT",
            "participants": [user?.id, friendData?.id],
            "status": true
        });
        if (res.errCode == 0 || res.errCode === 2) {
            dispatch(accessChat(res.data));
            handleCancel();
        }
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
            <Modal
                title="Thông tin tài khoản"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={400}
                centered
                footer={renderFooter}
                style={{ borderRadius: "12px", overflow: "auto", padding: "0px" }}
                className='modal-infor-user'
                forceRender
            >
                {
                    friendData &&
                    <Zoom>
                        <img src={`${profile?.coverImage}`} className='modal-background' />
                    </Zoom>
                }
                <div className='modal-avatar'>
                    <div className='modal-avatar-info'>
                        <AvatarUser
                            image={friendData?.avatar}
                            name={friendData?.userName}
                            zoom size={50}
                        >

                            {itsMe &&
                                <ChooseImageModal
                                    type='avatar'
                                    handleChangeAvatar={handleChangeAvatar}
                                    avatar={avatar}
                                    image={image}
                                >
                                    <div className='camara-container'>
                                        <InstagramOutlined />
                                    </div>
                                </ChooseImageModal>
                            }

                        </AvatarUser>
                        <div className='top-10px'>
                            <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{!itsMe ? friendData?.userName : user?.userName}</span>
                            <EditOutlined style={{ fontSize: '18px', cursor: 'pointer' }}
                                onClick={handleOpenUpdate}
                            />
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
                            >
                            </textarea>

                        </div>
                    }
                    {/* Sửa thông tin nè */}
                    {
                        editing === true && (
                            <div className='editing-content'>
                                <div className='name-info-item'>
                                    <p className='item-label'>Tên hiển thị:</p>
                                    <Input className='new-name'
                                        type='text'
                                        value={newInfo.name}
                                        onChange={(evt) => {
                                            const newNameInfo = { ...newInfo };
                                            newNameInfo.name = evt.target.value;
                                            setInfo(newNameInfo);
                                        }}
                                        spellCheck={false}
                                    />
                                </div>
                                <p className='info-title'>Thông tin cá nhân</p>
                                <div className='gender-info-item'>
                                    <Radio.Group defaultValue={profile?.gender} onChange={(evt) => {
                                        const newGenderInfo = { ...newInfo };
                                        newGenderInfo.gender = +evt.target.value;
                                        setInfo(newGenderInfo);
                                    }}>
                                        <Radio value={0}>Nam</Radio>
                                        <Radio value={1}>Nữ</Radio>
                                    </Radio.Group>
                                </div>
                                <div className='dob-info-item'>
                                    <p className='item-label'>Ngày sinh:</p>
                                    <DatePicker
                                        className='birthday'
                                        format='DD-MM-YYYY'
                                        onChange={onDateChange}
                                        value={newInfo.dob && dayjs(newInfo.dob, dateFormat)}
                                    />
                                </div>
                            </div>
                        )
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
                            <Button type='default' onClick={handleJoinChat}>Nhắn tin</Button>
                        </div>
                    }
                </div>
                {
                    (needAddFriend === STATE.PENDING && editing === STATE.PENDING) &&
                    <div
                        className={`modal-content ${needAddFriend === false || editing === false && 'appear'}`}
                        ref={modalContentRef}>
                        <div className='title'>
                            <p>Thông tin cá nhân</p>
                        </div>
                        <div className='info-detail'>
                            <div className='info-item'>
                                <p className='item-label'>Giới tính:</p>
                                <p className='item-value'>{([0, 1].includes(profile?.gender)) ? (profile?.gender === 0 ? 'Nam' : 'Nữ') : '---'}</p>
                            </div>
                            <div className='info-item'>
                                <p className='item-label'>Ngày sinh:</p>
                                <p className='item-value'>{profile?.birthdate ? moment(profile?.birthdate).format('DD/MM/yyyy') : '---'}</p>
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