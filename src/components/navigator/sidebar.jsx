import React, { useEffect, useRef, useState } from "react";
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
import { changeKeySubMenu, logoutSuccess } from "../../redux/actions/app.action";
import { useNavigate } from "react-router-dom";
import axios from '../../utils/axios';
import { toast } from "react-toastify";
import InforUserModal from "../modal/inforUser.modal";
import WrapperItemSidebar from "./wrapperItem.sidebar";
import { socket } from '../../utils/io';
import { STATE } from "../../redux/types/type.app";
import { notificationsFriends } from "../../redux/actions/user.action";

const friends = () => {
    const user = useSelector(state => state?.appReducer?.userInfo?.user);
    const onlyRef = useRef(false);
    const stylePhoneBook = {
        fontSize: '24px',
    }
    const dispatch = useDispatch();
    const [count, setCount] = useState(0);
    const fetchNotifications = async () => {
        const res = await axios.get(`/users/notifications/friendShip/noread?userId=${user?.id}`);
        if (res.errCode === 0) {
            setCount(res.data.length);
            const resAll = await axios.get(`/users/notifications/friendShip?userId=${user?.id}`);
            if (resAll.errCode === 0) {
                dispatch(notificationsFriends(resAll.data));
            } else {
                toast.warn('Có lỗi xảy ra !')
            }
        } else {
            toast.warn('Có lỗi xảy ra !')
        }
    }
    useEffect(() => {
        if (onlyRef.current === false) {
            socket.then(socket => {
                socket.on('need-accept-addFriend', (data) => {
                    fetchNotifications();
                })
            })
        }
        fetchNotifications();
        onlyRef.current = true;
    }, [])



    return (
        <WrapperItemSidebar count={count}>
            <i style={{ ...stylePhoneBook }} className="fa-regular fa-address-book"></i>
        </WrapperItemSidebar>
    )
}

const items = [MessageOutlined, friends, CheckSquareOutlined, AntCloudOutlined].map(
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

    const handleLogout = async () => {
        let rs = await axios.post('/auth/logout');
        if (rs.errCode === 0) {
            dispatch(logoutSuccess());
            navigator('/login');
        } else {
            toast.error('Không thể đăng xuất, có lỗi xảy ra !')
        }
    }


    const content = (
        <div className="content-popover">
            <ConfigProvider
                theme={{
                    token: {
                        // Seed Token
                        colorPrimary: '#333',
                        borderRadius: 2,
                    },
                }}
            >
                <InforUserModal
                    friendData={state?.userInfo?.user}
                    type={'button'}
                >
                    <Button block>Hồ sơ của bạn</Button>
                </InforUserModal>
                <Button style={{ marginBottom: '10px' }} block>Cài đặt</Button>
                <hr />
                <div style={{ marginTop: '10px' }}>
                    <Button block
                        onClick={handleLogout}
                    >Đăng xuất
                    </Button>
                </div>
            </ConfigProvider>
        </div>
    );


    const title = (
        <div>
            <h3 style={{ marginBottom: '10px' }}>{state?.userInfo?.user?.userName}</h3>
            <hr />
        </div>
    )

    const handleOnSelectItem = (e) => {
        dispatch({ type: STATE.CHANGE_KEY_MENU, payload: e.key });
        dispatch(changeKeySubMenu(''));
    }


    return (
        <div className="sidebar-main">
            <Popover
                content={content}
                title={title}
                placement="rightBottom"
                trigger={"click"}
            >
                <div className="base-avatar">
                    <div>
                        <AvatarUser
                            image={state?.userInfo?.user?.avatar}
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