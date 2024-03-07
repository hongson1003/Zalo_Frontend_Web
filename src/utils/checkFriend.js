import { STATE } from '../redux/types/type.app';
import axios from '../utils/axios';


export const getFriendState = async (meId, friendId) => {
    let res = await axios.get(`/users/friendShip?userId=${friendId}`);
    if (res.errCode === 0) {
        return res.data;
    }
    return meId === friendId || res.errCode;
}