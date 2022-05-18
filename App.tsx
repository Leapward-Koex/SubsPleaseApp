import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BottomNavBar } from './components/BottomNavBar';
import nodejs from 'nodejs-mobile-react-native';
import Toast from 'react-native-toast-message';
import { localWebServerManager } from './services/LocalWebServerManager';
import { LogBox } from 'react-native';
import { FileLogger } from 'react-native-file-logger';
import { WakeLockInterface } from 'react-native-wake-lock';
import notifee from '@notifee/react-native';

LogBox.ignoreLogs([
    'new NativeEventEmitter',
    "EventEmitter.removeListener('keyboardDidHide', ...)",
]); // Ignore log notification by message
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

    useEffect(() => {
        (async () => {
            console.log('Starting initialisation code.');
            nodejs.start('main.js');
            nodejs.channel.addListener('message', (msg) => {
                if (msg.name === 'log') {
                    console.log(msg.text);
                }
            });
            await FileLogger.configure();
            await notifee.cancelAllNotifications();
        })();
        return () => {
            WakeLockInterface.releaseWakeLock();
            notifee.cancelAllNotifications();
            localWebServerManager.stopServer();
        };
    }, []);

    return (
        <NavigationContainer>
            <PaperProvider theme={theme}>
                <BottomNavBar />
                <Toast />
            </PaperProvider>
        </NavigationContainer>
    );
};

export default App;
