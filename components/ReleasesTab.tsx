import * as React from 'react';
import {
    useWindowDimensions,
    View,
    StyleSheet,
    LayoutAnimation,
    Text,
    Button,
    Vibration,
} from 'react-native';
import { ShowInfo, WatchList } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import {
    ReleaseTabHeader,
    ShowFilter,
} from './releasePageComponents/ReleaseHeader';
import { SubsPleaseApi } from '../ExternalApis/SubsPleaseApi';
import { downloadedShows } from '../services/DownloadedShows';
import { asyncFilter, isCastingAvailable } from '../HelperFunctions';
import { ReleaseList } from './releasePageComponents/ReleaseList';
import { logger } from '../services/Logger';
import uniqBy from 'lodash.uniqby';
import { Storage } from '../services/Storage';
import { ShowInformationModal } from './releasePageComponents/ShowInformationModal';
import {
    createStackNavigator,
    TransitionPresets,
} from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { useStore } from '../stores/RootStore';
import Modal from 'react-native-modal/dist/modal';
import { BottomModal } from './releasePageComponents/BottomModalComponents/BottomModal';

export const ReleasesTab = () => {
    const [castingAvailable, setCastingAvailable] = React.useState(false);
    const [showList, setShowList] = React.useState<ShowInfo[]>([]);
    const [filteredShowList, setFilteredShowList] = React.useState<ShowInfo[]>(
        [],
    );
    const [showFilter, setShowFilter] = React.useState(ShowFilter.None);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(true);

    const [bottomModalVisible, setbottomModalVisible] = React.useState(false);
    const [currentBottomModalShow, setCurrentBottomModalShow] =
        React.useState<ShowInfo>();

    const { watchedEpisodeStore, watchListStore } = useStore();

    const styles = StyleSheet.create({
        viewStyles: {
            flexDirection: 'column',
            height: '100%',
        },
        bottomModal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
    });

    React.useEffect(() => {
        if (searchTerm) {
            console.log('Searching for ', searchTerm);
            SubsPleaseApi.getShowsFromSearch(searchTerm).then(
                async (result) => {
                    setShowList(result);
                    const savedShowList = await Storage.getItem<ShowInfo[]>(
                        StorageKeys.Releases,
                        [],
                    );
                    const uniqueShows = uniqBy(
                        result.concat(savedShowList),
                        (show) => `${show.page}${show.episode}`,
                    );
                    uniqueShows.sort(
                        (a, b) =>
                            new Date(b.release_date).getTime() -
                            new Date(a.release_date).getTime(),
                    );

                    saveReleases(uniqueShows);
                },
            );
        }
    }, [searchTerm]);

    const getSavedReleases = () => {
        return Storage.getItem<ShowInfo[]>(StorageKeys.Releases, []);
    };

    const saveReleases = async (releases: ShowInfo[]) => {
        try {
            await Storage.setItem(StorageKeys.Releases, releases);
        } catch (e) {
            // saving error
        }
    };

    const refreshShowData = React.useCallback(async () => {
        setRefreshing(true);
        const getLatestShowListPromise = SubsPleaseApi.getLatestShowList();
        const getSavedReleasesPromise = getSavedReleases();
        const [apiShowList, savedShowList] = await Promise.all([
            getLatestShowListPromise,
            getSavedReleasesPromise,
        ]);
        // Combine the showlist here
        const uniqueShows = uniqBy(
            apiShowList.concat(savedShowList),
            (show) => `${show.page}${show.episode}`,
        );

        LayoutAnimation.configureNext({
            duration: 700,
            update: {
                delay: 350,
                type: LayoutAnimation.Types.spring,
                springDamping: 0.9,
            },
        });

        const cacheLength = await Storage.getItem(
            StorageKeys.ReleaseShowCacheLength,
            100,
        );
        saveReleases(uniqueShows);
        if (cacheLength !== -1) {
            uniqueShows.length = Math.min(uniqueShows.length, cacheLength);
        }
        setRefreshing(false);
        setShowList(uniqueShows);
    }, []);

    // Load initial page data
    React.useEffect(() => {
        (async () => {
            console.log('Loading initial release page data');

            const retrievedCastingAvailalbe = await isCastingAvailable();

            refreshShowData();
            const lastFilter = await Storage.getItem<ShowFilter>(
                StorageKeys.HeaderFilter,
            );
            if (lastFilter) {
                console.log('setting filter');
                setShowFilter(lastFilter);
            }
            setCastingAvailable(retrievedCastingAvailalbe);
        })();
    }, [refreshShowData]);

    React.useEffect(() => {
        const getFilteredList = async () => {
            if (showFilter === ShowFilter.Downloaded) {
                return asyncFilter(showList, async (show) => {
                    const downloadedEpisodesForSeries = await asyncFilter(
                        show.downloads,
                        async (download) =>
                            (download.res === '720' ||
                                download.res === '1080') &&
                            (await downloadedShows.isShowDownloaded(
                                show.show,
                                download.magnet,
                            )),
                    );
                    return downloadedEpisodesForSeries.length > 0;
                });
            } else if (showFilter === ShowFilter.Watching) {
                return showList.filter((show) =>
                    watchListStore.isShowOnWatchList(show),
                );
            } else if (showFilter === ShowFilter.NewRelease) {
                return showList.filter((show) =>
                    watchedEpisodeStore.isShowNew(show),
                );
            }
            return showList;
        };
        autorun(async () => {
            console.log('Running filter');
            const retrievedFilteredShowList = await getFilteredList();
            if (retrievedFilteredShowList.length !== filteredShowList.length) {
                setFilteredShowList(retrievedFilteredShowList);
            }
        });
    }, [
        filteredShowList.length,
        showFilter,
        showList,
        watchListStore,
        watchedEpisodeStore,
    ]);

    const onSearchChanged = React.useCallback(
        (newSearchTerm) => {
            if (!newSearchTerm) {
                console.log('Resetting search term');
                refreshShowData();
            }
            setSearchTerm(newSearchTerm);
        },
        [refreshShowData],
    );

    const onFilterChanged = React.useCallback((filterValue) => {
        setShowFilter(filterValue);
    }, []);

    const onModalClosed = () => {
        setbottomModalVisible(false);
    };

    return (
        <View style={styles.viewStyles}>
            <ReleaseTabHeader
                filter={showFilter}
                castingAvailable={castingAvailable}
                onSearchChanged={onSearchChanged}
                onFilterChanged={onFilterChanged}
            />

            <ReleaseList
                showList={filteredShowList}
                onPullToRefresh={refreshShowData}
                refreshing={refreshing}
                onItemLongPress={(showInfo) => {
                    setCurrentBottomModalShow(showInfo);
                    setbottomModalVisible(true);
                    Vibration.vibrate(16);
                }}
            />
            <Modal
                isVisible={bottomModalVisible}
                onSwipeComplete={onModalClosed}
                onBackdropPress={onModalClosed}
                onBackButtonPress={onModalClosed}
                onModalHide={() => setCurrentBottomModalShow(undefined)}
                swipeDirection={['down']}
                style={styles.bottomModal}
            >
                {currentBottomModalShow && (
                    <BottomModal showInfo={currentBottomModalShow} />
                )}
            </Modal>
        </View>
    );
};
