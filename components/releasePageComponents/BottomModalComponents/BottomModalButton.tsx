import React from 'react';
import { Appearance, Text, View } from 'react-native';
import { ActivityIndicator, TouchableRipple } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BottomModalButtonProps {
    text: string;
    iconName: string;
    onPress: () => void;
    loading?: boolean;
}

export const BottomModalButton = ({
    text,
    iconName,
    loading,
    onPress,
}: BottomModalButtonProps) => {
    const { colors } = useTheme();
    const buttonColour =
        Appearance.getColorScheme() !== 'light'
            ? colors.subsPleaseDark3
            : colors.subsPleaseLight1;
    const textColour =
        Appearance.getColorScheme() !== 'light'
            ? colors.subsPleaseLight1
            : colors.subsPleaseDark3;
    return (
        <TouchableRipple
            onPress={onPress}
            style={{
                backgroundColor: buttonColour,
                marginBottom: 5,
                padding: 4,
                borderRadius: 5,
                height: 40,
            }}
        >
            {loading ? (
                <View>
                    <ActivityIndicator
                        animating={true}
                        style={{
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginTop: 6,
                            marginBottom: 6,
                        }}
                        size={20}
                        color={colors.primary}
                    />
                </View>
            ) : (
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 3,
                    }}
                >
                    <View style={{ width: 30 }}>
                        <Icon
                            name={iconName}
                            color={colors.subsPleaseLight1}
                            size={25}
                        />
                    </View>
                    <View>
                        <Text style={{ color: textColour }}>{text}</Text>
                    </View>
                </View>
            )}
        </TouchableRipple>
    );
};
