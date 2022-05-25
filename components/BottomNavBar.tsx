import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { isCastingAvailable, promiseEach } from '../HelperFunctions';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { ReleasesTab } from './ReleasesTab';
import { WatchListTab } from './WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo, WatchList } from '../models/models';
import { SettingsTab } from './SettingsTab';
import { CastSettingsTab } from './castPageComponents/CastSettingsTab';
import { logger } from '../services/Logger';
import { ShowFilter } from './ReleaseHeader';
import { StorageKeys } from '../enums/enum';

const Tab = createMaterialBottomTabNavigator();
export const BottomNavBar = () => {
    const [mounted, setMounted] = React.useState(true);
    const [watchList, setWatchList] = React.useState<WatchList>({ shows: [] });
    const [showList, setShowList] = React.useState<ShowInfo[]>([]);
    const [showFilter, setShowFilter] = React.useState(ShowFilter.None);
    const [castingAvailable, setCastingAvailable] = React.useState(false);
    const [refreshingReleasesList, setRefreshingReleasesList] =
        React.useState(false);

    const { colors } = useTheme();

    const ReleasesRoute = () => (
        <ReleasesTab
            showFilter={showFilter}
            shows={showList}
            refreshing={refreshingReleasesList}
            onPullToRefresh={refreshShowData}
            onFilterChanged={onFilterChanged}
            watchList={watchList}
            onWatchListChanged={onWatchListChanged}
        />
    );

    const WatchListRoute = () => <WatchListTab />;
    const CastSettingsRoute = () => <CastSettingsTab />;
    const SettingsRoute = () => <SettingsTab />;

    const refreshShowData = React.useCallback(async () => {
        setRefreshingReleasesList(true);
        const getLatestShowListPromise = SubsPleaseApi.getLatestShowList();
        const getSavedReleasesPromise = getSavedReleases();
        let promisesFinished = false;
        setTimeout(async () => {
            if (mounted && !promisesFinished) {
                setShowList(await getSavedReleasesPromise);
            }
        }, 5000);
        const [apiShowList, savedShowList] = await Promise.all([
            getLatestShowListPromise,
            getSavedReleasesPromise,
        ]);
        promisesFinished = true;
        // Combine the showlist here
        const uniqueShows = uniqBy(
            apiShowList.concat(savedShowList),
            (show) => `${show.page}${show.episode}`,
        );
        if (mounted) {
            setShowList(uniqueShows);
            saveReleases(uniqueShows);
            setRefreshingReleasesList(false);
        }
    }, [mounted]);

    const onFilterChanged = React.useCallback((filterValue) => {
        setShowFilter(filterValue);
    }, []);

    const onWatchListChanged = (updatedWatchList: WatchList) => {
        setWatchList({ ...updatedWatchList });
        AsyncStorage.setItem(
            StorageKeys.WatchList,
            JSON.stringify(updatedWatchList),
        );
    };

    React.useEffect(() => {
        (async () => {
            setCastingAvailable(await isCastingAvailable());
        })();
    }, []);

    // Release tab data
    React.useEffect(() => {
        (async () => {
            const lastFilter = (await AsyncStorage.getItem(
                'headerFilter',
            )) as ShowFilter | null;
            if (lastFilter) {
                console.log('setting filter');
                setShowFilter(lastFilter);
            }
            const storedWatchList = JSON.parse(
                (await AsyncStorage.getItem(StorageKeys.WatchList)) ??
                    JSON.stringify({ shows: [] }),
            ) as WatchList;
            setWatchList(storedWatchList);
            refreshShowData();
        })();
        return () => {
            setMounted(false);
        };
    }, [refreshShowData]);

    const getSavedReleases: () => Promise<ShowInfo[]> = async () => {
        try {
            const value = await AsyncStorage.getItem('releases');
            if (value !== null) {
                return JSON.parse(value);
            }
            return [];
        } catch (e) {
            logger.error('Failed to read saved releases', JSON.stringify(e));
        }
    };

    const saveReleases = async (releases: ShowInfo[]) => {
        try {
            const jsonValue = JSON.stringify(releases);
            await AsyncStorage.setItem('releases', jsonValue);
        } catch (e) {
            // saving error
        }
    };

    const getCastSettingsTab = () => {
        if (castingAvailable) {
            return (
                <Tab.Screen
                    name="Cast Settings"
                    component={CastSettingsRoute}
                    options={{
                        tabBarLabel: 'Cast Settings',
                        tabBarIcon: ({ color }) => (
                            <Icon name="cast" color={color} size={25} />
                        ),
                        tabBarColor: colors.secondary,
                    }}
                />
            );
        }
        return <></>;
    };

    return (
        <Tab.Navigator shifting>
            <Tab.Screen
                name="Releases"
                component={ReleasesRoute}
                options={{
                    tabBarLabel: 'Releases',
                    tabBarIcon: ({ color }) => (
                        <Icon name="new-box" color={color} size={25} />
                    ),
                    tabBarColor: colors.primary,
                }}
            />
            {getCastSettingsTab()}
            <Tab.Screen
                name="Watch list"
                component={WatchListRoute}
                options={{
                    tabBarLabel: 'Watch list',
                    tabBarIcon: ({ color }) => (
                        <Icon name="playlist-play" color={color} size={25} />
                    ),
                    tabBarColor: colors.secondary,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsRoute}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <Icon name="cog-outline" color={color} size={25} />
                    ),
                    tabBarColor: colors.tertiary,
                }}
            />
        </Tab.Navigator>
    );
};
