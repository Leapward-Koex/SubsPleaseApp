import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { isCastingAvailable, promiseEach } from '../HelperFunctions';
import { SubsPleaseApi } from '../ExternalApis/SubsPleaseApi';
import { ReleasesTab } from './ReleasesTab';
import { WatchListTab } from './WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo, WatchList } from '../models/models';
import { SettingsTab } from './SettingsTab';
import { CastSettingsTab } from './castPageComponents/CastSettingsTab';
import { logger } from '../services/Logger';
import { ShowFilter } from './releasePageComponents/ReleaseHeader';
import { StorageKeys } from '../enums/enum';
import {
    createStackNavigator,
    TransitionPresets,
} from '@react-navigation/stack';
import { ShowInformationModal } from './releasePageComponents/ShowInformationModal';
import { EditSettingsModal } from './EditSettingsModal';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

export const BottomNavBar = () => {
    const [castingAvailable, setCastingAvailable] = React.useState(false);

    const { colors } = useTheme();

    const ReleasesRoute = () => <ReleasesTab />;

    const WatchListRoute = () => <WatchListTab />;
    const CastSettingsRoute = () => <CastSettingsTab />;
    const SettingsRoute = () => <SettingsTab />;

    React.useEffect(() => {
        (async () => {
            setCastingAvailable(await isCastingAvailable());
        })();
    }, []);

    const getCastSettingsTab = () => {
        if (castingAvailable) {
            return (
                <Tab.Screen
                    name="Cast Settings"
                    component={CastSettingsRoute}
                    options={{
                        tabBarLabel: 'Cast Settings',
                        tabBarIcon: ({ color }) => (
                            <Icon name="cast" color={color} size={25} />
                        ),
                        tabBarColor: colors.secondary,
                    }}
                />
            );
        }
        return <></>;
    };

    const tabNavigator = () => {
        return (
            <Tab.Navigator shifting>
                <Tab.Screen
                    name="Releases"
                    component={ReleasesRoute}
                    options={{
                        tabBarLabel: 'Releases',
                        tabBarIcon: ({ color }) => (
                            <Icon name="new-box" color={color} size={25} />
                        ),
                        tabBarColor: colors.primary,
                    }}
                />
                {getCastSettingsTab()}
                <Tab.Screen
                    name="Watch list"
                    component={WatchListRoute}
                    options={{
                        tabBarLabel: 'Watch list',
                        tabBarIcon: ({ color }) => (
                            <Icon
                                name="playlist-play"
                                color={color}
                                size={25}
                            />
                        ),
                        tabBarColor: colors.secondary,
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={SettingsRoute}
                    options={{
                        tabBarLabel: 'Settings',
                        tabBarIcon: ({ color }) => (
                            <Icon name="cog-outline" color={color} size={25} />
                        ),
                        tabBarColor: colors.tertiary,
                    }}
                />
            </Tab.Navigator>
        );
    };

    return (
        <Stack.Navigator
            initialRouteName="ReleasesList"
            screenOptions={({ route, navigation }) => ({
                headerShown: false,
                gestureEnabled: true,
                ...TransitionPresets.ModalPresentationIOS,
            })}
        >
            <Stack.Screen name="ReleasesList" component={tabNavigator} />
            <Stack.Screen
                name="release-info"
                component={ShowInformationModal}
            />
            <Stack.Screen name="edit-settings" component={EditSettingsModal} />
        </Stack.Navigator>
    );
};
