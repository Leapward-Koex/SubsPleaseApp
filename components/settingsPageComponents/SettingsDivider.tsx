import * as React from 'react';
import {useWindowDimensions, View} from 'react-native';
import {useTheme} from 'react-native-paper';
import {Appearance} from 'react-native-appearance';

export const SettingsDivider = () => {
  const {colors} = useTheme();
  const {width} = useWindowDimensions();
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
          width: width - 4,
        }}
      />
    </View>
  );
};
