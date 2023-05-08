/**
 * @format
 */
import './wdyr';
import { AppRegistry } from 'react-native';
import App from './App';
import notifee from '@notifee/react-native';

notifee.registerForegroundService((notification) => {
    return new Promise(() => {
        console.log('notification callback');
    });
});
AppRegistry.registerComponent('YoRHa', () => App);
