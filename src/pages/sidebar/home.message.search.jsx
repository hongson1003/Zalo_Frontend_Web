import React, { useState } from "react";
import { Input } from 'antd';
import './home.message.search.scss';
import { UserAddOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Menu } from 'antd'
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import AddFriendModal from '../../components/modal/addFriend.modal';
import { KEYITEMS } from "../../utils/keyMenuItem";
import { useSelector } from "react-redux";


const items1 = [
    {
        label: <span>Tất cả</span>,
        key: 'all',
    },
    {
        label: <span>Chưa đọc</span>,
        key: 'not-all',
    },
]

const { Search } = Input;

const SearchMessage = () => {
    const onSearch = (value, _e, info) => console.log(info?.source, value);
    const [current, setCurrent] = useState('all');
    const state = useSelector(state => state?.appReducer);

    const onClick = (e) => {
        setCurrent(e.key);
    };


    return (
        <div className="sidebar-nav">
            <div className="sidebar-nav-search">
                <Search
                    placeholder="Tìm kiếm"
                    onSearch={onSearch}
                />
                <div className="btn-group">
                    <AddFriendModal>
                        <Button style={{ border: 'none', boxShadow: 'none' }} icon={<UserAddOutlined />}></Button>
                    </AddFriendModal>
                    <Button style={{ border: 'none', boxShadow: 'none' }} icon={<UsergroupAddOutlined />}></Button>
                </div>
            </div>
            {
                state?.nav === KEYITEMS.MESSAGE &&
                <div className="sidebar-nav-classify">
                    <Menu
                        onClick={onClick}
                        selectedKeys={[current]}
                        mode="horizontal"
                        items={items1}
                    />
                </div>
            }
        </div>
    )
}

export default SearchMessage;