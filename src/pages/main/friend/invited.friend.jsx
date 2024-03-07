import React, { useEffect } from "react";
import './invited.friend.scss';
import { Flex } from "antd";
import { useSelector } from "react-redux";
import { items } from "../../sidebar/friend.sidebar";
const headerData = items[2];
const InvitedFriend = () => {
    const stateApp = useSelector(state => state?.appReducer);
    const stateUser = useSelector(state => state?.userReducer);


    return (
        <div className="invited-container">
            <header>
                <span className="icon">{headerData.icon}</span>
                <span className="label">{headerData.label}</span>
            </header>
            <div className="invited-body">

            </div>
        </div>
    )
}

export default InvitedFriend;