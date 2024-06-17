import React, { useEffect, useState } from 'react';
import './group.friend.scss';
import { items } from '../../sidebar/friend.sidebar';
import { Input, Select } from 'antd';
import axios from '../../../utils/axios';
import AvatarUser from '../../../components/user/avatar';
import { getFriend } from '../../../utils/handleChat';
import { useDispatch, useSelector } from 'react-redux';
import { accessChat } from '../../../redux/actions/user.action';
import { changeKeyMenu } from '../../../redux/actions/app.action';
import { KEYITEMS } from '../../../utils/keyMenuItem';

const headerData = items[1];

const GroupFriend = () => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedName, setSelectedName] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);

  const [options, setOptions] = useState([
    { value: 'nameAsc', label: 'Tên tăng dần' },
    { value: 'nameDesc', label: 'Tên giảm dần' },
  ]);
  const [filters, setFilters] = useState([
    { value: 'all', label: 'Tất cả' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
  ]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/chat/group');
      if (res.errCode === 0) {
        setGroups(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleSelectNameChange = (value) => {
    setSelectedName(value);
    // Add logic to sort friends by name
  };

  const handleSelectFilterChange = (value) => {
    setSelectedFilter(value);
    // Add logic to filter friends
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="groups-container friend-ultils-container">
      <header>
        <span className="icon">{headerData.icon}</span>
        <span className="label">{headerData.label}</span>
      </header>
      {groups && groups.length > 0 ? (
        <div className="friends-body">
          <div className="friends-main">
            <div className="interactaction">
              <Input
                style={{ width: '30%' }}
                placeholder="Tìm kiếm bạn bè"
                prefix={<i className="fa-solid fa-magnifying-glass"></i>}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                style={{ width: '30%' }}
                value={selectedName}
                placeholder="Sắp xếp tên"
                onChange={handleSelectNameChange}
              >
                {options.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                style={{ width: '30%' }}
                value={selectedFilter}
                placeholder="Phân loại"
                onChange={handleSelectFilterChange}
              >
                {filters.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <ListGroups data={groups} />
          </div>
        </div>
      ) : (
        <div className="no-friends">
          <i className="fa-solid fa-user-group"></i>
          <p>Bạn chưa tham gia nhóm chat nào</p>
        </div>
      )}
    </div>
  );
};

export default GroupFriend;

// Assuming ListFriends is a separate component that you have imported or defined elsewhere.
const ListGroups = ({ data }) => {
  const user = useSelector((state) => state.appReducer?.userInfo?.user);
  const dispatch = useDispatch();

  const handleAccessChat = (group) => {
    dispatch(changeKeyMenu(KEYITEMS.MESSAGE));
    dispatch(accessChat(group));
  };

  return (
    <div className="list-groups">
      {data.map((group) => (
        <div key={group._id} className="group-item">
          <div
            className="group-item-left"
            onClick={() => handleAccessChat(group)}
          >
            <div className="avatar-group">
              {group?.groupPhoto ? (
                <AvatarUser image={group?.groupPhoto} size={50} />
              ) : (
                group?.participants?.length > 0 &&
                group?.participants?.map((item) => {
                  return (
                    <React.Fragment key={item.id}>
                      <AvatarUser
                        image={item.avatar}
                        style={{
                          width: '50%',
                          height: '50%',
                        }}
                        name={getFriend(user, group.participants)?.userName}
                      />
                    </React.Fragment>
                  );
                })
              )}
            </div>
            <div className="name">
              <p>{group.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
