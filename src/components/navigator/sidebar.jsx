import React, { useEffect, useState } from "react";
import { Menu, Button } from "antd";
import AvatarUser from "../user/avatar";
import { ITEMS, KEYITEMS } from "../../utils/keyMenuItem";
import {
    CheckSquareOutlined, ContactsOutlined, MessageOutlined, AntCloudOutlined
} from '@ant-design/icons';
import './sidebar.scss'
import { Popover } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider } from 'antd';
import { logoutSuccess } from "../../redux/actions/action.app";
import { useNavigate } from "react-router-dom";
import axios from '../../utils/axios';
import { toast } from "react-toastify";

const items = [MessageOutlined, ContactsOutlined, CheckSquareOutlined, AntCloudOutlined].map(
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
                <Button block>Hồ sơ của bạn</Button>
                <Button style={{ marginBottom: '10px' }} block>Cài đặt</Button>
                <hr />
                <div style={{ marginTop: '10px' }}>
                    <Button block
                        onClick={handleLogout}
                    >Đăng xuất</Button>
                </div>
            </ConfigProvider>
        </div>
    );


    const title = (
        <div>
            <h3 style={{ marginBottom: '10px' }}>{state?.userInfo?.user?.name}</h3>
            <hr />
        </div>
    )

    const handleOnSelectItem = (e) => {
        console.log(e);
    }

    const handleOpenPopUpAvatar = () => {

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
                    <div
                        onClick={handleOpenPopUpAvatar}
                    >
                        <AvatarUser
                            image={state?.userInfo?.user?.avatar}
                        />
                    </div>
                </div>
            </Popover>

            <Menu
                theme="light"
                mode="inline"
                defaultSelectedKeys={'ms'}
                items={items}
                onClick={handleOnSelectItem}
                className='custom-menu'
            />
        </div >
    )
}

export default Sidebar;