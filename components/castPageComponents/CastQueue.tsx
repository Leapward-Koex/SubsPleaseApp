import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import {
    BottomNavigation,
    Button,
    IconButton,
    Text,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {
    formatSecondsToMinutesSeconds,
    getFileNameFromFilePath,
    getRealPathFromContentUri,
    promiseEach,
} from '../../HelperFunctions';
import { SubsPleaseApi } from '../../SubsPleaseApi';
import { ReleasesTab } from '../ReleasesTab';
import { WatchListTab } from '../WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo } from '../../models/models';
import {
    FlatList,
    ImageBackground,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
    Appearance,
    Animated,
    Easing,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { ImportExportListItem } from '../settingsPageComponents/ExportImportSettings';
import { SavedShowLocationSettings } from '../settingsPageComponents/SavedShowLocationSettings';
import { SettingsDivider } from '../settingsPageComponents/SettingsDivider';
import {
    CastButton,
    MediaPlayerState,
    useRemoteMediaClient,
} from 'react-native-google-cast';
import { Slider } from '@miblanchard/react-native-slider';
import { pick } from 'react-native-document-picker';
import { CastShow } from './CastShow';

type CastQueueType = {
    files: string[];
    onItemRemoved: (fileName: string) => void;
};

export const CastQueue = ({ files, onItemRemoved }: CastQueueType) => {
    const [castQueueShown, setCastQueueShown] = React.useState(false);
    const { colors } = useTheme();
    const { height } = useWindowDimensions();

    const queueHeight = height - 120;
    const styles = StyleSheet.create({
        queue: {
            backgroundColor: 'red',
            height: queueHeight,
            position: 'absolute',
            width: '100%',
            zIndex: 2,
            elevation: 3,
            paddingTop: 25,
        },
    });

    const rotation = React.useRef(new Animated.Value(0)).current;
    const rotationMap = rotation.interpolate({
        inputRange: [0, 90, 180],
        outputRange: ['0deg', '90deg', '180deg'],
    });
    const translation = React.useRef(new Animated.Value(0)).current;
    const translateMap = translation.interpolate({
        inputRange: [0, 1],
        outputRange: [-queueHeight, 0],
    });
    let transformStyle = {
        ...styles.queue,
        transform: [{ translateY: translateMap }],
    };
    const toggleCastQueueDropDown = () => {
        rotation.setValue(castQueueShown ? 180 : 0);
        Animated.timing(rotation, {
            toValue: castQueueShown ? 0 : 180,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();

        translation.setValue(castQueueShown ? 1 : 0);
        Animated.timing(translation, {
            toValue: castQueueShown ? 0 : 1,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();
        setCastQueueShown(!castQueueShown);
    };
    return (
        <View style={{ elevation: 3, zIndex: 3 }}>
            <Animated.View style={transformStyle}>
                <Text>My queue</Text>
                {files.map((file, index) => {
                    const fileName = getFileNameFromFilePath(file);
                    return (
                        <CastShow
                            key={index}
                            showName={fileName}
                            filePath={file}
                            onRemove={() => onItemRemoved(file)}
                        />
                    );
                })}
            </Animated.View>
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    zIndex: 3,
                    backgroundColor: colors.subsPleaseDark3,
                }}
            >
                <View>
                    <Text>Show name/episode here</Text>
                </View>
                <Animated.View
                    style={{
                        transform: [{ rotate: rotationMap }],
                    }}
                >
                    <IconButton
                        color={colors.subsPleaseLight1}
                        onPress={() => toggleCastQueueDropDown()}
                        icon={'chevron-down'}
                    />
                </Animated.View>
            </View>
        </View>
    );
};
