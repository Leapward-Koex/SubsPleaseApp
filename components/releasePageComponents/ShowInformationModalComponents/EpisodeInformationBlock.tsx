import React from 'react';
import { View, ToastAndroid } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type EpisodeInformationBlockProps = {
    iconName: string;
    value?: string;
    onPress?: () => void;
    toastMessage?: string;
};

export const EpisodeInformationBlock = ({
    iconName,
    value,
    onPress,
    toastMessage,
}: EpisodeInformationBlockProps) => {
    const { colors } = useTheme();
    return (
        <TouchableRipple
            style={{
                borderRadius: 5,
                margin: 5,
                backgroundColor: colors.secondary,
            }}
            onPress={
                onPress
                    ? onPress
                    : () =>
                          ToastAndroid.showWithGravityAndOffset(
                              toastMessage ?? 'NO MESSAGE SET',
                              ToastAndroid.SHORT,
                              ToastAndroid.BOTTOM,
                              25,
                              50,
                          )
            }
        >
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 60,
                    width: 60,
                    padding: 5,
                }}
            >
                <Icon
                    name={iconName}
                    color={colors.subsPleaseLight1}
                    size={value ? 25 : 30}
                />
                {value && (
                    <Text
                        style={{ color: colors.subsPleaseLight1, fontSize: 14 }}
                    >
                        {value}
                    </Text>
                )}
            </View>
        </TouchableRipple>
    );
};
