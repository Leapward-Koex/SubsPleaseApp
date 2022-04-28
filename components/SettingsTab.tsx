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
import {ImportExportListItem} from './ExportImportSettings';

export const SettingsTab = () => {
  return (
    <>
      <Appbar.Header statusBarHeight={1}>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <ScrollView>
        <ImportExportListItem type="Export" />
        <TouchableRipple onPress={() => AsyncStorage.clear()}>
          <View>
            <Title>Clear all data</Title>
          </View>
        </TouchableRipple>
      </ScrollView>
    </>
  );
};
