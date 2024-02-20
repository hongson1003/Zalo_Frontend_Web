import React, { useState } from "react";
import { Input } from 'antd';
import './home.message.search.scss';
import { UserAddOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Menu } from 'antd'
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
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

const items2 = [
    {
        key: '1',
        type: 'customer',
        label: 'Khách hàng',
    },
    {
        key: '2',
        type: 'customer',
        label: 'Gia đình',
    },
    {
        key: '3',
        type: 'customer',
        label: 'Công việc',
    },
];

const { Search } = Input;

const SearchMessage = () => {
    const onSearch = (value, _e, info) => console.log(info?.source, value);
    const [current, setCurrent] = useState('all');
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
                    <Button style={{ border: 'none', boxShadow: 'none' }} icon={<UserAddOutlined />}></Button>
                    <Button style={{ border: 'none', boxShadow: 'none' }} icon={<UsergroupAddOutlined />}></Button>
                </div>
            </div>
            <div className="sidebar-nav-classify">
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={items1}
                />
                <Dropdown
                    menu={{ items: items2 }}
                    className="classify"
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <span>Phân loại</span>
                            <DownOutlined />
                        </Space>
                    </a>

                </Dropdown>

            </div>
        </div>
    )
}

export default SearchMessage;