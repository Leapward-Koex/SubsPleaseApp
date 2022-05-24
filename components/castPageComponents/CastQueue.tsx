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
    getExtensionlessFilepath,
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
    castQueueShown: boolean;
    onCastQueueShownChange: (castQueueShown: boolean) => void;
    currentlyPlayingFile: string;
};

export const CastQueue = ({
    files,
    onItemRemoved,
    currentlyPlayingFile,
    onCastQueueShownChange,
    castQueueShown,
}: CastQueueType) => {
    const { colors } = useTheme();
    const { height } = useWindowDimensions();
    const [castQueueShownInternal, setCastQueueShownInternal] =
        React.useState(false);
    const queueHeight = height - 120;
    const styles = StyleSheet.create({
        queue: {
            backgroundColor: colors.subsPleaseDark3,
            height: queueHeight,
            position: 'absolute',
            width: '100%',
            zIndex: 2,
            elevation: 3,
            paddingTop: 43,
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

    const showCastQueue = React.useCallback(() => {
        rotation.setValue(0);
        Animated.timing(rotation, {
            toValue: 180,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();

        translation.setValue(0);
        Animated.timing(translation, {
            toValue: 1,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();
    }, [rotation, translation]);

    const hideCastQueue = React.useCallback(() => {
        rotation.setValue(180);
        Animated.timing(rotation, {
            toValue: 0,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();

        translation.setValue(1);
        Animated.timing(translation, {
            toValue: 0,
            duration: 400,
            easing: Easing.cubic,
            useNativeDriver: true,
        }).start();
    }, [rotation, translation]);

    if (castQueueShown !== castQueueShownInternal) {
        castQueueShown ? showCastQueue() : hideCastQueue();
        setCastQueueShownInternal(castQueueShown);
    }

    const getCastQueueText = () => {
        if (currentlyPlayingFile) {
            const extensionlessFilePath =
                getExtensionlessFilepath(currentlyPlayingFile);
            const fileName = getFileNameFromFilePath(extensionlessFilePath);
            return `Currently playing: ${fileName}`;
        }
        return 'No media playing';
    };
    return (
        <View style={{ elevation: 3, zIndex: 3 }}>
            <Animated.View style={transformStyle}>
                {files.map((file, index) => {
                    const fileName = getFileNameFromFilePath(file);
                    return (
                        <CastShow
                            key={index}
                            showName={fileName}
                            filePath={file}
                            isCurrentlyPlayingMedia={
                                currentlyPlayingFile === file
                            }
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
                    backgroundColor: colors.subsPleaseDark2,
                }}
            >
                <View
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        paddingTop: 8,
                        paddingLeft: 8,
                    }}
                >
                    <Text
                        style={{
                            color: colors.subsPleaseLight1,
                            fontSize: 20,
                        }}
                    >
                        {getCastQueueText()}
                    </Text>
                </View>
                <Animated.View
                    style={{
                        transform: [{ rotate: rotationMap }],
                    }}
                >
                    <IconButton
                        color={colors.subsPleaseLight1}
                        onPress={() => {
                            onCastQueueShownChange(!castQueueShown);
                        }}
                        icon={'chevron-down'}
                    />
                </Animated.View>
            </View>
        </View>
    );
};
