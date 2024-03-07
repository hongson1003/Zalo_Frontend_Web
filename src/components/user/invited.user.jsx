import React, { useEffect, useState } from "react";
import AvatarUser from "./avatar";
import { Button, Flex } from "antd";
import './invited.user.scss';
import moment from "moment";
import InforUserModal from "../modal/inforUser.modal";
import axios from '../../utils/axios';

const InvitedUser = ({ user, content, date }) => {
    const [friendShipData, setFriendShipData] = useState(null);
    const handleOk = async () => {
        const res = await axios.get(`users/friendShip?userId=${user.id}`)
        setFriendShipData(res.data);
    }
    useEffect(() => {
    }, [user, content])
    return (
        <Flex vertical className="invited-user-container" >
            <div className="top">
                <InforUserModal
                    friendData={user}
                    type={'button'}
                    friendShipData={friendShipData}
                    handleOk={handleOk}
                >
                    <AvatarUser image={user.avatar} />
                </InforUserModal>
                <div className="description">
                    <p className="username">{user.userName}</p>
                    <p className="date">{moment(date).format('DD/MM')}</p>
                    <textarea className="content" defaultValue={content} readOnly></textarea>
                </div>
            </div>
            <div className="footer">
                <Button type="default">Đồng ý</Button>
                <Button type="default">Từ chối</Button>
            </div>
        </Flex>
    )
}

export default InvitedUser;