import * as React from 'react';
import {
    Image,
    View,
    Modal,
    ScrollView,
    Appearance,
    StyleSheet,
} from 'react-native';
import GoogleCast, {
    CastState,
    MediaPlayerIdleReason,
    MediaPlayerState,
    useCastState,
    useRemoteMediaClient,
} from 'react-native-google-cast';
import { NetworkInfo } from 'react-native-network-info';
import { Button, Card, Title, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { WakeLockInterface } from 'react-native-wake-lock';
import {
    deleteFileIfExists,
    getExtensionlessFilepath,
    getFileNameFromFilePath,
    tryParseInt,
} from '../../HelperFunctions';
import { convert } from '../../services/converter';
import { localWebServerManager } from '../../services/LocalWebServerManager';
import LottieView from 'lottie-react-native';
import * as playAnimation from '../../resources/animations/playing-icon.json';

type CastShowType = {
    showName: string; // Series name or file name.
    episodeNumber?: string;
    filePath: string;
    onRemove: () => void;
    isCurrentlyPlayingMedia: boolean;
};

export const CastShow = ({
    showName,
    episodeNumber,
    filePath,
    isCurrentlyPlayingMedia,
    onRemove,
}: CastShowType) => {
    const [b64Image, setB64Image] = React.useState('');
    const { colors } = useTheme();
    const client = useRemoteMediaClient();
    const castState = useCastState();
    const sessionManager = GoogleCast.getSessionManager();

    React.useEffect(() => {
        (async () => {
            const image = await convert.getB64VideoThumbnail(filePath);
            setB64Image(image);
        })();
    }, [filePath]);
    const textColour =
        Appearance.getColorScheme() !== 'light'
            ? colors.darkText
            : colors.lightText;
    const styles = StyleSheet.create({
        stretch: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 130,
            resizeMode: 'cover',
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
            fontSize: 20,
        },
        cardStyle: {
            marginLeft: 5,
            marginTop: 10,
            marginBottom: 10,
            marginRight: 5,
            height: 130,
            backgroundColor:
                Appearance.getColorScheme() !== 'light'
                    ? colors.subsPleaseDark1
                    : colors.subsPleaseLight2,
        },
    });

    const getPlayingAnimation = () => {
        if (isCurrentlyPlayingMedia) {
            return (
                <View
                    style={{
                        backgroundColor: '#111111AA',
                        width: 25,
                        height: 25,
                        bottom: 4,
                        right: 10,
                        position: 'absolute',
                        borderRadius: 5,
                    }}
                >
                    <LottieView
                        autoPlay
                        colorFilters={[{ keypath: 'bars', color: '#DDDDDD' }]}
                        source={require('../../resources/animations/playing-icon.json')}
                    />
                </View>
            );
        }
        return <></>;
    };

    const getImage = () => {
        if (b64Image) {
            return (
                <>
                    <Image
                        style={styles.stretch}
                        source={{
                            uri: b64Image,
                        }}
                    />
                    {getPlayingAnimation()}
                </>
            );
        }
        return <></>;
    };

    const getEpisodeNumber = () => {
        if (episodeNumber) {
            return (
                <Text
                    style={{
                        position: 'absolute',
                        color: colors.subsPleaseLight1,
                        backgroundColor: colors.primary,
                        zIndex: 10,
                        borderRadius: 8,
                        padding: 3,
                        margin: 3,
                    }}
                >
                    {episodeNumber}
                </Text>
            );
        }
        return <></>;
    };

    const showToast = (result: { message: string; fileName: string }) => {
        Toast.show({
            type: 'error',
            text1: result.message,
            text2: result.fileName,
        });
    };

    const playItemInQueue = async () => {
        if (
            !client ||
            castState === CastState.NOT_CONNECTED ||
            castState === CastState.NO_DEVICES_AVAILABLE
        ) {
            // Todo, open cast dialog here
            return;
        }
        console.log('Found cast client client');
        console.log('Extracting subtitles for cast playback', filePath);
        const result = await convert.extractSubtitles(
            filePath,
            getFileNameFromFilePath(filePath),
        );

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
        client
            .loadMedia({
                mediaInfo: {
                    customData: {
                        filePath,
                    },
                    contentUrl: `http:/${localIp}:${
                        localWebServerManager.openPort
                    }/video?file=${encodeURIComponent(filePath)}`,
                    contentType: 'video/mp4',
                    metadata: {
                        type: 'tvShow',
                    },
                    mediaTracks: [
                        {
                            id: 1, // assign a unique numeric ID
                            type: 'text',
                            subtype: 'subtitles',
                            name: 'English Subtitle',
                            contentId: `http:/${localIp}:${
                                localWebServerManager.openPort
                            }/vtt?file=${encodeURIComponent(filePath)}`,
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
            });
        client.onMediaPlaybackEnded(() => {
            const fileToDelete = `${getExtensionlessFilepath(filePath)}.vtt`;
            console.log('Deleting subtitle file:', fileToDelete);
            deleteFileIfExists(fileToDelete);
            WakeLockInterface.releaseWakeLock();
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
            }
        });
    };

    return (
        <Card style={styles.cardStyle}>
            <View style={{ flexDirection: 'row', height: 130 }}>
                <View style={{ flex: 0.3 }}>
                    {getEpisodeNumber()}
                    {getImage()}
                </View>
                <View style={{ flex: 0.8, padding: 5 }}>
                    <Title
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                            flexGrow: 1,
                            color: textColour,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}
                    >
                        {showName}
                    </Title>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Button mode="text" onPress={() => playItemInQueue()}>
                            Play
                        </Button>
                        <Button mode="text" onPress={() => onRemove()}>
                            Remove
                        </Button>
                    </View>
                </View>
            </View>
        </Card>
    );
};
