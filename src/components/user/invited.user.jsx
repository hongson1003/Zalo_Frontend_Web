import React, { useEffect, useState } from "react";
import AvatarUser from "./avatar";
import { Button, Flex } from "antd";
import './invited.user.scss';
import moment from "moment";
import InforUserModal from "../modal/inforUser.modal";
import axios from '../../utils/axios';
import { socket } from "../../utils/io";
import { useSelector } from "react-redux";
import { sendNotifyToChatRealTime } from "../../utils/handleChat";
import { CHAT_STATUS, MESSAGES } from "../../redux/types/type.user";

const InvitedUser = ({ user, content, date, fetchInvitedFriends, fetchSentInvitedFriends, isReceived }) => {
    const me = useSelector(state => state.appReducer.userInfo.user);

    const handleResolve = async () => {
        const res = await axios.put('/users/friendShip', { userId: user.id });
        if (res.errCode === 0) {
            const resChat = await axios.post('/chat/access', {
                type: CHAT_STATUS.PRIVATE_CHAT,
                participants: [me.id, user.id],
                seenBy: [me.id, user.id]
            });
            if (resChat.errCode === 0) {
                await sendNotifyToChatRealTime(
                    resChat.data._id,
                    'Hai bạn đã trở thành bạn bè, hãy nhắn tin cho nhau để hiểu rõ nhau hơn ╮ (. ❛ ᴗ ❛.) ╭',
                    MESSAGES.NEW_FRIEND);
                socket.then(socket => {
                    socket.emit('new-chat', {
                        participants: [{
                            id: user.id
                        }]
                    });
                });
            }

            await fetchInvitedFriends();
        }
    }

    const handleReject = async () => {
        const res = await axios.put('/users/friendShip/reject', { userId: user.id });
        if (res.errCode === 0) {
            await fetchInvitedFriends();
        }
    }

    const handleRecallInvited = async () => {
        const res = await axios.post('/users/friendShip', { userId: user?.id, content: 'Thu hồi lời mời kết bạn' });
        if (res.errCode === 3) {
            await fetchSentInvitedFriends();
        }
    }

    return (
        <Flex vertical className="invited-user-container" >
            <div className="top">
                <InforUserModal
                    friendData={user}
                    type={'button'}
                    readOnly
                    refuseAction

                >
                    <AvatarUser
                        image={user.avatar}
                        name={user.userName}
                        size={50}
                    />
                </InforUserModal>
                <div className="description">
                    <p className="username">{user.userName}</p>
                    <p className="date">{moment(date).format('DD/MM')}</p>
                    <textarea className="content" defaultValue={content} readOnly></textarea>
                </div>
            </div>
            <div className="footer">
                {
                    isReceived ?
                        <>
                            <Button
                                type="default"
                                onClick={handleResolve}
                            >Đồng ý</Button>
                            <Button type="default" onClick={handleReject}>Từ chối</Button>
                        </> :
                        <Button type="default" onClick={handleRecallInvited}>Thu hồi lời mời</Button>
                }
            </div>
        </Flex>
    )
}

export default InvitedUser;