import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import {
    Alert,
    LayoutAnimation,
    Platform,
    UIManager,
    useColorScheme,
} from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BottomNavBar } from './components/BottomNavBar';
import nodejs from 'nodejs-mobile-react-native';
import Toast from 'react-native-toast-message';
import { localWebServerManager } from './services/LocalWebServerManager';
import { LogBox } from 'react-native';
import { FileLogger } from 'react-native-file-logger';
import notifee from '@notifee/react-native';
import { configure } from 'mobx';
import { RootStore, RootStoreProvider } from './stores/RootStore';

LogBox.ignoreLogs([
    'new NativeEventEmitter',
    "EventEmitter.removeListener('keyboardDidHide', ...)",
]); // Ignore log notification by message

// configure({
//     enforceActions: 'always',
//     computedRequiresReaction: true,
//     reactionRequiresObservable: true,
//     observableRequiresReaction: true,
//     disableErrorBoundaries: true,
// });

declare global {
    namespace ReactNativePaper {
        interface ThemeColors {
            secondary: string;
            tertiary: string;

            subsPleaseDark1: string;
            subsPleaseDark2: string;
            subsPleaseDark3: string;
            darkText: string;

            subsPleaseLight1: string;
            subsPleaseLight2: string;
            subsPleaseLight3: string;
            lightText: string;
        }
    }
}

const theme = {
    ...DefaultTheme,
    version: 3,
    colors: {
        ...DefaultTheme.colors,
        primary: '#cb2b78',
        secondary: '#7289da',
        tertiary: '#09d6d6',

        subsPleaseDark1: '#111111',
        subsPleaseDark2: '#1f1f1f',
        subsPleaseDark3: '#333333',
        darkText: '#c2c2c2',

        subsPleaseLight1: '#ffffff',
        subsPleaseLight2: '#f9f9f9',
        subsPleaseLight3: '#ebebeb',
        lightText: '#3d3d3d',
    },
};

const App = () => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const checkBatteryOptimisations = async () => {
        // 1. checks if battery optimization is enabled
        const batteryOptimizationEnabled =
            await notifee.isBatteryOptimizationEnabled();
        if (batteryOptimizationEnabled) {
            // 2. ask your users to disable the feature
            Alert.alert(
                'Restrictions Detected',
                'To ensure notifications are delivered, please disable battery optimization for the app.',
                [
                    // 3. launch intent to navigate the user to the appropriate screen
                    {
                        text: 'OK, open settings',
                        onPress: async () =>
                            await notifee.openBatteryOptimizationSettings(),
                    },
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                ],
                { cancelable: false },
            );
        }

        // 1. get info on the device and the Power Manager settings
        const powerManagerInfo = await notifee.getPowerManagerInfo();
        if (powerManagerInfo.activity) {
            // 2. ask your users to adjust their settings
            Alert.alert(
                'Restrictions Detected',
                'To ensure notifications are delivered, please adjust your settings to prevent the app from being killed',
                [
                    // 3. launch intent to navigate the user to the appropriate screen
                    {
                        text: 'OK, open settings',
                        onPress: async () =>
                            await notifee.openPowerManagerSettings(),
                    },
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                ],
                { cancelable: false },
            );
        }
    };

    useEffect(() => {
        (async () => {
            console.log('Starting initialisation code.');
            nodejs.start('main.js');
            nodejs.channel.addListener('message', (msg) => {
                if (msg.name === 'log') {
                    console.log(msg.text);
                }
            });
            if (Platform.OS === 'android') {
                if (UIManager.setLayoutAnimationEnabledExperimental) {
                    console.log('Setting layout animations');
                    UIManager.setLayoutAnimationEnabledExperimental(true);
                }
            }
            await FileLogger.configure();
            await notifee.cancelAllNotifications();
            await checkBatteryOptimisations();
        })();
        return () => {
            notifee.cancelAllNotifications();
            localWebServerManager.stopServer();
        };
    }, []);

    return (
        <NavigationContainer>
            <RootStoreProvider>
                <PaperProvider theme={theme}>
                    <BottomNavBar />
                    <Toast />
                </PaperProvider>
            </RootStoreProvider>
        </NavigationContainer>
    );
};

export default App;
