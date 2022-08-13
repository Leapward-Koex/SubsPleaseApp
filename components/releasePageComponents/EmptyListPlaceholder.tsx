import React from 'react';
import { Animated, Appearance, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from 'react-native-paper';

export const EmptyListPlaceholder = ({ show }: { show: boolean }) => {
    const animation = React.useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    React.useEffect(() => {
        console.log('showing snca');
        Animated.timing(animation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [animation]);

    const styles = StyleSheet.create({
        font: {
            color:
                Appearance.getColorScheme() !== 'light'
                    ? colors.darkText
                    : colors.lightText,
            fontSize: 20,
        },
    });

    const opacityMap = animation.interpolate({
        inputRange: [0, 0.9],
        outputRange: [0, 1],
    });
    const scaleMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });
    const translateMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [150, 0],
    });
    return show ? (
        <View
            style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                opacity: 0.5,
            }}
        >
            <Animated.View
                style={{
                    opacity: opacityMap,
                    transform: [
                        { translateX: translateMap },
                        { scale: scaleMap },
                    ],
                }}
            >
                <LottieView
                    autoPlay
                    speed={0.3}
                    style={{
                        width: '70%',
                        marginTop: 20,
                        marginBottom: 30,
                    }}
                    resizeMode="cover"
                    source={require('../../resources/animations/empty.json')}
                />
            </Animated.View>
            <Animated.View
                style={{
                    opacity: opacityMap,
                }}
            >
                <Text style={styles.font}>Nothing here..</Text>
            </Animated.View>
        </View>
    ) : (
        <></>
    );
};
