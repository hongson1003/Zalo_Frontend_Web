import { LOGIN_STATUS } from '../redux/types/type.app';
import axios from '../utils/axios';
import { loginFail, loginSuccess } from '../redux/actions/action.app';

export const checkUserIsLogin = async () => {
    try {
        let rs = await axios.post('/auth/check');
        if (rs.errCode === 0) {
            return loginSuccess(rs.data);
        } else {
            return loginFail();
        }
    } catch (error) {
        console.log(error)
    }
}

