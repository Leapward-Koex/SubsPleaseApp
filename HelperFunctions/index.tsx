export async function promiseEach<T>(promiseArray: Promise<T>[], thenCallback: (item: T) => any) {
    for (const item of promiseArray) {
        item.then(data => thenCallback(data))
    }
}

export const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function getDayOfWeek(dateString: string) {
    const date = new Date(dateString);
    return weekday[date.getDay()];
}
