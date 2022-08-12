import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { ShowInfo, WatchList } from '../models/models';
import { Storage } from './Storage';
import { makeAutoObservable, observable, computed, action } from 'mobx';
import { getDayOfWeek } from '../HelperFunctions';

export class WatchListStore {
    watchList: WatchList = { shows: [] };

    constructor() {
        makeAutoObservable(this, {
            watchList: observable,
            addShowToWatchList: action,
            removeShowFromWatchList: action,
        });
        this.getWatchList().then(
            action((savedWatchList) => {
                this.watchList = savedWatchList;
            }),
        );
    }

    public isShowOnWatchList(show: ShowInfo) {
        return (
            this.watchList.shows.filter(
                (watchlistShow) => watchlistShow.showName === show.show,
            ).length !== 0
        );
    }

    public async addShowToWatchList(showToAdd: ShowInfo) {
        if (
            !this.watchList.shows.find(
                (show) => show.showName === showToAdd.show,
            )
        ) {
            this.watchList.shows.push({
                showName: showToAdd.show,
                showImage: showToAdd.image_url,
                releaseTime: getDayOfWeek(showToAdd.release_date),
            });
            await Storage.setItem(StorageKeys.WatchList, this.watchList);
        }
    }

    public async removeShowFromWatchList(showName: string) {
        this.watchList.shows = this.watchList.shows.filter(
            (show) => show.showName !== showName,
        );
        await Storage.setItem(StorageKeys.WatchList, this.watchList);
        return this.watchList;
    }

    public getShowsOnday(dayName: string) {
        return this.watchList.shows.filter(
            (show) => show.releaseTime === dayName,
        );
    }

    public async getWatchList() {
        return Storage.getItem<WatchList>(StorageKeys.WatchList, { shows: [] });
    }
}

const watchListStore = new WatchListStore();
export { watchListStore };
