import { Platform, PermissionsAndroid } from 'react-native';
import { NativeModules } from 'react-native';

export async function promiseEach<T>(
    promiseArray: Promise<T>[],
    thenCallback: (item: T) => any,
) {
    for (const item of promiseArray) {
        item.then((data) => thenCallback(data));
    }
}

export const weekday = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export function getDayOfWeek(dateString: string) {
    const date = new Date(dateString);
    return weekday[date.getDay()];
}

export function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + ' ' + units[u];
}

export async function asyncFilter<T>(
    arr: T[],
    predicate: (value: T) => Promise<boolean>,
) {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
}

export const tryParseInt = (string: string, defaultValue: number) => {
    let retValue = defaultValue;
    if (string !== null) {
        if (string.length > 0) {
            if (!isNaN(string as any)) {
                retValue = parseInt(string, 10);
            }
        }
    }
    return retValue;
};

export const formatSecondsToMinutesSeconds = (s: number) => {
    return (s - (s %= 60)) / 60 + (s > 9 ? ':' : ':0') + s;
};

interface FilePathModuleInterface {
    getFolderPathFromUri(
        contentUri: string,
        callback: (directoryPath: string) => void,
    ): void;
    verifyManageFilesPermission(callback: (granted: boolean) => void): void;
    fileExists(filePath: string, callback: (fileExists: boolean) => void): void;
    deleteFileIfExists(
        filePath: string,
        callback: (success: boolean) => void,
    ): void;
    readTextFile(filePath: string, callback: (text: string) => void): void;
    openVideoIntent(
        filePath: string,
        callback: (success: boolean) => void,
    ): void;
    getOpenPort(callback: (openPortNumber: number) => void): void;
    isCastingAvailable(callback: (castingAvailable: boolean) => void): void;
}

const { FilePathModule } = NativeModules;
const FilePathModuleTyped = FilePathModule as FilePathModuleInterface;
export const getRealPathFromContentUri = (contentUri: string) => {
    return new Promise<string>((resolve, reject) => {
        FilePathModuleTyped.getFolderPathFromUri(
            contentUri,
            (directoryPath) => {
                if (directoryPath) {
                    resolve(directoryPath);
                } else {
                    reject(
                        `Content Uri ${contentUri} could not be mapped to directory`,
                    );
                }
            },
        );
    });
};

export const fileExists = (filePath: string) => {
    return new Promise<boolean>((resolve) => {
        FilePathModuleTyped.fileExists(filePath, (fileExistsOnDevice) =>
            resolve(fileExistsOnDevice),
        );
    });
};

export const deleteFileIfExists = (filePath: string) => {
    return new Promise<boolean>((resolve) => {
        FilePathModuleTyped.deleteFileIfExists(filePath, (success) =>
            resolve(success),
        );
    });
};

export const readTextFile = (filePath: string) => {
    return new Promise<string>((resolve) => {
        FilePathModuleTyped.readTextFile(filePath, (text) => resolve(text));
    });
};

export const openVideoIntent = (filePath: string) => {
    return new Promise<boolean>((resolve) => {
        FilePathModuleTyped.openVideoIntent(filePath, (success) =>
            resolve(success),
        );
    });
};

export const getOpenPort = () => {
    return new Promise<number>((resolve) => {
        FilePathModuleTyped.getOpenPort((port) => resolve(port));
    });
};

export const isCastingAvailable = () => {
    return new Promise<boolean>((resolve) => {
        FilePathModuleTyped.isCastingAvailable((castingAvailable) =>
            resolve(castingAvailable),
        );
    });
};

export const getExtensionlessFilepath = (filePath: string) => {
    return filePath.split('.').slice(0, -1).join('.');
};

export const getFileNameFromFilePath = (filePath: string) => {
    return filePath.split('\\').pop()!.split('/').pop() as string;
};

export async function requestStoragePermission() {
    if (Platform.OS !== 'android') {
        return true;
    }

    const checkManageFilesPermission = () => {
        return new Promise<boolean>((resolve) => {
            FilePathModuleTyped.verifyManageFilesPermission(resolve);
        });
    };

    const pm0 = await checkManageFilesPermission();
    if (!pm0) {
        return false;
    }

    const pm1 = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    const pm2 = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    if (pm1 && pm2) {
        return true;
    }

    const userResponse = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    if (
        userResponse['android.permission.READ_EXTERNAL_STORAGE'] ===
            'granted' &&
        userResponse['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    ) {
        return true;
    } else {
        return false;
    }
}
