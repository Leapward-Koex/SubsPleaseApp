import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import {
    BottomNavigation,
    Button,
    Text,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { promiseEach } from '../../HelperFunctions';
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
    useWindowDimensions,
    View,
    Appearance,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { ImportExportListItem } from './ExportImportSettings';
import { StorageKeys } from '../../enums/enum';
import { Storage } from '../../services/Storage';

export interface SavedShowPaths {
    shows: {
        showName: string;
        showPath: string;
    }[];
}

export const SavedShowLocationSettings = () => {
    const { colors } = useTheme();
    const [savedShowPaths, setSavedShowPaths] =
        React.useState<SavedShowPaths>();
    const { height, width } = useWindowDimensions();

    const textStyle = {
        color:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseDark3
                : colors.subsPleaseLight1,
    };

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
        marginTop: 5,
        marginBottom: 5,
    };

    React.useEffect(() => {
        (async () => {
            const storedShowPaths = await Storage.getItem<SavedShowPaths>(
                StorageKeys.ShowPaths,
                {
                    shows: [],
                },
            );
            setSavedShowPaths(storedShowPaths);
        })();
    }, []);

    const addrandomshow = async () => {
        const storedShowPaths = await Storage.getItem<SavedShowPaths>(
            StorageKeys.ShowPaths,
            {
                shows: [],
            },
        );
        storedShowPaths.shows.push({
            showName: 'Shijou Saikyou no Daimaou, Murabito A ni Tensei suru',
            showPath: Math.random().toString(),
        });
        setSavedShowPaths({ ...storedShowPaths });
        await AsyncStorage.setItem(
            StorageKeys.ShowPaths,
            JSON.stringify(storedShowPaths),
        );
    };

    const removeShowFromSavedPaths = async (showName: string) => {
        const storedShowPaths = await Storage.getItem<SavedShowPaths>(
            StorageKeys.ShowPaths,
            {
                shows: [],
            },
        );
        const filteredShows = storedShowPaths.shows.filter(
            (show) => show.showName !== showName,
        );
        setSavedShowPaths({ shows: filteredShows });
        await AsyncStorage.setItem(
            StorageKeys.ShowPaths,
            JSON.stringify({ shows: filteredShows }),
        );
    };

    const getShowPaths = () => {
        if (savedShowPaths?.shows.length === 0) {
            return (
                <View
                    style={{
                        position: 'relative',
                        marginBottom: 10,
                        marginLeft: 10,
                        marginRight: 5,
                        padding: 5,
                        paddingLeft: 15,
                        backgroundColor:
                            Appearance.getColorScheme() === 'light'
                                ? colors.subsPleaseLight3
                                : colors.subsPleaseDark1,
                    }}
                >
                    <Title style={textStyle}>No shows to display.</Title>
                </View>
            );
        }
        return savedShowPaths?.shows.map((show, index) => {
            return (
                <View
                    key={index}
                    style={{
                        position: 'relative',
                        marginBottom: 10,
                        marginLeft: 10,
                        marginRight: 5,
                        padding: 5,
                        backgroundColor:
                            Appearance.getColorScheme() === 'light'
                                ? colors.subsPleaseLight3
                                : colors.subsPleaseDark1,
                    }}
                >
                    <View style={{ width: width - 120 }}>
                        <Text
                            style={Object.assign({ fontSize: 20 }, textStyle)}
                        >
                            {show.showName}
                        </Text>
                    </View>
                    <View style={{ marginLeft: 10, marginTop: 5 }}>
                        <Text
                            style={Object.assign({ fontSize: 16 }, textStyle)}
                        >
                            {show.showPath}
                        </Text>
                    </View>
                    <Button
                        mode="text"
                        compact
                        color={colors.tertiary}
                        onPress={() => removeShowFromSavedPaths(show.showName)}
                        style={{ position: 'absolute', right: 4, top: 4 }}
                    >
                        <Icon
                            name="trash-can-outline"
                            size={20}
                            color={colors.tertiary}
                        />
                        <Text style={{ color: colors.tertiary }}>Remove</Text>
                    </Button>
                </View>
            );
        });
    };

    if (!savedShowPaths) {
        return <></>;
    }
    return (
        <View>
            <View style={touchableStyle}>
                <Title style={Object.assign({ fontSize: 25 }, textStyle)}>
                    Series download paths
                </Title>
            </View>
            {getShowPaths()}
            {/* <Button onPress={() => addrandomshow()}>Add random show</Button> */}
        </View>
    );
};
