import { CALL, CHAT_STATUS, NOTIFICATIONS } from "../types/type.user";
import { STATE } from '../types/type.app';


export function notificationsFriends(notifications) {
    return {
        type: NOTIFICATIONS.FRIENDS,
        payload: notifications
    }
}

export function notificationsChats(notifications) {
    return {
        type: NOTIFICATIONS.CHAT,
        payload: notifications
    }
}

export function accessChat(chat) {
    return {
        type: STATE.ACCESS_CHAT,
        payload: chat
    }
}

export function fetchNotificationsFriendFunc(func) {
    return {
        type: NOTIFICATIONS.FETCH_NOTIFICATIONS_FRIENDS_FUNC,
        payload: func
    }
}

export function fetchNotificationChatFunc(func) {
    return {
        type: NOTIFICATIONS.FETCH_NOTIFICATIONS_CHAT_FUNC,
        payload: func
    }

}



export function fetchChatsFunc(func) {
    return {
        type: CHAT_STATUS.FETCH,
        payload: func
    }
}

export function addMemberCall(member) {
    return {
        type: CALL.ADD_MEMBER,
        payload: member
    }
}