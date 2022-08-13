import { StorageKeys } from '../enums/enum';
import { ShowInfo, WatchList } from '../models/models';
import { makeObservable, observable, computed, action } from 'mobx';
import { getDayOfWeek } from '../HelperFunctions';
import { Storage } from '../services/Storage';
import { RootStore } from './RootStore';

export class WatchListStore {
    watchList: WatchList = { shows: [] };
    private rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeObservable(this, {
            watchList: observable,
            addShowToWatchList: action,
            removeShowFromWatchList: action,
        });
        Storage.getItem<WatchList>(StorageKeys.WatchList, { shows: [] }).then(
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
    }

    public getShowsOnday(dayName: string) {
        return this.watchList.shows.filter(
            (show) => show.releaseTime === dayName,
        );
    }
}
