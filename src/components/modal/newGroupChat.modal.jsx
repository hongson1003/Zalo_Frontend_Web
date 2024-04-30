import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import './newGroupChat.modal.scss';
import { Radio, Drawer, Input, theme } from 'antd';
import axios from '../../utils/axios';
import AvatarUser from '../user/avatar';
import { getFriend } from '../../utils/handleChat';
import { useSelector, useDispatch } from 'react-redux';
import { getDetailListMembers } from '../../utils/handleChat';
import ChooseImageModal from './chooseImage.modal';
import { toast } from 'react-toastify';
import { CHAT_STATUS } from '../../redux/types/type.user';
import { accessChat } from '../../redux/actions/user.action';
import { socket } from '../../utils/io';


const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;


const NewGroupChatModal = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(30);
    const [list, setList] = useState([]);
    const user = useSelector(state => state?.appReducer?.userInfo?.user);
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(false);
    const [groupPhoto, setGroupPhoto] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchGroupPhotos = async () => {
            const response = await fetch("/groupPhoto/data.json");
            const images = await response.json();
            setCollections(images);
        }
        if (user) {
            fetchGroupPhotos();
        }
    }, []);

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    const containerStyle = {
        position: 'relative',
        height: 400,
        padding: 48,
        overflow: 'hidden',
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };


    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const members = [];
            list.forEach(item => {
                if (item.checked) {
                    members.push(item.sender.id === user.id ? item.receiver.id : item.sender.id);
                }
            })
            if (members.length < 2) {
                toast.warning('Chọn ít nhất 2 người để tạo nhóm chat');
                return;
            }
            if (!name.trim()) {
                toast.warning('Nhập tên nhóm chat');
                return;
            }
            let imageUrl = '';
            setIsLoading(true);
            if (!file) {
                imageUrl = groupPhoto;
            } else {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                    method: 'POST',
                    body: file,
                });
                const res = await response.json();
                imageUrl = res.url;
            }
            // get res.url và lưu vào csdl
            const payload = {
                name: name,
                type: CHAT_STATUS.GROUP_CHAT,
                groupPhoto: imageUrl,
                participants: members,
            };
            const resCreateGroupRes = await axios.post('/chat/group', payload);
            setIsLoading(false);
            if (resCreateGroupRes.errCode === 0) {
                socket.then(socket => {
                    socket.emit('join-room', resCreateGroupRes.data._id);
                    dispatch(accessChat(resCreateGroupRes.data));
                    setIsModalOpen(false)
                    socket.emit('new-group-chat', resCreateGroupRes.data);
                })
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            toast.error('Upload ảnh thất bại');
        }
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchFriends = async () => {
        const res = await axios.get(`/users/friends?page=${page}&limit=${limit}`)
        if (res.errCode === 0) {
            const data = res.data;
            if (data?.length > 0) {
                data.forEach(item => item.checked = false);
            }
            setList(data);
        }
    }

    const handleCheckFriend = (item) => {
        if (!open) {
            showDrawer();
            setSelected(true);
        }
        const newList = list.map(i => {
            if (i.sender.id === item.sender.id && i.receiver.id === item.receiver.id) {
                i.checked = !i.checked;
            }
            return i;
        })
        setList(newList);
    }

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [])


    const renderFooter = () => {
        return (
            <div className='group-chat-footer'>
                <Button type='default' onClick={handleCancel}>Quay lại</Button>
                <Button type="primary" onClick={handleOk} loading={isLoading}>Tạo nhóm</Button>
            </div>

        )
    }

    const removeMember = (item) => {
        const newList = list.map(i => {
            if (i.sender.id === item.sender.id && i.receiver.id === item.receiver.id) {
                i.checked = false;
            }
            return i;
        })
        setList(newList);
    }
    const handleRemoveAll = () => {
        const newList = list.map(i => {
            i.checked = false;
            return i;
        })
        setList(newList);
    }


    return (
        <>
            <span onClick={showModal}>{children}</span>
            <Modal
                title="Tạo nhóm"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className='group-chat-modal'
                size='xxl'
                footer={renderFooter}
            >
                <div className='group-chat-name'>
                    <ChooseImageModal
                        setGroupPhoto={setGroupPhoto}
                        setFile={setFile}
                        data={collections}
                    >
                        <div className='element-modal-groupPhoto'>
                            <div className='element-modal-groupPhoto'>
                                {
                                    !groupPhoto ?
                                        <i className="fa-solid fa-camera"></i> :
                                        <img className='groupPhoto' src={groupPhoto} />
                                }
                            </div>
                        </div>
                    </ChooseImageModal>
                    <div className='element-input'>
                        <Input
                            value={name}
                            placeholder="Nhập tên nhóm ..."
                            onChange={(e) => {
                                setName(e.target.value)
                            }}
                            spellCheck="false"
                        />
                    </div>
                </div>

                <div className='group-chat-search-main'>
                    <Input
                        placeholder="Nhập tên, số điện thoại hoặc danh sách số điện thoại ..."
                        allowClear
                        variant="outlined"
                        spellCheck="false"
                    />
                </div>
                <hr />
                <div className='list-friends-main'>
                    <div className='main-left'>
                        {
                            list && list.length > 0 && list.map((item, index) => {
                                return (
                                    <div key={item.sender.id + '' + item.receiver.id} className='item-friend'>
                                        <Radio
                                            onClick={() => handleCheckFriend(item)}
                                            checked={item.checked}
                                        >
                                            <AvatarUser
                                                image={getFriend(user, [item.sender, item.receiver])?.avatar}
                                                size={50}
                                                name={getFriend(user, [item.sender, item.receiver])?.userName}
                                            />
                                        </Radio>
                                        <span className='username'>
                                            {getFriend(user, [item.sender, item.receiver])?.userName}
                                        </span>
                                    </div>
                                )
                            })
                        }
                    </div>

                    {
                        selected && (
                            <div className='main-right'
                                style={containerStyle}
                            >
                                <Drawer
                                    title={
                                        <div className='main-title'>
                                            <span className="dachon">Đã chọn: {getDetailListMembers(list).count}/{getDetailListMembers(list).total}</span>
                                            <p className="delele-all" onClick={handleRemoveAll}>Xóa tất cả</p>
                                        </div>
                                    }
                                    placement="right"
                                    closable={true}
                                    onClose={onClose}
                                    open={open}
                                    getContainer={false}
                                    height={300}
                                    forceRender

                                >
                                    <div className='list-dachon'>
                                        {
                                            list && list.length > 0 && list.map((item, index) =>
                                                item.checked && (
                                                    <div key={item.sender.id + '' + item.receiver.id + 'dachon'} className='item-dachon'>
                                                        <AvatarUser
                                                            image={getFriend(user, [item.sender, item.receiver])?.avatar}
                                                            size={20}
                                                            name={getFriend(user, [item.sender, item.receiver])?.userName}
                                                        />
                                                        <span className='username'>
                                                            {getFriend(user, [item.sender, item.receiver])?.userName}
                                                        </span>
                                                        <p className='action'>
                                                            <i className="fa-regular fa-circle-xmark"
                                                                onClick={() => removeMember(item)}
                                                            ></i>
                                                        </p>
                                                    </div>
                                                ))
                                        }
                                    </div>
                                </Drawer>
                            </div>
                        )
                    }
                </div>

            </Modal >
        </>
    );
}

export default NewGroupChatModal;