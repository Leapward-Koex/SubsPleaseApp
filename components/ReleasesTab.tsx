import * as React from 'react';
import {Animated, SafeAreaView, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {ReleaseShow} from './ReleaseShow';
import { Appearance } from 'react-native-appearance'
import { ShowInfo, WatchList } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';

type ReleaseTabProps = {
  shows: ShowInfo[],
  onRefresh: () => void;
  loadingData: boolean;
}
export const ReleasesTab = (props: ReleaseTabProps) => {
  const { shows, onRefresh, loadingData } = props;
  const { colors } = useTheme();
  const [ watchList, setWatchList ] = React.useState<WatchList>();

  const scrollY = React.useRef( new Animated.Value(0)).current;

  const backgroundStyle = {
    backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseDark2 : colors.subsPleaseLight2,
  };

  React.useEffect(() => {
    (async () => {
        const watchList = JSON.parse(await AsyncStorage.getItem(StorageKeys.WatchList) ?? JSON.stringify({shows: []})) as WatchList;
        setWatchList(watchList);
    })();
  }, []);

  const onWatchListChanged = (updatedWatchList: WatchList) => {
    setWatchList({...updatedWatchList});
    AsyncStorage.setItem(StorageKeys.WatchList, JSON.stringify(updatedWatchList));
  }

  if (!watchList) {
    return (
      <SafeAreaView>
        <View style={backgroundStyle}>

        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <Animated.FlatList
        style={backgroundStyle}
        data={shows}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        renderItem={({item, index}) => {
          const itemHeight = 150;
          const inputRange = [
            -1,
            0,
            itemHeight * index,
            itemHeight * (index + 1.5)
          ];
          const opcaityInputRange = [
            -1,
            0,
            itemHeight * index,
            itemHeight * (index + 1)
          ];
          const scale = scrollY.interpolate( {
            inputRange,
            outputRange: [1, 1, 1, 0]
          })
          const translateY = scrollY.interpolate( {
            inputRange,
            outputRange: [0, 0, 0, itemHeight]
          })
          const opacity = scrollY.interpolate( {
            inputRange: opcaityInputRange,
            outputRange: [1, 1, 1, 0]
          })
          
          return (
            <Animated.View style={{ transform: [{translateY}], opacity}}>
              <ReleaseShow showInfo={item} watchList={watchList} onWatchListChanged={(updatedWatchList) => onWatchListChanged(updatedWatchList)}/>
            </Animated.View>
          )
        }}
        keyExtractor={show => `${show.page}${show.episode}`}/>
    </SafeAreaView>
  );
};
