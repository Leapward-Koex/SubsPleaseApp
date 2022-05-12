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
import { formatSecondsToMinutesSeconds, promiseEach } from '../HelperFunctions';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { ReleasesTab } from './ReleasesTab';
import { WatchListTab } from './WatchListTab';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ShowInfo } from '../models/models';
import {
    FlatList,
    ImageBackground,
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
import {
    CastButton,
    MediaPlayerState,
    useRemoteMediaClient,
} from 'react-native-google-cast';
import { Slider } from '@miblanchard/react-native-slider';

export const CastSettingsTab = () => {
    const [currentSeconds, setCurrentSeconds] = React.useState(0);
    const [streamDuration, setStreamDuration] = React.useState(0);
    const [backgroundImageUrl, setBackgroundImageUrl] = React.useState('');
    const [sliderValue, setSliderValue] = React.useState(0);
    const [draggingSlider, setDraggingSlider] = React.useState(false);
    const [playState, setPlayState] = React.useState<MediaPlayerState>(
        MediaPlayerState.IDLE,
    );
    const { colors } = useTheme();
    const { height, width } = useWindowDimensions();
    const client = useRemoteMediaClient();
    const percentComplete =
        streamDuration === 0 ? 0 : currentSeconds / streamDuration;

    const backgroundStyle = {
        backgroundColor:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseLight2
                : colors.subsPleaseDark2,
        height: '100%',
        display: 'flex',
    };

    const textStyle = {
        color:
            Appearance.getColorScheme() === 'light'
                ? colors.subsPleaseDark3
                : colors.subsPleaseLight1,
    };

    React.useEffect(() => {
        let mediaStatusListener: { remove: () => void } | undefined;
        let mediaProgressListener: { remove: () => void } | undefined;
        if (client) {
            mediaStatusListener = client.onMediaStatusUpdated((status) => {
                const firstItemInQueue = status?.queueItems[0];
                if (firstItemInQueue) {
                    setStreamDuration(
                        firstItemInQueue.mediaInfo.streamDuration ?? 0,
                    );
                    setBackgroundImageUrl(
                        firstItemInQueue.mediaInfo.metadata?.images?.[0].url ||
                            '',
                    );
                }
                setPlayState(status?.playerState || MediaPlayerState.IDLE);
            });
            mediaProgressListener = client.onMediaProgressUpdated(
                async (streamPosition) => {
                    if (!draggingSlider) {
                        setSliderValue(streamPosition / streamDuration);
                        setCurrentSeconds(streamPosition);
                    }
                    const status = await client.getMediaStatus();
                    setPlayState(status?.playerState || MediaPlayerState.IDLE);
                },
            );
        }
        return () => {
            mediaStatusListener?.remove();
            mediaProgressListener?.remove();
        };
    }, [client, draggingSlider, streamDuration]);

    const handleSlidingComplete = (value: number) => {
        setSliderValue(value);
        if (client) {
            client.seek({
                position: value * streamDuration,
                /** Whether the time interval is relative to the current stream position (`true`) or to the beginning of the stream (`false`). The default value is `false`, indicating an absolute seek position. */
                relative: false,
                /** The action to take after the seek operation has finished. If not specified, it will preserve current play state. */
                resumeState: 'play',
            });
        }
    };

    const handlePlayPause = () => {
        if (client) {
            playState === MediaPlayerState.PLAYING
                ? client.pause()
                : client.play();
        }
    };

    const skip = (duration: number) => {
        setSliderValue(currentSeconds + duration / streamDuration);
        if (client) {
            client.seek({
                position: duration,
                /** Whether the time interval is relative to the current stream position (`true`) or to the beginning of the stream (`false`). The default value is `false`, indicating an absolute seek position. */
                relative: true,
                /** The action to take after the seek operation has finished. If not specified, it will preserve current play state. */
                resumeState: 'play',
            });
        }
    };

    const hasBackground = !!backgroundImageUrl;

    const buttonSizes = {
        small: width * 0.06,
        medium: width * 0.08,
        large: width * 0.1,
    };

    return (
        <View style={backgroundStyle}>
            <Appbar.Header
                statusBarHeight={1}
                style={{ backgroundColor: colors.secondary }}
            >
                <Appbar.Content color={'white'} title="Casting" />
                <CastButton
                    style={{
                        width: 50,
                        height: 24,
                        top: 0,
                        tintColor: 'white',
                    }}
                />
            </Appbar.Header>
            {hasBackground && (
                <ImageBackground
                    style={{
                        width: '100%',
                        height: height - 320,
                    }}
                    source={{ uri: backgroundImageUrl }}
                    blurRadius={2}
                >
                    <View>
                        {/* <Text>Show Title</Text>
		<Text>Episode Title</Text> */}
                    </View>
                </ImageBackground>
            )}
            {!hasBackground && (
                <View
                    style={{
                        width: '100%',
                        height: height - 320,
                    }}
                >
                    <View>
                        {/* <Text>Show Title</Text>
		<Text>Episode Title</Text> */}
                    </View>
                </View>
            )}

            <View style={{ backgroundColor: colors.subsPleaseDark2 }}>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        // marginLeft: 80,
                        // marginRight: 80,
                    }}
                >
                    <IconButton
                        color={colors.primary}
                        onPress={() => null}
                        size={buttonSizes.small}
                        icon={'skip-previous-outline'}
                    />
                    <IconButton
                        color={colors.primary}
                        onPress={() => skip(-10)}
                        icon={'rewind-10'}
                        size={buttonSizes.medium}
                    />
                    <IconButton
                        color={colors.primary}
                        onPress={() => handlePlayPause()}
                        disabled={playState === MediaPlayerState.IDLE}
                        icon={
                            playState === MediaPlayerState.PLAYING
                                ? 'pause'
                                : 'play'
                        }
                        size={buttonSizes.large}
                    />
                    <IconButton
                        color={colors.primary}
                        onPress={() => skip(10)}
                        icon={'fast-forward-10'}
                        size={buttonSizes.medium}
                    />
                    <IconButton
                        color={colors.primary}
                        onPress={() => null}
                        icon={'skip-next-outline'}
                        size={buttonSizes.medium}
                    />
                </View>
                <View style={{ marginLeft: 10, marginRight: 10 }}>
                    <Slider
                        disabled={!client}
                        animateTransitions
                        minimumTrackTintColor={colors.primary}
                        thumbTintColor={colors.primary}
                        renderAboveThumbComponent={(index) => {
                            if (draggingSlider) {
                                return (
                                    <View style={{ marginRight: 5 }}>
                                        <Text style={textStyle}>
                                            {formatSecondsToMinutesSeconds(
                                                Math.round(
                                                    sliderValue *
                                                        streamDuration,
                                                ),
                                            )}
                                        </Text>
                                    </View>
                                );
                            }
                            return <></>;
                        }}
                        onSlidingStart={() => setDraggingSlider(true)}
                        onSlidingComplete={(value) => {
                            setDraggingSlider(false);
                            handleSlidingComplete(value as number);
                        }}
                        onValueChange={(value) =>
                            setSliderValue(value as number)
                        }
                        value={percentComplete}
                    />
                </View>

                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 15,
                        marginLeft: 5,
                        marginRight: 5,
                    }}
                >
                    <Text style={textStyle}>
                        {formatSecondsToMinutesSeconds(
                            Math.round(currentSeconds),
                        )}
                    </Text>
                    <Text style={textStyle}>
                        {formatSecondsToMinutesSeconds(
                            Math.round(streamDuration),
                        )}
                    </Text>
                </View>
            </View>
        </View>
    );
};
