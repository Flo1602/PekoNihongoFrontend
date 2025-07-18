export function deleteMiddleElement<T>(arr: T[]): void {
    if (arr.length === 0) return;
    const middle = Math.floor(arr.length / 2);
    arr.splice(middle, 1);
}