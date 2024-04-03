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
        height: 200,
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
                    members.push(item.user1Id === user.id ? item.user2.id : item.user1.id);
                }
            })
            if (members.length < 2) {
                toast.warning('Chọn ít nhất 2 người để tạo nhóm chat');
                return;
            }
            // const members = list.filter(item => {
            //     if (item.checked) {
            //         return item.user1Id === user.id ? item.user2 : item.user1;
            //     }
            // })
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
                setIsModalOpen(false);
                dispatch(accessChat(resCreateGroupRes.data));
            }
        } catch (error) {
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
            if (i.user1Id === item.user1Id && i.user2Id === item.user2Id) {
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
                            {
                                !groupPhoto ?
                                    <i className="fa-solid fa-camera"></i> :
                                    <img className='groupPhoto' src={groupPhoto} />
                            }
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
                                    <div key={item.user1Id + '' + item.user2Id} className='item-friend'>
                                        <Radio
                                            onClick={() => handleCheckFriend(item)}
                                            checked={item.checked}
                                        >
                                            <AvatarUser
                                                image={getFriend(user, [item.user1, item.user2])?.avatar}
                                                size={50}
                                            />
                                            <span className='username'>
                                                {getFriend(user, [item.user1, item.user2])?.userName}
                                            </span>
                                        </Radio>
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
                                    title={<div dangerouslySetInnerHTML={{
                                        __html: `Đã chọn: <span class="dachon">${getDetailListMembers(list).count}/${getDetailListMembers(list).total}</span>`
                                    }}></div>}
                                    placement="right"
                                    closable={true}
                                    onClose={onClose}
                                    open={open}
                                    getContainer={false}
                                >
                                    <div className='list-dachon'>
                                        {
                                            list && list.length > 0 && list.map((item, index) =>
                                                item.checked && (
                                                    <div key={item.user1Id + '' + item.user2Id + 'dachon'} className='item-dachon'>
                                                        <AvatarUser
                                                            image={getFriend(user, [item.user1, item.user2])?.avatar}
                                                            size={20}
                                                        />
                                                        <span className='username'>
                                                            {getFriend(user, [item.user1, item.user2])?.userName}
                                                        </span>
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