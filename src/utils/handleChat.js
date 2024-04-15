import axios from '../utils/axios';

export const getFriend = (user, participants) => {
    if (!user || !participants || participants.length < 0) return null;
    return participants.find(item => item?.id !== user?.id);
}

export const getDetailListMembers = (listMembers) => {
    let count = 0;
    if (!listMembers || listMembers.length < 0) return { count, total: 0 };
    listMembers.forEach(item => {
        if (item.checked) {
            count++;
        }
    });
    return { count, total: listMembers.length };
}

export const sendNotifyToChatRealTime = async (chatId, message) => {
    const res = await axios.post('/chat/notify', {
        chatId,
        message
    })
    if (res.errCode === 0)
        return true;
    return false;
}

