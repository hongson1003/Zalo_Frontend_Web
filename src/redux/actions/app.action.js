import { LOGIN_STATUS, LOGOUT_STATUS, SOCKET, STATE } from '../types/type.app';

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

export function connectSocketSuccess() {
    return {
        type: SOCKET.CONNECTED_SUCCESS,
    }
}

export function setError() {
    return {
        type: STATE.ERROR,
    }
}

export function changeKeySubMenu(key) {
    return {
        type: STATE.CHANGE_SUB_KEY_MENU,
        payload: key
    }
}

export function editUser(user){
    return {
        type: STATE.EDIT_USER,
        payload: user
    }
}


