import React, { useEffect, useState } from 'react';
import { Button, Drawer, Popover } from 'antd';
import './members.drawer.scss';
import AvatarUser from '../user/avatar';
import AddMemberModal from '../modal/addMember.modal';
import InforUserModal from '../modal/inforUser.modal';
import axios from '../../utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { EllipsisOutlined } from '@ant-design/icons';
import { editGroup } from '../../redux/actions/app.action';
import { socket } from '../../utils/io';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { MESSAGES } from '../../redux/types/user.type';
import { toast } from 'react-toastify';

const Content = ({
  friendData,
  friendShipData,
  handleRemoveMember,
  fetchFriendShip,
}) => {
  const handleDeleteMember = () => {
    handleRemoveMember(friendData);
  };

  return (
    <div>
      <InforUserModal
        friendData={friendData}
        type={'button'}
        friendShipData={friendShipData || null}
        fetchFriendShip={fetchFriendShip}
      >
        <Button type="text">Xem thông tin</Button>
      </InforUserModal>
      <Button type="text" onClick={handleDeleteMember}>
        Xóa
      </Button>
    </div>
  );
};

const MemberDrawer = ({ children, chat }) => {
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedFriendShipMember, setSelectedFriendShipMember] =
    useState(null);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const dispatch = useDispatch();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (chat) {
      const adminstrator = chat?.participants.find(
        (item) => item.id === chat?.administrator
      );
      const participants = chat?.participants.filter(
        (item) => item.id !== chat?.administrator
      );
      participants.unshift(adminstrator);
      setParticipants(participants);
    }
  }, [chat]);

  const handleRemoveMember = async (member) => {
    try {
      const res = await axios.put('/chat/message/deleteMemer', {
        chatId: chat._id,
        memberId: member.id,
      });
      if (res.errCode === 0) {
        sendNotifyToChatRealTime(
          chat._id,
          `${user.userName} đã xóa ${member.userName} ra khỏi nhóm !`,
          MESSAGES.NOTIFY
        );
        socket.then((socket) => {
          socket.emit('delete-member', res.data);
        });
        dispatch(editGroup(res.data));
        setParticipants(
          participants.filter((participant) => participant.id !== member.id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleselectedFriendShipMember = async (member) => {
    try {
      const res = await axios.get('/users/friendShip?userId=' + member.id);
      setSelectedFriendShipMember(res.data || null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <span onClick={showDrawer}>{children}</span>
      <Drawer
        title="Thành viên"
        onClose={onClose}
        open={open}
        className="member-drawer"
        destroyOnClose
        getContainer={false}
      >
        <div className="member-group-container">
          <AddMemberModal chat={chat}>
            <div className="add-member">
              <i className="fa-solid fa-user-plus"></i>
              <p className="add-member-btn">Thêm thành viên</p>
            </div>
          </AddMemberModal>

          <div className="list-members">
            <p className="title">
              Danh sách thành viên ({chat?.participants?.length})
            </p>
            <div className="content-member">
              {participants?.length > 0 &&
                participants?.map((participant, index) => {
                  return (
                    <div className="member-box" key={participant?.id}>
                      <InforUserModal
                        friendData={participant}
                        type={'button'}
                        friendShipData={selectedFriendShipMember}
                        fetchFriendShip={() =>
                          handleselectedFriendShipMember(participant)
                        }
                      >
                        <div
                          key={index}
                          className="member"
                          onClick={() =>
                            handleselectedFriendShipMember(participant)
                          }
                        >
                          <AvatarUser
                            image={participant?.avatar}
                            name={participant?.userName}
                          />
                          {participant?.id === chat?.administrator ? (
                            <div>
                              <p className="name">{participant.userName}</p>
                              <p className="role">Quản trị viên</p>
                            </div>
                          ) : (
                            <p className="name">{participant.userName}</p>
                          )}
                        </div>
                      </InforUserModal>
                      {user?.id === chat?.administrator &&
                        user?.id !== participant.id && (
                          <div className="utils">
                            <Popover
                              content={React.createElement(Content, {
                                friendData: participant,
                                friendShipData: selectedFriendShipMember,
                                handleRemoveMember: handleRemoveMember,
                                fetchFriendShip: () =>
                                  handleselectedFriendShipMember(participant),
                              })}
                              trigger={'click'}
                              className="popover-member"
                              afterOpenChange={(visible) => {
                                if (!visible) {
                                  setSelectedFriendShipMember(null);
                                } else {
                                  handleselectedFriendShipMember(participant);
                                }
                              }}
                            >
                              <span>
                                <EllipsisOutlined />
                              </span>
                            </Popover>
                          </div>
                        )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};
export default MemberDrawer;
