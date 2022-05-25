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
import { promiseEach, readTextFile } from '../HelperFunctions';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { ReleasesTab } from './ReleasesTab';
import { WatchListTab } from './WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo } from '../models/models';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
    Appearance,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { ImportExportListItem } from './settingsPageComponents/ExportImportSettings';
import { SavedShowLocationSettings } from './settingsPageComponents/SavedShowLocationSettings';
import { SettingsDivider } from './settingsPageComponents/SettingsDivider';
import { FileLogger } from 'react-native-file-logger';
import crashlytics from '@react-native-firebase/crashlytics';
import { firebase } from '@react-native-firebase/analytics';
import { StorageKeys } from '../enums/enum';

export const SettingsTab = () => {
    const { colors } = useTheme();
    const [logViewOpen, setLogViewOpen] = React.useState(false);
    const [logText, setLogText] = React.useState('');
    const [logFileName, setFileName] = React.useState('');
    const { height } = useWindowDimensions();
    const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);
    const [crashReportingEnabled, setCrashReportingEnabled] = React.useState(
        crashlytics().isCrashlyticsCollectionEnabled,
    );

    const backgroundStyle = {
        backgroundColor:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseLight2
                : colors.subsPleaseDark2,
    };

    const textStyle = {
        color:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseDark3
                : colors.subsPleaseLight1,
    };

    React.useEffect(() => {
        console.log('reading analytics');
        AsyncStorage.getItem(StorageKeys.AnalyticsEnabled).then((enabled) => {
            const savedAnalyticsEnabled = JSON.parse(
                enabled ?? 'true',
            ) as boolean;
            setAnalyticsEnabled(savedAnalyticsEnabled);
            firebase
                .analytics()
                .setAnalyticsCollectionEnabled(savedAnalyticsEnabled);
        });
    }, []);

    const displayLogs = async () => {
        const latestLogPath = (await FileLogger.getLogFilePaths())[0];
        setFileName(latestLogPath);
        if (latestLogPath) {
            const latestLogText = await readTextFile(latestLogPath);
            setLogText(latestLogText);
            setLogViewOpen(true);
        }
    };

    const toggleAnalytics = async () => {
        try {
            if (analyticsEnabled) {
                console.log('Disabling analytics..');
                await firebase.analytics().logEvent('opt_out_analytics');
            } else {
                console.log('Enabling analytics..');
            }
        } catch (ex) {
            console.error('Failed to change analytics state', ex);
        }
        await firebase
            .analytics()
            .setAnalyticsCollectionEnabled(!analyticsEnabled);
        await AsyncStorage.setItem(
            StorageKeys.AnalyticsEnabled,
            JSON.stringify(!analyticsEnabled),
        );
        setAnalyticsEnabled(!analyticsEnabled);
    };

    const toggleCrashlytics = async () => {
        await crashlytics()
            .setCrashlyticsCollectionEnabled(!crashReportingEnabled)
            .then(() =>
                setCrashReportingEnabled(
                    crashlytics().isCrashlyticsCollectionEnabled,
                ),
            );
    };

    const styles = StyleSheet.create({
        stretch: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 130,
            resizeMode: 'cover',
        },
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 22,
            maxHeight: '100%',
            overflow: 'scroll',
        },
        modalView: {
            maxHeight: height - 50,
            width: '90%',
            margin: 20,
            backgroundColor: 'white',
            borderRadius: 5,
            padding: 35,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        touchableStyle: {
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
        },
        button: {
            borderRadius: 20,
            padding: 10,
            elevation: 2,
        },
        buttonOpen: {
            backgroundColor: '#F194FF',
        },
        buttonClose: {
            backgroundColor: '#2196F3',
        },
        modalText: {
            marginBottom: 20,
            fontSize: 12,
        },
    });

    return (
        <>
            <Appbar.Header
                statusBarHeight={1}
                style={{ backgroundColor: colors.tertiary }}
            >
                <Appbar.Content color={'white'} title="Settings" />
            </Appbar.Header>
            <ScrollView style={backgroundStyle}>
                <SavedShowLocationSettings />
                <SettingsDivider />
                <ImportExportListItem type="Import" />
                <ImportExportListItem type="Export" />
                <SettingsDivider />
                <TouchableRipple
                    onPress={() => {
                        Alert.alert(
                            'Are you sure you want to clear all data?',
                            'This action cannot be undone.',
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'OK',
                                    onPress: async () => {
                                        console.log('Going to clear all data');
                                        await AsyncStorage.clear();
                                    },
                                },
                            ],
                        );
                    }}
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>Clear all data</Title>
                    </View>
                </TouchableRipple>
                <SettingsDivider />
                <TouchableRipple
                    onPress={() => toggleAnalytics()}
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>
                            {analyticsEnabled
                                ? 'Disable analytics'
                                : 'Enable analytics'}
                        </Title>
                    </View>
                </TouchableRipple>
                <TouchableRipple
                    onPress={() => toggleCrashlytics()}
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>
                            {crashReportingEnabled
                                ? 'Disable crash reporting'
                                : 'Enable crash reporting'}
                        </Title>
                    </View>
                </TouchableRipple>
                <TouchableRipple
                    onPress={() => displayLogs()}
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>View logs</Title>
                    </View>
                </TouchableRipple>
                <TouchableRipple
                    onPress={() =>
                        FileLogger.sendLogFilesByEmail({
                            subject: 'SubsPlease logs',
                        })
                    }
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>Send logs</Title>
                    </View>
                </TouchableRipple>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={false}
                visible={logViewOpen}
                onRequestClose={() => {
                    setLogViewOpen(!logViewOpen);
                }}
            >
                <View style={styles.centeredView}>
                    <Text>{logFileName}</Text>
                    <ScrollView>
                        <Text style={styles.modalText}>{logText}</Text>
                    </ScrollView>
                    <Button
                        style={{ marginTop: 15 }}
                        mode="contained"
                        onPress={() => setLogViewOpen(!logViewOpen)}
                    >
                        Close
                    </Button>
                </View>
            </Modal>
        </>
    );
};
