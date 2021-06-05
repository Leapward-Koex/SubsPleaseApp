import * as React from 'react';
import {FlatList, RefreshControl, SafeAreaView, ScrollView, useColorScheme} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {ShowInfo, SubsPleaseShowApiResult} from './BottomNavBar';
import {ReleaseShow} from './ReleaseShow';
import { Appearance, AppearanceProvider } from 'react-native-appearance'
import {
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
  const { colors } = useTheme();

  const backgroundStyle = {
    backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseDark2 : colors.subsPleaseLight2,
  };

  return (
    <SafeAreaView>
      <FlatList
        style={backgroundStyle}
        data={shows} 
        renderItem={({item}) => <ReleaseShow showInfo={item} />}
        keyExtractor={show => `${show.page}${show.episode}`}/>
    </SafeAreaView>
  );
};
