import React from 'react';
import { Animated, Appearance, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from 'react-native-paper';

export const EmptyListPlaceholder = () => {
    const animation = React.useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    React.useEffect(() => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 600,
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
        background: {
            backgroundColor:
                Appearance.getColorScheme() !== 'light'
                    ? colors.subsPleaseDark2
                    : colors.subsPleaseLight3,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
        },
    });

    const opacityMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.background}>
            <Animated.View
                needsOffscreenAlphaCompositing
                style={{
                    opacity: opacityMap,
                }}
            >
                <LottieView
                    autoPlay
                    speed={1}
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
    );
};
