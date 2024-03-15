import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import "./status.user.scss";
import InforUserModal from "../modal/inforUser.modal";
import { CHAT_STATUS } from "../../redux/types/type.user";
import InfoGroupModal from "../modal/infoGroup.modal";
const StatusUser = ({ chat }) => {
    const [user, setUser] = useState({});
    useEffect(() => {
        if (chat?.type === CHAT_STATUS.PRIVATE_CHAT) {
            setUser(chat.user);
        } else if (chat?.type === CHAT_STATUS.GROUP_CHAT) {
            // console.log('group chat', chat)
        } else {
            setUser(null);
        }
    }, [chat])
    return (
        <div className="status-user-container">
            {
                chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                    <InforUserModal
                        friendData={user}
                        type={'button'}
                        itsMe
                    >
                        <AvatarUser
                            image={chat.image}
                            size={50}
                        />
                    </InforUserModal>
                ) : (
                    <InfoGroupModal>
                        <div className="avatar-group" >
                            {
                                chat?.image ? (
                                    <img src={chat?.image} alt="avatar" />
                                ) : (
                                    chat?.participants?.length > 0 &&
                                    chat?.participants?.map(item => {
                                        return (
                                            <React.Fragment key={item.id}>
                                                <AvatarUser
                                                    image={item.avatar}
                                                    size={25}
                                                />
                                            </React.Fragment>
                                        )
                                    })
                                )
                            }
                        </div>
                    </InfoGroupModal>
                )
            }
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