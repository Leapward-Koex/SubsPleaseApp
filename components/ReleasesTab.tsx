import * as React from 'react';
import {FlatList, RefreshControl, SafeAreaView, ScrollView, useColorScheme} from 'react-native';
import {Text} from 'react-native-paper';
import {ShowInfo, SubsPleaseShowApiResult} from './BottomNavBar';
import {ReleaseShow} from './ReleaseShow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {SubsPleaseApi} from '../SubsPleaseApi';
import {promiseEach} from '../HelperFunctions';

const ReleasesRoute = () => <Text>Music</Text>;
const AlbumsRoute = () => <Text>Albums</Text>;
const RecentsRoute = () => <Text>Recents</Text>;

type ReleaseTabProps = {
  shows: ShowInfo[],
  onRefresh: () => void;
  loadingData: boolean;
}
export const ReleasesTab = (props: ReleaseTabProps) => {
  const { shows, onRefresh, loadingData } = props;
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView>
      <FlatList
        data={shows} 
        renderItem={({item}) => <ReleaseShow showInfo={item} />}
        keyExtractor={show => `${show.page}${show.episode}`}/>
      {/* <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={loadingData}
            onRefresh={onRefresh}
          />
        }
        style={backgroundStyle}
        >
        {shows.map((show, index) => (
          
        ))}
      </ScrollView> */}
    </SafeAreaView>
  );
};
