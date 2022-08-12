import { StorageKeys } from '../enums/enum';
import { ShowInfo } from '../models/models';
import { Storage } from './Storage';
import { watchListStore } from './WatchListStore';
import { makeAutoObservable, observable, computed, action } from 'mobx';

export class WatchedEpisodeStore {
    watchedEpisodes: string[] = [];
    private getKey(show: ShowInfo) {
        return `${show.time}|${show.episode}`;
    }

    constructor() {
        makeAutoObservable(this, {
            watchedEpisodes: observable,
            setShowWatched: action,
        });
        Storage.getItem<string[]>(StorageKeys.WatchedEpisodes, []).then(
            action((savedWatchedEpisodes) => {
                this.watchedEpisodes = savedWatchedEpisodes;
            }),
        );
    }

    public isShowNew(show: ShowInfo) {
        const isShowOnWatchList = watchListStore.isShowOnWatchList(show);
        return (
            !this.watchedEpisodes.includes(this.getKey(show)) &&
            isShowOnWatchList
        );
    }

    public async setShowWatched(show: ShowInfo, watched: boolean) {
        const showKey = this.getKey(show);
        if (watched) {
            if (!this.watchedEpisodes.includes(showKey)) {
                this.watchedEpisodes.push(showKey);
                await Storage.setItem(
                    StorageKeys.WatchedEpisodes,
                    this.watchedEpisodes,
                );
            }
        } else {
            if (this.watchedEpisodes.includes(showKey)) {
                await Storage.setItem(
                    StorageKeys.WatchedEpisodes,
                    this.watchedEpisodes.filter(
                        (watchedEpisodeKey) => watchedEpisodeKey !== showKey,
                    ),
                );
            }
        }
    }
}

const watchedEpisodeStore = new WatchedEpisodeStore();
export { watchedEpisodeStore };
