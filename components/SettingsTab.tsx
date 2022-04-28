import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import {
  BottomNavigation,
  Text,
  Title,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {promiseEach} from '../HelperFunctions';
import {SubsPleaseApi} from '../SubsPleaseApi';
import {ReleasesTab} from './ReleasesTab';
import {WatchListTab} from './WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ShowInfo} from '../models/models';
import {
  FlatList,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import {ImportExportListItem} from './settingsPageComponents/ExportImportSettings';
import {SavedShowLocationSettings} from './settingsPageComponents/SavedShowLocationSettings';
import {SettingsDivider} from './settingsPageComponents/SettingsDivider';
import {Appearance} from 'react-native-appearance';

export const SettingsTab = () => {
  const {colors} = useTheme();

  const backgroundStyle = {
    backgroundColor:
      Appearance.getColorScheme() === 'light'
        ? colors.subsPleaseLight2
        : colors.subsPleaseDark2,
  };

  const textStyle = {
    color:
      Appearance.getColorScheme() === 'light'
        ? colors.subsPleaseDark3
        : colors.subsPleaseLight1,
  };

  const touchableStyle = {
    height: 60,
    backgroundColor: colors.subsPleaseDark1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    borderRadius: 4,
  };

  return (
    <>
      <Appbar.Header statusBarHeight={1}>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView style={backgroundStyle}>
        <SavedShowLocationSettings />
        <ImportExportListItem type="Export" />
        <SettingsDivider />
        <TouchableRipple
          onPress={() => AsyncStorage.clear()}
          style={touchableStyle}>
          <View>
            <Title style={textStyle}>Clear all data</Title>
          </View>
        </TouchableRipple>
      </ScrollView>
    </>
  );
};
