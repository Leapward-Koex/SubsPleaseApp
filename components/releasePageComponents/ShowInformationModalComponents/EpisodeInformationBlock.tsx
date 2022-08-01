import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type EpisodeInformationBlockProps = {
    iconName: string;
    value?: string;
    onPress?: () => void;
};

export const EpisodeInformationBlock = ({
    iconName,
    value,
    onPress,
}: EpisodeInformationBlockProps) => {
    const { colors } = useTheme();
    return (
        <TouchableRipple
            style={{
                borderRadius: 5,
                backgroundColor: colors.secondary,
            }}
            onPress={onPress}
        >
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 60,
                    width: 60,
                    margin: 5,
                    padding: 5,
                }}
            >
                <Icon
                    name={iconName}
                    color={colors.subsPleaseLight1}
                    size={value ? 30 : 40}
                />
                {value && (
                    <Text
                        style={{ color: colors.subsPleaseLight1, fontSize: 16 }}
                    >
                        {value}
                    </Text>
                )}
            </View>
        </TouchableRipple>
    );
};
