import { KEYITEMS } from "../../utils/keyMenuItem";
import { LOGIN_STATUS, LOGOUT_STATUS, SOCKET, STATE } from "../types/type.app"

const initialState = {
    isLogin: STATE.PENDING,
    userInfo: null,
    nav: KEYITEMS.MESSAGE,
    subNav: null,
    isConnectedSocket: false,
    error: false,
}

export default function appReducer(state = initialState, action) {
    switch (action.type) {
        case LOGIN_STATUS.LOGIN_START: {
            let stateLoginSuccess = { ...state };
            stateLoginSuccess.userInfo = action.payload;
            return stateLoginSuccess;
        }

        case LOGIN_STATUS.LOGIN_SUCCESS: {
            let stateLoginSuccess = { ...state };
            stateLoginSuccess.isLogin = STATE.RESOLVE;
            stateLoginSuccess.userInfo = action.payload;
            return stateLoginSuccess;
        }

        case LOGIN_STATUS.LOGIN_FAIL: {
            let stateLoginFail = { ...state };
            stateLoginFail.isLogin = STATE.REJECT;
            return stateLoginFail;
        }

        case LOGOUT_STATUS.LOGOUT_SUCCESS: {
            let stateLogoutSuccess = { ...state };
            stateLogoutSuccess.userInfo = null;
            stateLogoutSuccess.isLogin = STATE.REJECT;
            return stateLogoutSuccess;
        }
        case LOGOUT_STATUS.LOGOUT_FAIL: {
            let stateLogoutSuccess = { ...state };
            return stateLogoutSuccess;
        }
        case STATE.CHANGE_KEY_MENU: {
            let stateChangeKeyMenu = { ...state };
            stateChangeKeyMenu.nav = action.payload;
            return stateChangeKeyMenu;
        }
        case STATE.CHANGE_SUB_KEY_MENU: {
            let stateChangeSubKeyMenu = { ...state };
            stateChangeSubKeyMenu.subNav = action.payload;
            return stateChangeSubKeyMenu;
        }
        case SOCKET.CONNECTED_SUCCESS: {
            let stateConnected = { ...state };
            stateConnected.isConnectedSocket = true;
            return stateConnected;
        }
        case SOCKET.DISCONNECTED_SUCCESS: {
            let stateDisconnected = { ...state };
            stateDisconnected.isConnectedSocket = false;
            return stateDisconnected;
        }
        case STATE.ERROR: {
            let stateError = { ...state };
            stateError.error = true;
            return stateError;
        }
        default:
            return state
    }
}