import React, { useEffect, useState} from "react";
import { items } from "../../sidebar/friend.sidebar";
import './list.friend.scss';
import { Input, Select} from 'antd';
import ListFriends from "./listFriends.friends";
import axios from '../../../utils/axios';
import { toast } from "react-toastify";
const headerData = items[0];

const limit = 10;

const ListFriend = () => {
    const [friends, setFriends] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');
    const [selectedName, setSelectedName] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, [])
    useEffect(() => {
        let newListFriends = []
        if(selectedName==0) {
            newListFriends =friends.sort((a, b) => a.userName.localeCompare(b.userName));
        }
        if(selectedName==1) {
            newListFriends =friends.sort((a, b) => b.userName.localeCompare(a.userName));
        }
        setFriends(newListFriends)
    }, selectedName)


    const fetchFriends = async () => {
        const res = await axios.get(`/users/friends?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setFriends(res.data);
        } else {
            toast.warn(res.message);
        }
    }

    const options = [
        {
            value: '0',
            label: 'Tên (A-Z)'
        },
        {
            value: '1',
            label: 'Tên (Z-A)'
        }
    ]

    const filters = [
        {
            value: '0',
            label: 'Tất cả'
        },
        {
            value: '1',
            label: 'Bạn thân'
        }
    ]

    const handleSelectNameChange = (value) => {
        setSelectedName(value);
    }
    const handleSelectFilterChange = (value) => {
        setSelectedFilter(value);
    }

    

    return (
        <div className="friends-container friend-ultils-container">
            <header>
                <span className="icon">{headerData.icon}</span>
                <span className="label">{headerData.label}</span>
            </header>
            <div className="friends-body">
                <div className="friends-main">
                    <div className="interactaction">
                        <Input
                            style={{ width: '30%' }}
                            placeholder="Tìm kiếm bạn bè"
                            prefix={<i className="fa-solid fa-magnifying-glass"></i>}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select
                            style={{ width: '30%' }}
                            value={selectedName}
                            placeholder='Sắp xếp tên'
                            onChange={handleSelectNameChange}
                        >
                            {options.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                            ))}
                        </Select>

                        <Select
                            style={{ width: '30%' }}
                            value={selectedFilter}
                            placeholder = 'Phân loại'
                            onChange={handleSelectFilterChange}
                        >
                            {filters.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                            ))}
                        </Select>

                    </div>
                    <ListFriends data={friends}/>
                </div>
            </div>
        </div>
    )
}

export default ListFriend;