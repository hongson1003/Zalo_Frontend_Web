export const getFriend = (user, participants) => {
    if (!user || !participants) return null;
    return participants.find(item => item.id !== user.id);
}

export const getDetailListMembers = (listMembers) => {
    let count = 0, total = 0;
    listMembers.forEach(item => {
        if (item.checked) {
            count++;
        }
    });
    return { count, total: listMembers.length };
}
