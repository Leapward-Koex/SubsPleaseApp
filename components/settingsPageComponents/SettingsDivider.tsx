import * as React from 'react';
import {Animated, Dimensions, SafeAreaView, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {ReleaseShow} from '../ReleaseShow';
import {Appearance} from 'react-native-appearance';
import {ShowInfo, WatchList} from '../../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StorageKeys} from '../../enums/enum';
import {ReleaseTabHeader} from '../ReleaseHeader';
import {SubsPleaseApi} from '../../SubsPleaseApi';
import debounce from 'lodash.debounce';

export const SettingsDivider = () => {
  const {colors} = useTheme();
  const backgroundStyle = {
    backgroundColor:
      Appearance.getColorScheme() !== 'light'
        ? colors.subsPleaseDark2
        : colors.subsPleaseLight2,
  };

  return (
    <View
      style={{
        height: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: 1,
          width: Dimensions.get('window').width - 4,
        }}
      />
    </View>
  );
};
