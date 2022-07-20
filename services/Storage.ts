import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';

export class Storage {
    public static async getItem<T>(
        key: StorageKeys,
        defaultValue?: T,
    ): Promise<T> {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue === null) {
            return defaultValue!;
        }
        return JSON.parse(storedValue) as T;
    }
}
