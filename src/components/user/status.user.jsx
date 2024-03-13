import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import "./status.user.scss";
import InforUserModal from "../modal/inforUser.modal";
import { CHAT_STATUS } from "../../redux/types/type.user";

const StatusUser = ({ chat }) => {
    const [user, setUser] = useState({});
    useEffect(() => {
        if (chat?.user) {
            setUser(chat.user);
        } else {
            setUser(null);
        }
    }, [chat])
    return (
        <div className="status-user-container">
            <InforUserModal
                friendData={user}
                type={'button'}
                itsMe
            >
                <AvatarUser
                    image={chat.image}
                />
            </InforUserModal>
            <div className="status">
                {
                    chat?.type === CHAT_STATUS.GROUP_CHAT ? (
                        <>
                            <p className="username">{chat?.name}</p>
                            <p className="connected-time">Truy cập 57 phút trước</p>
                        </>
                    ) : (
                        <>
                            <p className="username">{user?.userName}</p>
                            <p className="connected-time">Truy cập 57 phút trước</p>
                        </>
                    )

                }

            </div>
        </div>
    );
}

export default StatusUser;