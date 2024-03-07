export const compareSizes = (sizes1, sizes2) => {
    const m1 = +sizes1.split('px')[0];
    const m2 = +sizes2.split('px')[0];
    if (m1 < m2)
        return -1;
    else if (m1 === m2)
        return 0;
    return 1;
}