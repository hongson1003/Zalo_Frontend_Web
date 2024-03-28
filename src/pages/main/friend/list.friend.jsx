import React, { useEffect } from "react";
import { items } from "../../sidebar/friend.sidebar";
import './list.friend.scss';
import { Input } from 'antd';
import ListFriends from "./listFriends.friends";
import axios from '../../../utils/axios';
import { toast } from "react-toastify";
const headerData = items[0];

const limit = 10;

const ListFriend = () => {
    const [friends, setFriends] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');

    useEffect(() => {
        fetchFriends();
    }, [])

    const fetchFriends = async () => {
        const res = await axios.get(`/users/friends?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setFriends(res.data);
        } else {
            toast.warn(res.message);
        }
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
                            placeholder="Tìm kiếm bạn bè"
                            prefix={<i className="fa-solid fa-magnifying-glass"></i>}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <ListFriends data={friends} />
                </div>
            </div>
        </div>
    )
}

export default ListFriend;