import React, { useEffect } from "react";
import AvatarUser from "../../../components/user/avatar";
import { useSelector } from "react-redux";
import './listFriends.friends.scss';

const ListFriends = ({ data }) => {
    const [friends, setFriends] = React.useState([]);
    const stateApp = useSelector(state => state.appReducer);
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
    }, [data])

    return (
        <div className="friends-list">
            {friends.map((item, index) => (
                <div key={index} className="friend-item">
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