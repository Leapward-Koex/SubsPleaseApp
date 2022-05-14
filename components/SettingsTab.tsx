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
    FlatList,
    Modal,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { ImportExportListItem } from './settingsPageComponents/ExportImportSettings';
import { SavedShowLocationSettings } from './settingsPageComponents/SavedShowLocationSettings';
import { SettingsDivider } from './settingsPageComponents/SettingsDivider';
import { Appearance } from 'react-native-appearance';
import { FileLogger } from 'react-native-file-logger';

export const SettingsTab = () => {
    const { colors } = useTheme();
    const [logViewOpen, setLogViewOpen] = React.useState(false);
    const [logText, setLogText] = React.useState('');
    const [logFileName, setFileName] = React.useState('');
    const scrollViewRef = React.useRef();
    const { height } = useWindowDimensions();

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

    const displayLogs = async () => {
        const latestLogPath = (await FileLogger.getLogFilePaths())[0];
        setFileName(latestLogPath);
        if (latestLogPath) {
            const latestLogText = await readTextFile(latestLogPath);
            setLogText(latestLogText);
            setLogViewOpen(true);
        }
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
            backgroundColor: colors.subsPleaseDark1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 20,
            borderRadius: 4,
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
                    onPress={() => AsyncStorage.clear()}
                    style={styles.touchableStyle}
                >
                    <View>
                        <Title style={textStyle}>Clear all data</Title>
                    </View>
                </TouchableRipple>
                <SettingsDivider />
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
