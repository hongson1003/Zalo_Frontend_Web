import React, { useEffect, useState } from "react";
import AvatarUser from './avatar';
import "./status.user.scss";
import InforUserModal from "../modal/inforUser.modal";
import { CHAT_STATUS } from "../../redux/types/type.user";
import InfoGroupModal from "../modal/infoGroup.modal";
import { getFriend } from "../../utils/handleChat";
import { useSelector } from "react-redux";
import axios from '../../utils/axios';

const StatusUser = ({ chat }) => {
    const user = useSelector(state => state.appReducer.userInfo.user);
    const [friendShipData, setFriendShipData] = useState(null);


    const fetchFriendShip = async (userId) => {
        const res = await axios.get(`/users/friendShip?userId=${userId}`);
        if (res.errCode === 0) {
            setFriendShipData(res.data);
        }
    }

    useEffect(() => {
        fetchFriendShip(getFriend(user, chat.participants)?.id);
    }, []);
    return (
        <div className="status-user-container">
            {
                chat?.type === CHAT_STATUS.PRIVATE_CHAT ? (
                    <InforUserModal
                        friendData={getFriend(user, chat.participants)}
                        type={'button'}
                        friendShipData={friendShipData}
                    >
                        <AvatarUser
                            image={getFriend(user, chat.participants)?.avatar}
                            size={50}
                        />
                    </InforUserModal>
                ) : (
                    <InfoGroupModal>
                        {
                            chat?.groupPhoto ? (
                                <AvatarUser
                                    image={chat?.groupPhoto}
                                    size={50}
                                />
                            ) : (
                                <div className="avatar-group" >
                                    {
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
                                    }
                                </div>
                            )
                        }
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
                            <p className="username">{getFriend(user, chat?.participants)?.userName}</p>
                            <p className="connected-time">Truy cập 57 phút trước</p>
                        </>
                    )

                }

            </div>
        </div>
    );
}

export default StatusUser;