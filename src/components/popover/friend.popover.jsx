import React from "react";
import { Button, Popover } from 'antd';
import './friend.popover.scss';
import InforUserModal from '../modal/inforUser.modal';

const FriendPopover = ({ children, user, fetchFriends }) => {

    const handleBlockUser = () => {
        console.log('Block user', user);
    }

    const handleDeleteFriend = () => {
        console.log('Delete friend', user);
        fetchFriends();
    }

    return (
        <Popover
            content={(
                <div className="friend-popover-content">
                    <InforUserModal
                        friendData={user}
                        readOnly
                        refuseAction
                        type={'button'}
                    >
                        <p>Xem thông tin</p>
                    </InforUserModal>
                    <p onClick={handleBlockUser}>Chặn người này</p>
                    <p onClick={handleDeleteFriend}>Xóa bạn</p>
                </div>
            )}
            trigger={["click"]}
            placement="topLeft"
        >
            {children}
        </Popover>
    )
}

export default FriendPopover;