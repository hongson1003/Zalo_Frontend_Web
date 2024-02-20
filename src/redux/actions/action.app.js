import { LOGIN_STATUS, LOGOUT_STATUS } from '../types/type.app';

export function loginStart(userInfo) {
    return {
        type: LOGIN_STATUS.LOGIN_START,
        payload: userInfo
    }
}


export function loginSuccess(userInfo) {
    return {
        type: LOGIN_STATUS.LOGIN_SUCCESS,
        payload: userInfo
    }
}

export function loginFail(userInfo) {
    return {
        type: LOGIN_STATUS.LOGIN_FAIL,
    }
}

export function logoutSuccess() {
    return {
        type: LOGOUT_STATUS.LOGOUT_SUCCESS,
    }
}
