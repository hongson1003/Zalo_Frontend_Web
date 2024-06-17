import React, { useEffect, useState } from 'react';
import './joinGroup.scss';
import axios from '../../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import { socket } from '../../utils/io';
import { sendNotifyToChatRealTime } from '../../utils/handleChat';
import { MESSAGES } from '../../redux/types/user.type';

const JoinGroup = () => {
  const [group, setGroup] = useState('');
  let { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroupByID = async () => {
    try {
      const res = await axios.get(`/chat/access?chatId=${id}`);
      if (res.errCode === 0) setGroup(res.data);
      else {
        toast.error('Không thể truy cập nhóm này!');
        navigate('/home');
      }
    } catch (error) {
      console.log(error);
      toast.error('Không thể truy cập nhóm này!');
      navigate('/home');
    }
  };

  const handleJoinGroup = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        toast.error('Vui lòng đăng nhập để tham gia nhóm!');
        setIsLoading(false);
        return;
      }
      const res = await axios.put('/chat/addMembers', {
        members: [user.id],
        chatId: id,
      });
      if (res.errCode === 0) {
        toast.success('Tham gia nhóm thành công!');
        await sendNotifyToChatRealTime(
          id,
          `${user.userName} đã tham gia nhóm từ đường link`,
          MESSAGES.NOTIFY
        );
        socket.then((socket) => {
          socket.emit('add-member', res.data);
        });
        setTimeout(() => {
          setIsLoading(false);
          navigate('/home');
        }, 1000);
      } else if (res.errCode === 1) {
        toast.success('Bạn đã tham gia nhóm này rồi!');
        setIsLoading(false);
        navigate('/home');
      } else {
        toast.error('Tham gia nhóm thất bại!');
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error('Tham gia nhóm thất bại!');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroupByID();
    }
  }, [user]);

  return (
    <div className="join-group-container">
      <div className="content-body">
        <p className="title">Thông tin nhóm</p>
        <div className="group-info">
          <div className="group-info-content groupPhoto">
            <img src={group.groupPhoto || '/groupPhoto/avatar-group.png'} />
          </div>
          <div className="group-info-content name">
            <p className="label">Tên nhóm:</p>
            <p className="content">{group.name}</p>
          </div>
          <div className="group-info-content admin">
            <p className="label">Người tạo:</p>
            <p className="content">{group?.adminstrator?.userName}</p>
          </div>
          <div className="group-info-content members">
            <p className="label">Thành viên:</p>
            <p className="content">
              {group.participants?.map((member, index) => {
                return <span key={index}>{member.userName}, </span>;
              })}
            </p>
          </div>
          <Button type="primary" onClick={handleJoinGroup} loading={isLoading}>
            Tham gia nhóm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
