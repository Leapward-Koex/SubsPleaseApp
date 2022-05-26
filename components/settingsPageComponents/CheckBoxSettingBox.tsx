import * as React from 'react';
import { Title, TouchableRipple, useTheme } from 'react-native-paper';
import { Appearance, StyleSheet, View } from 'react-native';
import { FileLogger } from 'react-native-file-logger';
import { Switch } from 'react-native-paper';

type CheckBoxSettingsBoxType = {
    text: string;
    value: boolean;
    onChange: (newValue: boolean) => void;
};

export const CheckBoxSettingsBox = ({
    text,
    value,
    onChange,
}: CheckBoxSettingsBoxType) => {
    const { colors } = useTheme();
    const styles = StyleSheet.create({
        textStyle: {
            color:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseDark3
                    : colors.subsPleaseLight1,
        },
        touchableStyle: {
            height: 60,
            backgroundColor:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseLight3
                    : colors.subsPleaseDark1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            borderRadius: 0,
            marginBottom: 3,
        },
    });
    return (
        <View style={styles.touchableStyle}>
            <Title style={styles.textStyle}>{text}</Title>
            <View style={{ paddingRight: 10 }}>
                <Switch
                    value={value}
                    onValueChange={(newValue) => onChange(newValue)}
                />
            </View>
        </View>
    );
};
