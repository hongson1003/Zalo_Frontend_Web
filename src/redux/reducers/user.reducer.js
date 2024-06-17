import { KEYITEMS } from '../../utils/keyMenuItem';
import { LOGIN_STATUS, LOGOUT_STATUS, SOCKET, STATE } from '../types/app.type';
import { CALL, CHAT_STATUS, MESSAGES, NOTIFICATIONS } from '../types/user.type';

const initialState = {
  notificationsFriends: [],
  notificationsChats: [],
  sendMessageFunc: {},
  callMembers: [],
};

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
    case NOTIFICATIONS.CHAT: {
      let stateNotificationsChats = { ...state };
      stateNotificationsChats.notificationsChats = action.payload;
      return stateNotificationsChats;
    }

    case MESSAGES.SEND_MESSAGE_FUNC: {
      let stateSendMessageFunc = { ...state };
      stateSendMessageFunc.sendMessageFunc = action.payload;
      return stateSendMessageFunc;
    }

    case NOTIFICATIONS.FETCH_NOTIFICATIONS_FRIENDS_FUNC: {
      let stateFetchNotificationsFunc = { ...state };
      stateFetchNotificationsFunc.fetchNotificationsFriends = action.payload;
      return stateFetchNotificationsFunc;
    }

    case NOTIFICATIONS.FETCH_NOTIFICATIONS_CHAT_FUNC: {
      let stateFetchNotificationsChatFunc = { ...state };
      stateFetchNotificationsChatFunc.fetchNotificationChats = action.payload;
      return stateFetchNotificationsChatFunc;
    }

    case CHAT_STATUS.FETCH: {
      let stateFetchFunc = { ...state };
      stateFetchFunc.fetchChats = action.payload;
      return stateFetchFunc;
    }

    case MESSAGES.FETCH_MESSAGES_FUNC: {
      let stateFetchMessagesFunc = { ...state };
      stateFetchMessagesFunc.fetchMessages = action.payload;
      return stateFetchMessagesFunc;
    }

    default:
      return state;
  }
}
