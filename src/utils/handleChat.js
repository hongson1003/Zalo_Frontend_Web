import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { socket } from './io';

export const getFriend = (user, participants) => {
  if (!user || !participants || participants.length < 0) return null;
  return participants.find((item) => item?.id !== user?.id);
};

export const getDetailListMembers = (listMembers) => {
  let count = 0;
  if (!listMembers || listMembers.length < 0) return { count, total: 0 };
  listMembers.forEach((item) => {
    if (item.checked) {
      count++;
    }
  });
  return { count, total: listMembers.length };
};

export const sendNotifyToChatRealTime = async (chatId, message, type) => {
  try {
    const res = await axios.post('/chat/notify', {
      chatId,
      message,
      type,
    });
    if (res.errCode === 0) {
      socket.then((socket) => {
        socket.emit('send-message', res.data);
        return res;
      });
    }
    return res;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export function formatTimeAgo(timestamp) {
  const now = new Date();
  const sentTime = new Date(timestamp);

  const timeDifference = now - sentTime;
  const secondsDifference = Math.floor(timeDifference / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);

  if (secondsDifference < 60) {
    return 'Vài giây';
  } else if (minutesDifference < 60) {
    return `${minutesDifference} phút`;
  } else if (hoursDifference < 24) {
    return `${hoursDifference} giờ`;
  } else {
    return `${daysDifference} ngày`;
  }
}
