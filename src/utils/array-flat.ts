export const flatten = <T>(arr: T[][], levels: number = null, removeFalsey = false): T[] => {
    const out: T[] = [];

    if (levels === null) {
        levels = Infinity;
    }

    for (let i = 0; i < arr.length; i++) {
        if (levels && arr[i] && Array.isArray(arr[i])) {
            out.push.apply(out, flatten(arr[i] as unknown as T[][], levels - 1, removeFalsey));
        } else if (arr[i] || !removeFalsey) {
            out.push(arr[i] as unknown as T);
        }
    }

    return out;
};
