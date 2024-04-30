import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Button } from "antd";
import AvatarUser from "../user/avatar";
import { ITEMS, KEYITEMS } from "../../utils/keyMenuItem";
import {
    CheckSquareOutlined, MessageOutlined, AntCloudOutlined
} from '@ant-design/icons';
import './sidebar.scss'
import { Popover } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider } from 'antd';
import { changeKeyMenu, changeKeySubMenu, logoutSuccess } from "../../redux/actions/app.action";
import { useNavigate } from "react-router-dom";
import axios from '../../utils/axios';
import { toast } from "react-toastify";
import InforUserModal from "../modal/inforUser.modal";
import WrapperItemSidebar from "./wrapperItem.sidebar";
import { socket } from '../../utils/io';
import { notificationsFriends, fetchNotificationsFriendFunc, fetchNotificationChatFunc, notificationsChats } from "../../redux/actions/user.action";
import SettingModal from "../modal/setting.modal";
import { FRIEND_ITEM_MENU } from "../../pages/sidebar/friend.sidebar";

const Friends = () => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const app = useSelector(state => state.appReducer);


    const onlyRef = useRef(false);
    const stylePhoneBook = {
        fontSize: '24px',
    }

    const dispatch = useDispatch();
    const [count, setCount] = useState(0);

    const handleReadNotifications = async (ids) => {
        await axios.post('/users/notifications/friendShip', { ids });
    }

    const fetchNotifications = async () => {
        const res = await axios.get(`/users/notifications/friendShip?userId=${user?.id}`);
        if (res.errCode === 0) {
            setCount(res.data.length);
            dispatch(notificationsFriends(res.data));
        } else {
            toast.warn('Có lỗi xảy ra !')
        }
    }

    useEffect(() => {
        if (onlyRef.current === false) {
            socket.then(socket => {
                socket.on('need-accept-addFriend', (data) => {
                    if (FRIEND_ITEM_MENU.INVITE_FRIEND === app?.subNav) {
                        handleReadNotifications([data?.id]);
                    } else {
                        fetchNotifications();
                    }
                })
            })
            dispatch(fetchNotificationsFriendFunc(fetchNotifications));
        }
        if (user)
            fetchNotifications();
        onlyRef.current = true;

        return () => {
            onlyRef.current = false;
            socket.then(socket => {
                socket.off('need-accept-addFriend');
            })
        }
    }, [app.subNav]);

    return (
        <WrapperItemSidebar count={count}>
            <i style={{ ...stylePhoneBook }} className="fa-regular fa-address-book"></i>
        </WrapperItemSidebar>
    )
}

const Messages = () => {
    const chat = useSelector(state => state.appReducer?.subNav);
    const dispatch = useDispatch();

    const onlyRef = useRef(false);
    const [count, setCount] = useState(0);

    const fetchChatNotRead = async () => {
        const res = await axios.get('/chat/not-read');
        if (res.errCode === 0) {
            setCount(res.data.length);
            dispatch(notificationsChats(res.data));
        }
    }

    useEffect(() => {
        if (onlyRef.current === false) {
            fetchChatNotRead();
            dispatch(fetchNotificationChatFunc(fetchChatNotRead));
            onlyRef.current = true;
        }
    }, []);

    useEffect(() => {
        socket.then(socket => {
            socket.on('receive-message', (data) => {
                if (chat._id !== data?.chatId)
                    fetchChatNotRead();
            })
        })
    }, []);



    return (
        <WrapperItemSidebar
            count={count}
        >
            <MessageOutlined />
        </WrapperItemSidebar>
    )
}

const items = [Messages, Friends, CheckSquareOutlined, AntCloudOutlined].map(
    (icon, index) => {
        return ({
            key: KEYITEMS[ITEMS[index]],
            icon: React.createElement(icon),
        })
    },
);

const Sidebar = () => {

    const state = useSelector(state => state?.appReducer);
    const dispatch = useDispatch();
    const navigator = useNavigate();

    const updateOnline = async (time) => {
        await axios.put('/users/updateOnline', { time });
    }

    const handleLogout = async () => {
        await updateOnline(new Date());
        socket.then(socket => {
            socket.emit('offline', state?.userInfo?.user?.id)
        })
        let rs = await axios.post('/auth/logout');
        if (rs.errCode === 0) {
            dispatch(logoutSuccess());
            navigator('/login');
        } else {
            updateOnline(null);
            toast.error('Không thể đăng xuất, có lỗi xảy ra !')
        }
    }


    const content = useMemo(() => {
        return (
            <div className="content-popover">
                <InforUserModal
                    friendData={state?.userInfo?.user}
                    type={'button'}
                    itsMe
                >
                    <Button className="user-item" block>Hồ sơ của bạn</Button>
                </InforUserModal>
                <SettingModal>
                    <Button className="user-item"
                        block>Cài đặt
                    </Button>
                </SettingModal>
                <hr />
                <div>
                    <Button
                        className="user-item"
                        block
                        onClick={handleLogout}
                    >Đăng xuất
                    </Button>
                </div>
            </div>
        )
    }, [state]);


    const title = useMemo(() => (
        <div style={{ padding: '8px 12px 0px' }}>
            <h3 style={{ marginBottom: '5px' }}>{state?.userInfo?.user?.userName}</h3>
            <hr />
        </div>
    ), [state]);

    const handleOnSelectItem = (e) => {
        dispatch(changeKeyMenu(e.key));
        dispatch(changeKeySubMenu(''));
    }


    return (
        <div className="sidebar-main">
            <Popover
                content={content}
                title={title}
                placement="rightBottom"
                trigger={"click"}
                style={{ marginBottom: '0' }}
                forceRender
            >
                <div className="base-avatar">
                    <div>
                        <AvatarUser
                            image={state?.userInfo?.user?.avatar}
                            size={50}
                            name={state?.userInfo?.user?.userName}
                        />
                    </div>
                </div>
            </Popover>

            <Menu
                theme="light"
                mode="inline"
                items={items}
                onClick={handleOnSelectItem}
                className='custom-menu'
                defaultSelectedKeys={'ms'}
            />
        </div >
    )
}

export default Sidebar;