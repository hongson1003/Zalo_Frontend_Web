import React, { useEffect } from "react";
import './invited.friend.scss';
import { Flex } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { items } from "../../sidebar/friend.sidebar";
import InvitedUser from "../../../components/user/invited.user";
import axios from "../../../utils/axios";
import { notificationsFriends } from '../../../redux/actions/user.action';

const headerData = items[2];

const InvitedFriend = () => {
    const stateApp = useSelector(state => state?.appReducer);
    const stateUser = useSelector(state => state?.userReducer);
    const dispatch = useDispatch();


    useEffect(() => {
        const ids = stateUser.notificationsFriends.map(item => item?.id);
        handleReadNotifications(ids);
    }, [])

    const handleReadNotifications = async (ids) => {
        await axios.post('/users/notifications/friendShip', { ids });
        stateUser.fetchNotificationsFunc();
    }

    const fetchInvitedFriends = async () => {
        const resAll = await axios.get(`/users/notifications/friendShip`);
        if (resAll.errCode === 0) {
            dispatch(notificationsFriends(resAll.data));
        } else {
            toast.warn('Có lỗi xảy ra !')
        }
    }


    return (
        <div className="invited-container friend-ultils-container">
            <header>
                <span className="icon">{headerData.icon}</span>
                <span className="label">{headerData.label}</span>
            </header>
            <div className="invited-body">
                {
                    stateUser.notificationsFriends.length <= 0 ?
                        <div className="not-found">
                            <img src="https://raw.githubusercontent.com/hongson1003/PostImage/main/not%20found.png" />
                            <p>Bạn không có lời mời nào</p>
                        </div> :
                        <div className="list-invited-friends">
                            {
                                stateUser.notificationsFriends.map(item => {
                                    return (
                                        <InvitedUser
                                            key={item?.id}
                                            user={item?.sender}
                                            content={item?.content}
                                            date={item?.updatedAt}
                                            fetchInvitedFriends={fetchInvitedFriends}
                                        />
                                    )

                                })
                            }
                        </div>
                }
            </div>
        </div>
    )
}

export default InvitedFriend;