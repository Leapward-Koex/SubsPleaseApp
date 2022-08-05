import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';
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

    public static async setItem(key: StorageKeys, value: any) {
        return AsyncStorage.setItem(key, JSON.stringify(value));
    }

    public static async clearCache() {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((key) => {
            return (
                key === StorageKeys.JikanShowInfo || key.match(/-synopsis$/m)
            );
        });

        await AsyncStorage.multiRemove(cacheKeys);
        ToastAndroid.showWithGravityAndOffset(
            `Removed ${cacheKeys.length} values`,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50,
        );
    }
}
