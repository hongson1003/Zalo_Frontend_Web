export const compareSizes = (sizes1, sizes2) => {
    const m1 = +sizes1.split('px')[0];
    const m2 = +sizes2.split('px')[0];
    if (m1 < m2)
        return -1;
    else if (m1 === m2)
        return 0;
    return 1;
}

export const getTimeFromDate = (date) => {
    const time = new Date(date);
    let minutes = time.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    let hours = time.getHours();
    if (hours < 10) {
        hours = `0${hours}`;
    }
    return `${hours}:${minutes}`;
}