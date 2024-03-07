import React, { useEffect } from "react";
import './invited.friend.scss';
import { Flex } from "antd";
import { useSelector } from "react-redux";
import { items } from "../../sidebar/friend.sidebar";
import InvitedUser from "../../../components/user/invited.user";
const headerData = items[2];
const InvitedFriend = () => {
    const stateApp = useSelector(state => state?.appReducer);
    const stateUser = useSelector(state => state?.userReducer);

    useEffect(() => {
        // console.log(stateUser.notificationsFriends)
    }, stateUser.notificationsFriends)
    return (
        <div className="invited-container">
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