export function nextInt(bound: number) {
    return Math.floor(Math.random() * bound);
}

export function getRandomElements<T>(arr: T[], n: number): T[] {
    if (n > arr.length) {
        n = arr.length;
    }

    const result = [];
    const usedIndices = new Set();

    while (result.length < n) {
        const index = nextInt(arr.length);
        if (!usedIndices.has(index)) {
            usedIndices.add(index);
            result.push(arr[index]);
        }
    }

    return result;
}