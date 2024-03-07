import { KEYITEMS } from "../../utils/keyMenuItem";
import { LOGIN_STATUS, LOGOUT_STATUS, SOCKET, STATE } from "../types/type.app"
import { CHAT_STATUS, NOTIFICATIONS } from "../types/type.user";

const initialState = {
    selectedChat: null,
    notificationsFriends: []
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


        default:
            return state
    }
}