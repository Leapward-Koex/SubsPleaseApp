import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { ShowInfo } from '../models/models';
import { Storage } from './Storage';
import { WatchListService } from './WatchList';

export class WatchedEpisodes {
    private static getKey(show: ShowInfo) {
        return `${show.time}|${show.episode}`;
    }

    public static async isShowNew(show: ShowInfo) {
        const watchedEpisodes = await Storage.getItem<string[]>(
            StorageKeys.WatchedEpisodes,
            [],
        );
        const isShowOnWatchList = await WatchListService.isShowOnWatchList(
            show,
        );
        return (
            !watchedEpisodes.includes(this.getKey(show)) && isShowOnWatchList
        );
    }

    public static async setShowWatched(show: ShowInfo, watched: boolean) {
        const watchedEpisodes = await Storage.getItem<string[]>(
            StorageKeys.WatchedEpisodes,
            [],
        );
        const showKey = this.getKey(show);
        if (watched) {
            if (!watchedEpisodes.includes(showKey)) {
                watchedEpisodes.push(showKey);
                await Storage.setItem(
                    StorageKeys.WatchedEpisodes,
                    watchedEpisodes,
                );
            }
        } else {
            if (watchedEpisodes.includes(showKey)) {
                await Storage.setItem(
                    StorageKeys.WatchedEpisodes,
                    watchedEpisodes.filter(
                        (watchedEpisodeKey) => watchedEpisodeKey !== showKey,
                    ),
                );
            }
        }
    }
}
