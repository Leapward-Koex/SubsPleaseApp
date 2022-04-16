import * as React from 'react';
import {Animated, Dimensions, SafeAreaView, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {ReleaseShow} from './ReleaseShow';
import {Appearance} from 'react-native-appearance';
import {ShowInfo, WatchList} from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../enums/enum';
import {ReleaseTabHeader} from './ReleaseHeader';
import {SubsPleaseApi} from '../SubsPleaseApi';
import debounce from 'lodash.debounce';

type ReleaseTabProps = {
  shows: ShowInfo[];
  onPullToRefresh: () => void;
  refreshing: boolean;
};
export const ReleasesTab = ({
  shows,
  onPullToRefresh,
  refreshing,
}: ReleaseTabProps) => {
  const {colors} = useTheme();
  const [watchList, setWatchList] = React.useState<WatchList>();
  const [showList, setShowList] = React.useState(shows);

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const backgroundStyle = {
    backgroundColor:
      Appearance.getColorScheme() !== 'light'
        ? colors.subsPleaseDark2
        : colors.subsPleaseLight2,
  };

  React.useEffect(() => {
    (async () => {
      const storedWatchList = JSON.parse(
        (await AsyncStorage.getItem(StorageKeys.WatchList)) ??
          JSON.stringify({shows: []}),
      ) as WatchList;
      setWatchList(storedWatchList);
    })();
  }, []);

  const onWatchListChanged = (updatedWatchList: WatchList) => {
    setWatchList({...updatedWatchList});
    AsyncStorage.setItem(
      StorageKeys.WatchList,
      JSON.stringify(updatedWatchList),
    );
  };

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
          height: Dimensions.get('window').height - 50,
        }}>
        <ReleaseTabHeader
          onSearchChanged={debounceSearchHandler}
          onSearchCancelled={onSearchCancelled}
        />
        <Animated.FlatList
          style={backgroundStyle}
          data={showList}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}
          refreshing={refreshing}
          onRefresh={onPullToRefresh}
          renderItem={({item, index}) => {
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
              <Animated.View style={{transform: [{translateY}], opacity}}>
                <ReleaseShow
                  showInfo={item}
                  watchList={watchList ?? {shows: []}}
                  onWatchListChanged={updatedWatchList =>
                    onWatchListChanged(updatedWatchList)
                  }
                />
              </Animated.View>
            );
          }}
          keyExtractor={show => `${show.page}${show.episode}`}
        />
      </View>
    </SafeAreaView>
  );
};
