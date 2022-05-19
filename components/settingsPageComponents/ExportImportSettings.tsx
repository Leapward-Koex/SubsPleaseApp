import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import {
    BottomNavigation,
    Text,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {
    getRealPathFromContentUri,
    promiseEach,
    requestStoragePermission,
} from '../../HelperFunctions';
import { SubsPleaseApi } from '../../SubsPleaseApi';
import { ReleasesTab } from '../ReleasesTab';
import { WatchListTab } from '../WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo } from '../../models/models';
import {
    FlatList,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    View,
    Appearance,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { pickDirectory } from 'react-native-document-picker';
import nodejs from 'nodejs-mobile-react-native';
import { logger } from '../../services/Logger';

type ImportExportListItemProps = {
    type: 'Import' | 'Export';
};

export const ImportExportListItem = ({ type }: ImportExportListItemProps) => {
    const { colors } = useTheme();
    const backupFileName = 'subsPleaseBackup.json';
    const touchableStyle = {
        height: 60,
        backgroundColor:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseLight3
                : colors.subsPleaseDark1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        borderRadius: 0,
        marginBottom: 3,
    };

    const textStyle = {
        color:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseDark3
                : colors.subsPleaseLight1,
    };

    const importData = async () => {
        await requestStoragePermission();
        const fileLocation = await pickDirectory();
        let path = '';
        if (!fileLocation) {
            console.warn('No file location selected');
            return;
        } else {
            path =
                (await getRealPathFromContentUri(fileLocation.uri)) +
                '/' +
                backupFileName;
        }

        const callbackId = (Math.random() + 1).toString(36).substring(7);
        nodejs.channel.addListener('message', async (msg) => {
            if (msg.callbackId === callbackId) {
                if (msg.error) {
                    logger.error(msg.error);
                } else {
                    const importedSettings = JSON.parse(msg.payload) as [
                        string,
                        string | null,
                    ][];
                    const nonNullSettings = importedSettings.filter(
                        (setting) => setting[1] !== null,
                    ) as [string, string][];
                    await AsyncStorage.multiSet(nonNullSettings);
                    console.log('Successfully restored settings');
                }
            }
        });
        nodejs.channel.send({
            name: 'read-json',
            callbackId,
            fileName: path,
        });
    };

    const exportData = async () => {
        await requestStoragePermission();
        const keys = await AsyncStorage.getAllKeys();
        const keyValues = await AsyncStorage.multiGet(keys);
        const fileLocation = await pickDirectory();
        let path = '';
        if (!fileLocation) {
            console.warn('No file location selected');
            return;
        } else {
            path =
                (await getRealPathFromContentUri(fileLocation.uri)) +
                '/' +
                backupFileName;
        }

        const callbackId = (Math.random() + 1).toString(36).substring(7);
        nodejs.channel.addListener('message', async (msg) => {
            if (msg.callbackId === callbackId) {
                if (msg.error) {
                    console.error(msg.error);
                } else {
                    console.log('Successfully backed up settings');
                }
            }
        });
        nodejs.channel.send({
            name: 'write-json',
            callbackId,
            fileName: path,
            payload: JSON.stringify(keyValues),
        });
    };

    return (
        <TouchableRipple
            style={touchableStyle}
            onPress={() => (type === 'Import' ? importData() : exportData())}
        >
            <View>
                <Title style={textStyle}>{type} data</Title>
            </View>
        </TouchableRipple>
    );
};
