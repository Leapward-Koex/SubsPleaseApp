import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { promiseEach } from '../HelperFunctions';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { ReleasesTab } from './ReleasesTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ShowResolution = '480' | '540' | '720' | '1080';

export interface ShowDownloadInfo {
  res: ShowResolution;
  magnet: string;
}

export interface ShowInfo {
  downloads: ShowDownloadInfo[];
  episode: string;
  image_url: string;
  page: string;
  release_date: string; // mm/dd/yy
  show: string;
  time: string; // 'New' or release date
  xdcc: string;
}

export interface SubsPleaseShowApiResult {
  [showEpisode: string]: ShowInfo;
}

const Tab = createMaterialBottomTabNavigator();
export const BottomNavBar = () => {
  const [index, setIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(true);
  const [loadingShowData, setLoadingShowData] = React.useState(false);
  const [showList, setShowList] = React.useState<ShowInfo[]>([]);
  const { colors, dark } = useTheme();
  const ReleasesRoute = () => <ReleasesTab shows={showList} onRefresh={refreshShowData} loadingData={loadingShowData}/>;
  const WatchListRoute = () => <Text>Albums</Text>;
  const RecentsRoute = () => <Text>Recents</Text>;

  const refreshShowData = async () => {
    const getLatestShowListPromise = SubsPleaseApi.getLatestShowList();
      const getSavedReleasesPromise = getSavedReleases();
      promiseEach<ShowInfo[]>(
        [getLatestShowListPromise, getSavedReleasesPromise],
        showListRequest => {
          if (showList.length === 0 && mounted) {
            setShowList(showListRequest);
          }
        },
      );
      const [apiShowList, savedShowList] = await Promise.all([
        getLatestShowListPromise,
        getSavedReleasesPromise,
      ]);
      // Combine the showlist here
      debugger;
      const uniqueShows = uniqBy(
        apiShowList.concat(savedShowList),
        show => `${show.page}${show.episode}`,
      );
      if (mounted) {
        setShowList(uniqueShows);
        saveReleases(uniqueShows);
      }
  }

  // Release tab data
  React.useEffect(() => {
    refreshShowData();
    (async () => {
    })();
    return () => {
      setMounted(false);
    }
  }, []);

  const getSavedReleases: () => Promise<ShowInfo[]> = async () => {
    try {
      const value = await AsyncStorage.getItem('releases');
      if (value !== null) {
        return JSON.parse(value);
      }
      return [];
    } catch (e) {
      // error reading value
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

  return (
    <Tab.Navigator
      shifting
    >
      <Tab.Screen name="Releases" component={ReleasesRoute} options={{
          tabBarLabel: 'Releases',
          tabBarIcon: ({ color }) => (
            <Icon name="new-box" color={color} size={25} />
          ),
          tabBarColor: colors.primary
        }}/>
      <Tab.Screen name="Watch list" component={WatchListRoute} options={{
          tabBarLabel: 'Watch list',
          tabBarIcon: ({ color }) => (
            <Icon name="playlist-play" color={color} size={25} />
          ),
          tabBarColor: colors.secondary
        }}/>
      <Tab.Screen name="Recents" component={RecentsRoute} options={{
          tabBarLabel: 'Recents',
          tabBarIcon: ({ color }) => (
            <Icon name="mailbox-open-up-outline" color={color} size={25} />
          ),
          tabBarColor: colors.tertiary
        }}/>
    </Tab.Navigator>
  );
};