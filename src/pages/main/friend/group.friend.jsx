import React from "react";
import './group.friend.scss';
import { items } from "../../sidebar/friend.sidebar";

const headerData = items[1];

const GroupFriend = () => {
    return (
        <div className="group-friend-container friend-ultils-container">
            <header>
                <span className="icon">{headerData.icon}</span>
                <span className="label">{headerData.label}</span>
            </header>
        </div>
    )
}
export default GroupFriend;