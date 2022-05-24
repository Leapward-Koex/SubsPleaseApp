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
import { EmitterSubscription, View } from 'react-native';
import { localWebServerManager } from '../services/LocalWebServerManager';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { convert } from '../services/converter';
import Toast from 'react-native-toast-message';
import {
    deleteFileIfExists,
    getExtensionlessFilepath,
    isCastingAvailable,
    openVideoIntent,
    tryParseInt,
} from '../HelperFunctions';
import { NetworkInfo } from 'react-native-network-info';
import GoogleCast from 'react-native-google-cast';
import { WakeLockInterface } from 'react-native-wake-lock';

export type CastPlayButtonType = {
    showName: string;
    showImageUrl: string;
    episodeNumber: string;
    fileMagnet: string;
    releaseDate: string;
};

export const CastPlayButton = ({
    showName,
    showImageUrl,
    episodeNumber,
    releaseDate,
    fileMagnet,
}: CastPlayButtonType) => {
    const [fileName, setFileName] = React.useState('');
    const [converting, setConverting] = React.useState(false);
    const client = useRemoteMediaClient();
    const castState = useCastState();
    const sessionManager = GoogleCast.getSessionManager();
    const [isCastingFile, setIsCastingFile] = React.useState(false);

    React.useEffect(() => {
        let sessionStartingEmitterSubscription: EmitterSubscription;
        let sessionEndingEmitterSubscription: EmitterSubscription;
        let sessionStartFailedEmitterSubscription: EmitterSubscription;

        let clientOnMediaPlaybackEmitterSubscription: EmitterSubscription;
        let clientOnMediaStatusEmitterSubscription: EmitterSubscription;
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
                sessionStartingEmitterSubscription =
                    sessionManager.onSessionStarting(() => {
                        console.log('Acquiring wakelock');
                        WakeLockInterface.setWakeLock();
                        WakeLockInterface.isWakeLocked().then((wakeLocked) => {
                            console.log('Is wake locked', wakeLocked);
                        });
                    });

                sessionEndingEmitterSubscription =
                    sessionManager.onSessionEnded(() => {
                        console.log('Releasing wakelock due to ending session');
                        WakeLockInterface.releaseWakeLock();
                        setIsCastingFile(false);
                    });

                sessionStartFailedEmitterSubscription =
                    sessionManager.onSessionStartFailed(() => {
                        console.log(
                            'Releasing wakelock due to failure to start session',
                        );
                        WakeLockInterface.releaseWakeLock();
                        setIsCastingFile(false);
                    });
            }
            if (client) {
                clientOnMediaPlaybackEmitterSubscription =
                    client.onMediaPlaybackEnded(() => {
                        const fileToDelete = `${getExtensionlessFilepath(
                            fileName,
                        )}.vtt`;
                        console.log('Deleting subtitle file:', fileToDelete);
                        deleteFileIfExists(fileToDelete);
                        WakeLockInterface.releaseWakeLock();
                        setIsCastingFile(false);
                    });
                clientOnMediaStatusEmitterSubscription =
                    client.onMediaStatusUpdated((status) => {
                        if (
                            status?.playerState === MediaPlayerState.IDLE &&
                            (status?.idleReason ===
                                MediaPlayerIdleReason.CANCELLED ||
                                status?.idleReason ===
                                    MediaPlayerIdleReason.ERROR ||
                                status?.idleReason ===
                                    MediaPlayerIdleReason.FINISHED)
                        ) {
                            setIsCastingFile(false);
                        }
                    });
            }
        })();
        return () => {
            sessionStartingEmitterSubscription?.remove();
            sessionEndingEmitterSubscription?.remove();
            sessionStartFailedEmitterSubscription?.remove();

            clientOnMediaPlaybackEmitterSubscription?.remove();
            clientOnMediaStatusEmitterSubscription?.remove();
        };
    }, [client, fileMagnet, fileName, sessionManager, showName]);

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

        if (
            result.message === 'Error whilst converting' ||
            result.message === 'Unknown error whilst converting'
        ) {
            showToast(result);
            return;
        }

        await convert.tidySubtitles(result.subtitleFile);

        await localWebServerManager.startServer();
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
        const parsedEpisodeNumber = tryParseInt(episodeNumber, 0);
        client
            .loadMedia({
                mediaInfo: {
                    customData: {
                        filePath: fileName,
                    },
                    contentUrl: `http:/${localIp}:${
                        localWebServerManager.openPort
                    }/video?file=${encodeURIComponent(fileName)}`,
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
                            contentId: `http:/${localIp}:${
                                localWebServerManager.openPort
                            }/vtt?file=${encodeURIComponent(fileName)}`,
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
