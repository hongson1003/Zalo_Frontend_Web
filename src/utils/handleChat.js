export const getFriend = (user, participants) => {
    return participants.find(item => item.id !== user.id);
}
