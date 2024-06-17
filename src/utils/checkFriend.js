import { toast } from 'react-toastify';
import { STATE } from '../redux/types/app.type';
import axios from '../utils/axios';

export const getFriendState = async (meId, friendId) => {
  try {
    let res = await axios.get(`/users/friendShip?userId=${friendId}`);
    if (res.errCode === 0) {
      return res.data;
    }
    return meId === friendId || res.errCode;
  } catch (error) {
    console.log(error);

    return false;
  }
};
