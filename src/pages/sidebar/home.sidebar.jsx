import React, { useState } from "react";
import SearchMessage from "./home.message.search";
import './home.message.sidebar.scss'
import { useSelector } from "react-redux";
import { KEYITEMS } from "../../utils/keyMenuItem";
import FriendSideBar from "./friend.sidebar";

const SidebarHome = () => {
    const stateUser = useSelector(state => state?.userReducer);
    const stateApp = useSelector(state => state?.appReducer);
    const renderContent = () => {
        switch (stateApp?.nav) {
            case KEYITEMS.PHONEBOOK:
                return <FriendSideBar />;
            default:
                return <></>;
        }
    }

    return (
        <div className="sidebar-home">
            <SearchMessage />
            {renderContent()}
        </div>
    )
}

export default SidebarHome;