import React, { useState } from "react";
import { Input } from 'antd';
import './home.message.search.scss';
import { UserAddOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Menu } from 'antd'
import AddFriendModal from '../../components/modal/addFriend.modal';
import { KEYITEMS } from "../../utils/keyMenuItem";
import { useSelector } from "react-redux";
import NewGroupChatModal from "../../components/modal/newGroupChat.modal";
import { FILTER } from "../../redux/types/type.user";


const items1 = [
    {
        label: <span>Tất cả</span>,
        key: FILTER.ALL,
    },
    {
        label: <span>Chưa đọc</span>,
        key: FILTER.NOT_READ,
    },
]

const { Search } = Input;

const SearchMessage = ({ setCurrent: setSearchCurrent, setStatusChat, statusChat }) => {

    const state = useSelector(state => state?.appReducer);

    const onSearch = (value, _e, info) => {
        setSearchCurrent(value);
    };

    const onClick = (e) => {
        setStatusChat(e.key);
    };

    const handleOnChange = (value) => {
        if (!value) {
            setSearchCurrent('');
        }
    }

    return (
        <div className="sidebar-nav">
            <div className="sidebar-nav-search">
                <Search
                    placeholder="Tìm kiếm"
                    onSearch={onSearch}
                    spellCheck={false}
                    onChange={(e) => handleOnChange(e.target.value)}
                />
                <div className="btn-group">
                    <AddFriendModal>
                        <Button style={{ border: 'none', boxShadow: 'none', width: '20%' }} icon={<UserAddOutlined />}></Button>
                    </AddFriendModal>
                    <NewGroupChatModal>
                        <Button
                            style={{ border: 'none', boxShadow: 'none', width: '20%' }}
                            icon={<UsergroupAddOutlined />}
                        />
                    </NewGroupChatModal>
                </div>
            </div>
            {
                state?.nav === KEYITEMS.MESSAGE &&
                <div className="sidebar-nav-classify">
                    <Menu
                        onClick={onClick}
                        selectedKeys={[statusChat]}
                        mode="horizontal"
                        items={items1}
                    />
                </div>
            }
        </div>
    )
}

export default SearchMessage;