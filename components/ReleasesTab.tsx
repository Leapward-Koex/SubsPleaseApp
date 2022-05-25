import * as React from 'react';
import {
    Animated,
    SafeAreaView,
    useWindowDimensions,
    View,
    Appearance,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ReleaseShow } from './ReleaseShow';
import { ShowInfo, WatchList } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { ReleaseTabHeader, ShowFilter } from './ReleaseHeader';
import { SubsPleaseApi } from '../SubsPleaseApi';
import debounce from 'lodash.debounce';
import { downloadedShows } from '../services/DownloadedShows';
import { asyncFilter } from '../HelperFunctions';

type ReleaseTabProps = {
    shows: ShowInfo[];
    onPullToRefresh: () => void;
    refreshing: boolean;
    showFilter: ShowFilter;
    onFilterChanged: (filter: ShowFilter) => void;
    watchList: WatchList;
    onWatchListChanged: (watchlist: WatchList) => void;
};
export const ReleasesTab = ({
    shows,
    onPullToRefresh,
    refreshing,
    showFilter,
    onFilterChanged,
    watchList,
    onWatchListChanged,
}: ReleaseTabProps) => {
    const { colors } = useTheme();
    const [showList, setShowList] = React.useState(shows);
    const [filteredShowList, setFilteredShowList] = React.useState<ShowInfo[]>(
        [],
    );
    const [mounted, setMounted] = React.useState(true);

    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { height } = useWindowDimensions();

    const backgroundStyle = {
        backgroundColor:
            Appearance.getColorScheme() !== 'light'
                ? colors.subsPleaseDark2
                : colors.subsPleaseLight3,
    };

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
            setFilteredShowList(retrievedFilteredShowList);
        })();
    }, [showFilter, showList, watchList.shows]);

    const onSearchChanged = async (query: string) => {
        const result = await SubsPleaseApi.getShowsFromSearch(query);
        setShowList(result);
    };

    const debounceSearchHandler = debounce(onSearchChanged, 500);

    const onSearchCancelled = () => {
        setShowList(shows);
    };

    return (
        <SafeAreaView>
            <View
                style={{
                    flexDirection: 'column',
                    height: height - 50,
                }}
            >
                <ReleaseTabHeader
                    filter={showFilter}
                    onSearchChanged={debounceSearchHandler}
                    onSearchCancelled={onSearchCancelled}
                    onFilterChanged={onFilterChanged}
                />
                <Animated.FlatList
                    style={backgroundStyle}
                    data={filteredShowList}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true },
                    )}
                    refreshing={refreshing}
                    onRefresh={onPullToRefresh}
                    renderItem={({ item, index }) => {
                        const itemHeight = 150;
                        const inputRange = [
                            -1,
                            0,
                            itemHeight * index,
                            itemHeight * (index + 1.5),
                        ];
                        const opcaityInputRange = [
                            -1,
                            0,
                            itemHeight * index,
                            itemHeight * (index + 1),
                        ];
                        const scale = scrollY.interpolate({
                            inputRange,
                            outputRange: [1, 1, 1, 0],
                        });
                        const translateY = scrollY.interpolate({
                            inputRange,
                            outputRange: [0, 0, 0, itemHeight],
                        });
                        const opacity = scrollY.interpolate({
                            inputRange: opcaityInputRange,
                            outputRange: [1, 1, 1, 0],
                        });

                        return (
                            <Animated.View
                                style={{ transform: [{ translateY }], opacity }}
                            >
                                <ReleaseShow
                                    showInfo={item}
                                    watchList={watchList}
                                    onWatchListChanged={(updatedWatchList) =>
                                        onWatchListChanged(updatedWatchList)
                                    }
                                />
                            </Animated.View>
                        );
                    }}
                    keyExtractor={(show) => `${show.page}${show.episode}`}
                />
            </View>
        </SafeAreaView>
    );
};
