import React from 'react';
import { WatchedEpisodeStore } from './WatchedEpisodesStore';
import { WatchListStore } from './WatchListStore';

export class RootStore {
    watchedEpisodeStore: WatchedEpisodeStore;
    watchListStore: WatchListStore;
    constructor() {
        this.watchedEpisodeStore = new WatchedEpisodeStore(this);
        this.watchListStore = new WatchListStore(this);
    }
}

/* Store helpers */
const rootStore = new RootStore();
const RootStoreContext = React.createContext<RootStore>(rootStore);

export const RootStoreProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <RootStoreContext.Provider value={rootStore}>
            {children}
        </RootStoreContext.Provider>
    );
};

/* Hook to use store in any functional component */
export const useStore = () => React.useContext(RootStoreContext);
