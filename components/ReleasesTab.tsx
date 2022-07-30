import * as React from 'react';
import {
    useWindowDimensions,
    View,
    StyleSheet,
    LayoutAnimation,
    Text,
    Button,
} from 'react-native';
import { ShowInfo, WatchList } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import {
    ReleaseTabHeader,
    ShowFilter,
} from './releasePageComponents/ReleaseHeader';
import { SubsPleaseApi } from '../SubsPleaseApi';
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

const Stack = createStackNavigator();

export const ReleasesTab = () => {
    const [castingAvailable, setCastingAvailable] = React.useState(false);

    const [showList, setShowList] = React.useState<ShowInfo[]>([]);
    const [filteredShowList, setFilteredShowList] = React.useState<ShowInfo[]>(
        [],
    );
    const [watchList, setWatchList] = React.useState<WatchList>({ shows: [] });
    const [showFilter, setShowFilter] = React.useState(ShowFilter.None);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);

    const { height } = useWindowDimensions();

    const styles = StyleSheet.create({
        viewStyles: {
            flexDirection: 'column',
            height: height - 50,
        },
    });

    React.useEffect(() => {
        if (searchTerm) {
            console.log('Searching for ', searchTerm);
            SubsPleaseApi.getShowsFromSearch(searchTerm).then((result) => {
                setShowList(result);
            });
        }
    }, [searchTerm]);

    const getSavedReleases = () => {
        return Storage.getItem<ShowInfo[]>(StorageKeys.Releases, []);
    };

    const saveReleases = async (releases: ShowInfo[]) => {
        try {
            const jsonValue = JSON.stringify(releases);
            await AsyncStorage.setItem(StorageKeys.Releases, jsonValue);
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
        if (cacheLength !== -1) {
            uniqueShows.length = Math.min(uniqueShows.length, cacheLength);
        }
        setRefreshing(false);
        setShowList(uniqueShows);
        saveReleases(uniqueShows);
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
            const storedWatchList = await Storage.getItem<WatchList>(
                StorageKeys.WatchList,
                { shows: [] },
            );
            setWatchList(storedWatchList);
            setCastingAvailable(retrievedCastingAvailalbe);
        })();
    }, [refreshShowData]);

    const onWatchListChanged = React.useCallback(
        (updatedWatchList: WatchList) => {
            setWatchList({ ...updatedWatchList });
            AsyncStorage.setItem(
                StorageKeys.WatchList,
                JSON.stringify(updatedWatchList),
            );
        },
        [],
    );

    console.log('rendering');
    React.useEffect(() => {
        console.log('mounting');
        return () => {
            console.log('unmounting!');
        };
    }, []);

    React.useEffect(() => {
        (async () => {
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
                    const watchingShowNames =
                        watchList?.shows.map((show) => show.showName) ?? [];
                    return showList.filter((show) =>
                        watchingShowNames.includes(show.show),
                    );
                }
                return showList;
            };
            const retrievedFilteredShowList = await getFilteredList();
            if (retrievedFilteredShowList.length !== filteredShowList.length) {
                setFilteredShowList(retrievedFilteredShowList);
            }
        })();
    }, [filteredShowList.length, showFilter, showList, watchList?.shows]);

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

    const ReleasesList = React.useCallback(
        (navigation: any) => {
            return (
                <ReleaseList
                    showList={filteredShowList}
                    onPullToRefresh={refreshShowData}
                    refreshing={refreshing}
                    watchList={watchList}
                    onWatchListChanged={onWatchListChanged}
                />
            );
        },
        [
            filteredShowList,
            onWatchListChanged,
            refreshShowData,
            refreshing,
            watchList,
        ],
    );

    console.log(filteredShowList.length);
    return (
        <View style={styles.viewStyles}>
            <ReleaseTabHeader
                filter={showFilter}
                castingAvailable={castingAvailable}
                onSearchChanged={onSearchChanged}
                onFilterChanged={onFilterChanged}
            />

            <Stack.Navigator
                initialRouteName="ReleasesList"
                screenOptions={({ route, navigation }) => ({
                    headerShown: false,
                    gestureEnabled: true,
                    ...TransitionPresets.ModalPresentationIOS,
                })}
            >
                <Stack.Screen name="ReleasesList" component={ReleasesList} />
                <Stack.Screen
                    name="release-info"
                    component={ShowInformationModal}
                />
            </Stack.Navigator>
        </View>
    );
};
