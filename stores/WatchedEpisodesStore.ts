import { StorageKeys } from '../enums/enum';
import { ShowInfo } from '../models/models';
import { Storage } from '../services/Storage';
import { makeObservable, observable, computed, action } from 'mobx';
import { RootStore } from './RootStore';

export class WatchedEpisodeStore {
    watchedEpisodes: string[] = [];
    private rootStore: RootStore;
    private getKey(show: ShowInfo) {
        return `${show.show}|${show.release_date}|${show.episode}`;
    }

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeObservable(this, {
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
        return computed(
            () =>
                !this.watchedEpisodes.includes(this.getKey(show)) &&
                this.rootStore.watchListStore.isShowOnWatchList(show),
        ).get();
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
                this.watchedEpisodes = this.watchedEpisodes.filter(
                    (watchedEpisodeKey) => watchedEpisodeKey !== showKey,
                );
                await Storage.setItem(
                    StorageKeys.WatchedEpisodes,
                    this.watchedEpisodes,
                );
            }
        }
    }
}
