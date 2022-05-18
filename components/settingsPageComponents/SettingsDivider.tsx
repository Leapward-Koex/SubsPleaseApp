import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Appearance } from 'react-native-appearance';

export const SettingsDivider = () => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const backgroundStyle = {
        backgroundColor:
            Appearance.getColorScheme() !== 'light'
                ? colors.subsPleaseDark2
                : colors.subsPleaseLight2,
    };

    return (
        <View
            style={{
                marginTop: 2,
                marginBottom: 4,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    borderBottomColor: '#555555',
                    borderBottomWidth: 1,
                    width: width,
                }}
            />
        </View>
    );
};
