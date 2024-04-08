import { CHAT_STATUS, NOTIFICATIONS } from "../types/type.user";
import { STATE } from '../types/type.app';


export function notificationsFriends(notifications) {
    return {
        type: NOTIFICATIONS.FRIENDS,
        payload: notifications
    }
}

export function accessChat(chat) {
    return {
        type: STATE.ACCESS_CHAT,
        payload: chat
    }
}

export function fetchNotificationsfunc(func) {
    return {
        type: NOTIFICATIONS.FETCH_NOTIFICATIONS_FUNC,
        payload: func
    }
}

export function fetchChatsFunc(func) {
    return {
        type: CHAT_STATUS.FETCH,
        payload: func
    }
}