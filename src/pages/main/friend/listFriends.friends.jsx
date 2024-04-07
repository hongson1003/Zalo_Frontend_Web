import React, { useEffect } from "react";
import AvatarUser from "../../../components/user/avatar";
import { useSelector, useDispatch } from "react-redux";
import './listFriends.friends.scss';
import axios from '../../../utils/axios';
import { accessChat } from '../../../redux/actions/user.action';
import { changeKeyMenu, changeKeySubMenu } from "../../../redux/actions/app.action";
import { KEYITEMS } from "../../../utils/keyMenuItem";
import { STATE } from "../../../redux/types/type.app";

const ListFriends = ({ data }) => {
    const [friends, setFriends] = React.useState([]);
    const stateApp = useSelector(state => state.appReducer);
    const [chats, setChats] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const dispatch = useDispatch();

    useEffect(() => {
        if (data && data.length > 0) {
            const newData = data?.map(item => {
                let user = null;
                if (stateApp.userInfo.user.id === item.user1.id)
                    user = item.user2;
                else
                    user = item.user1;
                return user;
            })
            setFriends(newData);
        }
    }, [data]);


    useEffect(() => {
        fetchChats();
    }, []);


    const fetchChats = async () => {
        const res = await axios.get(`/chat/pagination?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setChats(res.data);
        }
    }

    const handleOpenChat = async (friendId) => {
        const res = await axios.post('/chat/access', {
            "type": "PRIVATE_CHAT",
            "participants": [stateApp.userInfo.user.id, friendId],
            "status": true
        });
        if (res.errCode !== -1) {
            dispatch(changeKeyMenu(KEYITEMS.MESSAGE));
            dispatch(accessChat(res.data));
        }
    }

    return (
        <div className="friends-list">
            {friends.map((item, index) => (
                <div key={index} className="friend-item" onClick={() => handleOpenChat(item.id)}>
                    <AvatarUser
                        image={item.avatar}
                        name={item.userName}
                        size={50}
                        zoom
                    />
                    <span className="name">{item.userName}</span>
                </div>
            ))}
        </div>
    )
}

export default ListFriends;