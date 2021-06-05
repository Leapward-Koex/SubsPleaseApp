export async function promiseEach<T>(promiseArray: Promise<T>[], thenCallback: (item: T) => any) {
    for (const item of promiseArray) {
        item.then(data => thenCallback(data))
    }
}