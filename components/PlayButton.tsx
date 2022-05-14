import * as React from 'react';
import { Button } from 'react-native-paper';
import { downloadedShows } from '../services/DownloadedShows';
import {
    CastState,
    MediaPlayerIdleReason,
    MediaPlayerState,
    useCastState,
    useRemoteMediaClient,
} from 'react-native-google-cast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';
import { localWebServerManager } from '../services/LocalWebServerManager';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { convert } from '../services/converter';
import Toast from 'react-native-toast-message';
import {
    deleteFileIfExists,
    getExtensionlessFilepath,
    openVideoIntent,
    tryParseInt,
} from '../HelperFunctions';
import { NetworkInfo } from 'react-native-network-info';
import GoogleCast from 'react-native-google-cast';
import { WakeLockInterface } from 'react-native-wake-lock';

export type PlayButtonType = {
    showName: string;
    showImageUrl: string;
    episodeNumber: string;
    fileMagnet: string;
    releaseDate: string;
};

export const PlayButton = ({
    showName,
    showImageUrl,
    episodeNumber,
    releaseDate,
    fileMagnet,
}: PlayButtonType) => {
    const [fileName, setFileName] = React.useState('');
    const [converting, setConverting] = React.useState(false);
    const client = useRemoteMediaClient();
    const castState = useCastState();
    const sessionManager = GoogleCast.getSessionManager();
    const [isCastingFile, setIsCastingFile] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const loadedFolderPath = await downloadedShows.getShowDownloadPath(
                showName,
            );
            const loadedFileName = await downloadedShows.getShowFileName(
                fileMagnet,
            );
            const absolutePath = `${loadedFolderPath}/${loadedFileName}`;
            console.log('loading filename', absolutePath);
            setFileName(absolutePath);

            if (sessionManager) {
                sessionManager.onSessionStarting(() => {
                    console.log('Acquiring wakelock');
                    WakeLockInterface.setWakeLock();
                    WakeLockInterface.isWakeLocked().then((wakeLocked) => {
                        console.log('Is wake locked', wakeLocked);
                    });
                });

                sessionManager.onSessionEnded(() => {
                    console.log('Releasing wakelock due to ending session');
                    WakeLockInterface.releaseWakeLock();
                    setIsCastingFile(false);
                });

                sessionManager.onSessionStartFailed(() => {
                    console.log(
                        'Releasing wakelock due to failure to start session',
                    );
                    WakeLockInterface.releaseWakeLock();
                    setIsCastingFile(false);
                });
            }
        })();
    }, [fileMagnet, sessionManager, showName]);

    const showToast = (result: { message: string; fileName: string }) => {
        Toast.show({
            type: 'error',
            text1: result.message,
            text2: result.fileName,
        });
    };

    const playFile = async () => {
        console.log('Going to try playing', fileName);
        if (!fileName) {
            console.log('No filename, cannot cast.', fileName);
            return;
        }
        if (
            !client ||
            castState === CastState.NOT_CONNECTED ||
            castState === CastState.NO_DEVICES_AVAILABLE
        ) {
            console.log('Starting video in intent');
            openVideoIntent(fileName);
            // await ReactNativeBlobUtil.android.actionViewIntent(
            //     fileName,
            //     'video/mp4',
            //     'Choose an app to play this video',
            // );
            return;
        }
        console.log('Found cast client client');
        console.log('Extracting subtitles for cast playback', fileName);
        setConverting(true);
        const result = await convert.extractSubtitles(
            await downloadedShows.getShowDownloadPath(showName),
            await downloadedShows.getShowFileName(fileMagnet),
        );
        setConverting(false);

        if (result.message !== 'Success converting') {
            showToast(result);
            return;
        }

        const localIp = await NetworkInfo.getIPV4Address();
        if (!localIp) {
            console.error('Cannot cast if local IP address is not available!');
        }
        console.log('Going to serve assets on:', localIp);
        const isWakeLocked = await WakeLockInterface.isWakeLocked();
        console.log('Is wake locked', isWakeLocked);
        if (!isWakeLocked) {
            console.log('Acquiring wakelock');
            WakeLockInterface.setWakeLock();
        }
        await localWebServerManager.registerFileToPlay(fileName);
        const parsedEpisodeNumber = tryParseInt(episodeNumber, 0);
        client
            .loadMedia({
                mediaInfo: {
                    contentUrl: `http:/${localIp}:48839/video`,
                    contentType: 'video/mp4',
                    metadata: {
                        images: [
                            {
                                url: showImageUrl,
                            },
                        ],
                        episodeNumber: parsedEpisodeNumber,
                        type: 'tvShow',
                        releaseDate,
                        seriesTitle: showName,
                        title: `${showName} - ${episodeNumber}`,
                    },
                    mediaTracks: [
                        {
                            id: 1, // assign a unique numeric ID
                            type: 'text',
                            subtype: 'subtitles',
                            name: 'English Subtitle',
                            contentId: `http:/${localIp}:48839/vtt`,
                            language: 'en-US',
                            contentType: 'text/vtt',
                        } as any,
                    ],
                    textTrackStyle: {
                        backgroundColor: '#FF000000',
                        edgeColor: '#000000FF',
                        edgeType: 'outline',
                        windowType: 'none',
                        windowColor: '#00000000',
                    },
                },
            })
            .then(() => {
                client.setActiveTrackIds([1]);
                setIsCastingFile(true);
            });
        client.onMediaPlaybackEnded(() => {
            const fileToDelete = `${getExtensionlessFilepath(fileName)}.vtt`;
            console.log('Deleting subtitle file:', fileToDelete);
            deleteFileIfExists(fileToDelete);
            WakeLockInterface.releaseWakeLock();
            setIsCastingFile(false);
        });
        client.onMediaStatusUpdated((status) => {
            if (
                status?.playerState === MediaPlayerState.IDLE &&
                (status?.idleReason === MediaPlayerIdleReason.CANCELLED ||
                    status?.idleReason === MediaPlayerIdleReason.ERROR ||
                    status?.idleReason === MediaPlayerIdleReason.FINISHED)
            ) {
                console.log('Releasing wakelock');
                WakeLockInterface.releaseWakeLock();
                setIsCastingFile(false);
            }
        });
    };

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Button loading={converting} mode="text" onPress={() => playFile()}>
                Play
            </Button>
            {isCastingFile && (
                <Button onPress={() => GoogleCast.showExpandedControls()}>
                    Show constrols
                </Button>
            )}
        </View>
    );
};
