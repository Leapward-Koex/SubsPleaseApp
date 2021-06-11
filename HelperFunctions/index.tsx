export async function promiseEach<T>(promiseArray: Promise<T>[], thenCallback: (item: T) => any) {
    for (const item of promiseArray) {
        item.then(data => thenCallback(data))
    }
}

export function getDayOfWeek(dateString: string) {
    const date = new Date(dateString);
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[date.getDay()];
}
