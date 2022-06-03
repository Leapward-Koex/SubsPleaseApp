import uniqBy from 'lodash.uniqby';
import * as React from 'react';
import { IconButton, Text, useTheme } from 'react-native-paper';
import {
    formatSecondsToMinutesSeconds,
    getRealPathFromContentUri,
} from '../../HelperFunctions';
import { ImageBackground, StyleSheet, View, Appearance } from 'react-native';
import { Appbar } from 'react-native-paper';
import {
    CastButton,
    MediaPlayerIdleReason,
    MediaPlayerState,
    useRemoteMediaClient,
} from 'react-native-google-cast';
import { Slider } from '@miblanchard/react-native-slider';
import { pick } from 'react-native-document-picker';
import { CastQueue } from './CastQueue';
import { convert } from '../../services/converter';
import { CastPlayerButtonControls } from './castPlayerButtonControls';

export const CastSettingsTab = () => {
    const [currentSeconds, setCurrentSeconds] = React.useState(0);
    const [streamDuration, setStreamDuration] = React.useState(0);
    const [backgroundImageUrl, setBackgroundImageUrl] = React.useState('');
    const [sliderValue, setSliderValue] = React.useState(0);
    const [draggingSlider, setDraggingSlider] = React.useState(false);
    const [currentlyPlayingFile, setCurrentlyPlayingFile] = React.useState('');
    const [castQueueShown, setCastQueueShown] = React.useState(false);
    const [videoPathsToCast, setVideoPathsToCast] = React.useState<string[]>(
        [],
    );
    const [playState, setPlayState] = React.useState<MediaPlayerState>(
        MediaPlayerState.IDLE,
    );
    const { colors } = useTheme();
    const client = useRemoteMediaClient();

    const styles = StyleSheet.create({
        textStyle: {
            color: colors.subsPleaseLight1,
        },
        backgroundStyle: {
            backgroundColor:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseLight2
                    : colors.subsPleaseDark2,
            height: '100%',
            display: 'flex',
        },
        controlContainer: {
            backgroundColor: '#333333AA',
            position: 'absolute',
            bottom: 55,
            left: 0,
            right: 0,
            zIndex: 1,
            elevation: 1,
        },
        playerImageBackground: {
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundColor:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseLight2
                    : colors.subsPleaseDark2,
        },
        playerNoImageBackgorund: {
            width: '100%',
            height: '100%',
            backgroundColor:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseLight2
                    : colors.subsPleaseDark2,
        },
        appBar: {
            backgroundColor: colors.secondary,
            zIndex: 2,
            elevation: 2,
        },
        castBar: {
            width: 50,
            height: 24,
            top: 0,
            tintColor: 'white',
        },
        timeStampContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
            marginLeft: 5,
            marginRight: 5,
        },
        timeRemainingContainer: { marginLeft: 10, marginRight: 10 },
    });

    React.useEffect(() => {
        let mediaStatusListener: { remove: () => void } | undefined;
        let mediaProgressListener: { remove: () => void } | undefined;
        if (client) {
            mediaStatusListener = client.onMediaStatusUpdated(
                async (status) => {
                    const firstItemInQueue = status?.queueItems[0];
                    if (firstItemInQueue) {
                        setStreamDuration(
                            firstItemInQueue.mediaInfo.streamDuration ?? 0,
                        );
                        if (
                            firstItemInQueue.mediaInfo.metadata?.images &&
                            firstItemInQueue.mediaInfo.metadata?.images?.[0]
                        ) {
                            // Getting image from series image from SubsPleaseApi
                            setBackgroundImageUrl(
                                firstItemInQueue.mediaInfo.metadata.images[0]
                                    .url,
                            );
                        } else if (
                            (status?.mediaInfo?.customData as any)?.filePath
                        ) {
                            // From extracted thumbnail in video
                            const b64Thumnail =
                                await convert.getB64VideoThumbnail(
                                    (status!.mediaInfo!.customData as any)!
                                        .filePath,
                                );
                            setBackgroundImageUrl(b64Thumnail);
                        }
                    }
                    if ((status?.mediaInfo?.customData as any)?.filePath) {
                        setCurrentlyPlayingFile(
                            (status!.mediaInfo!.customData as any)!.filePath,
                        );
                    } else {
                        setCurrentlyPlayingFile('');
                    }

                    if (
                        status?.playerState === MediaPlayerState.IDLE &&
                        (status?.idleReason ===
                            MediaPlayerIdleReason.CANCELLED ||
                            status?.idleReason ===
                                MediaPlayerIdleReason.ERROR ||
                            status?.idleReason ===
                                MediaPlayerIdleReason.FINISHED)
                    ) {
                        setCurrentlyPlayingFile('');
                        setBackgroundImageUrl('');
                    }
                    setPlayState(status?.playerState || MediaPlayerState.IDLE);
                },
            );

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

    const handleSlidingComplete = React.useCallback(
        (value: number) => {
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
        },
        [client, streamDuration],
    );

    const handlePlayPause = React.useCallback(() => {
        if (client) {
            playState === MediaPlayerState.PLAYING
                ? client.pause()
                : client.play();
        }
    }, [client, playState]);

    const skip = React.useCallback(
        (duration: number) => {
            setSliderValue((currentSeconds + duration) / streamDuration);
            if (client) {
                client.seek({
                    position: duration,
                    /** Whether the time interval is relative to the current stream position (`true`) or to the beginning of the stream (`false`). The default value is `false`, indicating an absolute seek position. */
                    relative: true,
                    /** The action to take after the seek operation has finished. If not specified, it will preserve current play state. */
                    resumeState: 'play',
                });
            }
        },
        [client, currentSeconds, streamDuration],
    );

    const hasBackground = !!backgroundImageUrl;

    const openFileSelector = React.useCallback(async () => {
        try {
            const pickResults = await pick({
                allowMultiSelection: true,
                type: 'video/*',
            });
            const filePaths: string[] = [];
            for (const pickResult of pickResults) {
                filePaths.push(await getRealPathFromContentUri(pickResult.uri));
            }
            console.log('Queue of filepaths:', filePaths);
            const joinedVideoPaths = videoPathsToCast.concat(filePaths);
            setVideoPathsToCast(uniqBy(joinedVideoPaths, (path) => path));
            setCastQueueShown(true);
        } catch {}
    }, [videoPathsToCast]);

    const getBackground = () => {
        if (hasBackground) {
            return (
                <View style={styles.playerImageBackground}>
                    <CastQueue
                        files={videoPathsToCast}
                        onItemRemoved={(fileName) =>
                            setVideoPathsToCast(
                                videoPathsToCast.filter(
                                    (videoPath) => videoPath !== fileName,
                                ),
                            )
                        }
                        castQueueShown={castQueueShown}
                        onCastQueueShownChange={setCastQueueShown}
                        currentlyPlayingFile={currentlyPlayingFile}
                    />
                    <ImageBackground
                        style={{
                            width: '100%',
                            flexGrow: 1,
                        }}
                        source={{ uri: backgroundImageUrl }}
                        blurRadius={2}
                    >
                        {getControls()}
                    </ImageBackground>
                </View>
            );
        }
        return (
            <View style={styles.playerNoImageBackgorund}>
                <CastQueue
                    files={videoPathsToCast}
                    onItemRemoved={(fileName) =>
                        setVideoPathsToCast(
                            videoPathsToCast.filter(
                                (videoPath) => videoPath !== fileName,
                            ),
                        )
                    }
                    castQueueShown={castQueueShown}
                    onCastQueueShownChange={setCastQueueShown}
                    currentlyPlayingFile={currentlyPlayingFile}
                />
                {getControls()}
            </View>
        );
    };

    const thumbComponent = React.useCallback(() => {
        if (draggingSlider) {
            return (
                <View style={{ marginRight: 5 }}>
                    <Text style={styles.textStyle}>
                        {formatSecondsToMinutesSeconds(
                            Math.round(sliderValue * streamDuration),
                        )}
                    </Text>
                </View>
            );
        }
        return <></>;
    }, [draggingSlider, sliderValue, streamDuration, styles.textStyle]);

    const onSlidingComplete = React.useCallback(
        (value) => {
            setDraggingSlider(false);
            handleSlidingComplete(value as number);
        },
        [handleSlidingComplete],
    );

    const onSliderValueChanged = React.useCallback(
        (value: number | number[]) => {
            if (Array.isArray(value)) {
                setSliderValue(value[0]);
            } else {
                setSliderValue(value);
            }
        },
        [],
    );

    const onSlidingStart = React.useCallback(() => {
        setDraggingSlider(true);
    }, []);

    const getControls = () => {
        return (
            <View style={styles.controlContainer}>
                <CastPlayerButtonControls
                    skip={skip}
                    playState={playState}
                    handlePlayPause={handlePlayPause}
                />
                <View style={styles.timeRemainingContainer}>
                    <Slider
                        disabled={!client}
                        animateTransitions
                        minimumTrackTintColor={colors.primary}
                        thumbTintColor={colors.primary}
                        renderAboveThumbComponent={thumbComponent}
                        onSlidingStart={onSlidingStart}
                        onSlidingComplete={onSlidingComplete}
                        onValueChange={onSliderValueChanged}
                        value={sliderValue}
                    />
                </View>

                <View style={styles.timeStampContainer}>
                    <Text style={styles.textStyle}>
                        {formatSecondsToMinutesSeconds(
                            Math.round(currentSeconds),
                        )}
                    </Text>
                    <Text style={styles.textStyle}>
                        {formatSecondsToMinutesSeconds(
                            Math.round(streamDuration),
                        )}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.backgroundStyle}>
            <Appbar.Header statusBarHeight={1} style={styles.appBar}>
                <Appbar.Content color={'white'} title="Casting" />
                <IconButton
                    color={colors.subsPleaseLight1}
                    onPress={openFileSelector}
                    icon={'folder-open'}
                />
                <CastButton style={styles.castBar} />
            </Appbar.Header>
            {getBackground()}
        </View>
    );
};
