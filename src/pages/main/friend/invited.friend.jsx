import React, { useEffect } from "react";
import './invited.friend.scss';
import { Flex, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { items } from "../../sidebar/friend.sidebar";
import InvitedUser from "../../../components/user/invited.user";
import axios from "../../../utils/axios";

const headerData = items[2];
const options = [
    {
        value: 'received',
        label: <span>Đã nhận</span>
    },
    {
        value: 'sent',
        label: <span>Đã gửi</span>
    }
]

const InvitedFriend = () => {
    const stateUser = useSelector(state => state?.userReducer);
    const dispatch = useDispatch();
    const [invitedFriends, setInvitedFriends] = React.useState([]);
    const [optionValue, setOptionValue] = React.useState('received');

    useEffect(() => {
        const ids = stateUser.notificationsFriends.map(item => item?.id);
        handleReadNotifications(ids);
        fetchInvitedFriends();
    }, [])

    const handleReadNotifications = async (ids) => {
        await axios.post('/users/notifications/friendShip', { ids });
        stateUser.fetchNotificationsFunc();
    }

    const fetchInvitedFriends = async () => {
        const res = await axios.get(`/users/notifications/friendShip/invited`);
        if (res.errCode === 0) {
            setInvitedFriends(res?.data);
        } else {
            toast.warn('Có lỗi xảy ra !')
        }
    }

    const onChange = (value) => {
        setOptionValue(value);
    }


    return (
        <div className="invited-container friend-ultils-container">
            <header>
                <p className="header-left">
                    <span className="icon">{headerData.icon}</span>
                    <span className="label">{headerData.label}</span>
                </p>
                <Select
                    onChange={onChange}
                    className="header-right select-invited"
                    defaultValue={optionValue}
                >
                    {
                        options.map(item => {
                            return <Select.Option key={item?.value} value={item?.value}>{item?.label}</Select.Option>
                        })
                    }
                </Select>
            </header>
            <div className="invited-body">
                {
                    invitedFriends.length <= 0 ?
                        <div className="not-found">
                            <i className="fa-regular fa-envelope-open"></i>
                            <p>Bạn không có lời mời nào</p>
                        </div> :
                        <div className="list-invited-friends">
                            {
                                invitedFriends.map(item => {
                                    return (
                                        <InvitedUser
                                            key={item?.id}
                                            user={item?.friendShip?.sender}
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