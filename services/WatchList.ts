import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { ShowInfo, WatchList } from '../models/models';
import { Storage } from './Storage';

export class WatchListService {
    public static async isShowOnWatchList(show: ShowInfo) {
        const watchList = await this.getWatchList();
        return (
            watchList.shows.filter(
                (watchlistShow) => watchlistShow.showName === show.show,
            ).length !== 0
        );
    }

    public static async addShowToWatchList(show: ShowInfo) {}

    public static async removeShowFromWatchList(showName: string) {
        const watchList = await this.getWatchList();
        watchList.shows = watchList.shows.filter(
            (show) => show.showName !== showName,
        );
        await AsyncStorage.setItem(
            StorageKeys.WatchList,
            JSON.stringify(watchList),
        );
        return watchList;
    }

    public static async getWatchList() {
        return Storage.getItem<WatchList>(StorageKeys.WatchList, { shows: [] });
    }
}
