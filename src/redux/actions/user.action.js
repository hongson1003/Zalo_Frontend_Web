import { NOTIFICATIONS } from "../types/type.user";

export function notificationsFriends(notifications) {
    return {
        type: NOTIFICATIONS.FRIENDS,
        payload: notifications
    }
} 