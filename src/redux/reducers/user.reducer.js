import { KEYITEMS } from "../../utils/keyMenuItem";
import { LOGIN_STATUS, LOGOUT_STATUS, SOCKET, STATE } from "../types/type.app"
import { CHAT_STATUS, MESSAGES, NOTIFICATIONS } from "../types/type.user";

const initialState = {
    notificationsFriends: [],
    sendMessageFunc: {},
    message: null
}

export default function userReducer(state = initialState, action) {
    switch (action.type) {
        case CHAT_STATUS.SELECTED_CHAT: {
            let stateSelectedChat = { ...state };
            stateSelectedChat.selectedChat = action.payload;
            return stateSelectedChat;
        }
        case NOTIFICATIONS.FRIENDS: {
            let stateNotificationsFriends = { ...state };
            stateNotificationsFriends.notificationsFriends = action.payload;
            return stateNotificationsFriends;
        }

        case MESSAGES.SEND_MESSAGE_FUNC: {
            let stateSendMessageFunc = { ...state };
            stateSendMessageFunc.sendMessageFunc = action.payload;
            return stateSendMessageFunc;
        }

        case NOTIFICATIONS.FETCH_NOTIFICATIONS_FUNC: {
            let stateFetchNotificationsFunc = { ...state };
            stateFetchNotificationsFunc.fetchNotificationsFunc = action.payload;
            return stateFetchNotificationsFunc;
        }


        default:
            return state
    }
}