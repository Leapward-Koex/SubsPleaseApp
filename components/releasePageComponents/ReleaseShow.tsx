import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import {
    Image,
    StyleSheet,
    View,
    Modal,
    ScrollView,
    useWindowDimensions,
    Appearance,
    Animated,
} from 'react-native';
import { Button, Card, Title, useTheme, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    getDayOfWeek,
    humanFileSize,
    isCastingAvailable,
} from '../../HelperFunctions';
import { ShowInfo, WatchList } from '../../models/models';
import { SubsPleaseApi } from '../../SubsPleaseApi';
import nodejs from 'nodejs-mobile-react-native';
import * as Progress from 'react-native-progress';
import {
    DownloadingStatus,
    DownloadTorrentButton,
} from './DownloadTorrentButton';
import { downloadedShows } from '../../services/DownloadedShows';
import { PlayButton } from './PlayButton';
import { CastPlayButton } from './CastPlayButton';
import { ShowInformationModal } from './ShowInformationModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type releaseShowProps = {
    showInfo: ShowInfo;
    watchList: WatchList;
    onWatchListChanged: (updatedWatchList: WatchList) => void;
    index: number;
};

export interface ReleaseShowInforParams {
    showInfo: ShowInfo;
}

export const ReleaseShow = ({
    showInfo,
    watchList,
    onWatchListChanged,
    index,
}: releaseShowProps) => {
    const { colors } = useTheme();
    const [downloadingStatus, setDownloadingStatus] = React.useState(
        DownloadingStatus.NotDownloading,
    );
    const [fileSize, setFileSize] = React.useState(0);
    const [downloadProgress, setDownloadProgress] = React.useState(0);
    const [downloadSpeed, setDownloadSpeed] = React.useState(0);
    const [uploadSpeed, setUploadSpeed] = React.useState(0);
    const [torrentPaused, setTorrentPaused] = React.useState(false);
    const [castingAvailable, setCastingAvailable] = React.useState(false);
    const [showDownloaded, setShowDownloaded] = React.useState(''); // Contains the magnet (key) of the downloaded show.
    const [callbackId] = React.useState(
        showInfo.show + showInfo.release_date + showInfo.episode,
    );
    const [animatingEntry, setAnimatingEntry] = React.useState(true);
    const { height, width } = useWindowDimensions();
    const navigation = useNavigation<StackNavigationProp<any>>();

    React.useEffect(() => {
        (async () => {
            setCastingAvailable(await isCastingAvailable());
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            // See what episodes are already downloaded.
            const show720p = showInfo.downloads.find(
                (download) => download.res === '720',
            );
            const show1080p = showInfo.downloads.find(
                (download) => download.res === '1080',
            );

            const showDownloaded720 = await downloadedShows.isShowDownloaded(
                showInfo.show,
                show720p?.magnet || '',
            );
            const showDownloaded1080 = await downloadedShows.isShowDownloaded(
                showInfo.show,
                show1080p?.magnet || '',
            );
            if (showDownloaded720) {
                setShowDownloaded(show720p!.magnet);
            } else if (showDownloaded1080) {
                setShowDownloaded(show1080p!.magnet);
            }
        })();
    }, [showInfo.downloads, showInfo.show]);

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

    const textColour =
        Appearance.getColorScheme() !== 'light'
            ? colors.darkText
            : colors.lightText;

    const addShowToList = () => {
        watchList.shows.push({
            showName: showInfo.show,
            showImage: showInfo.image_url,
            releaseTime: getDayOfWeek(showInfo.release_date),
        });
        onWatchListChanged(watchList);
    };

    const removeShowFromList = () => {
        watchList.shows = watchList.shows.filter(
            (show) => show.showName !== showInfo.show,
        );
        onWatchListChanged(watchList);
    };

    const setTorrentState = (state: 'resume' | 'pause') => {
        setTorrentPaused(state !== 'resume');
        nodejs.channel.send({
            name: state,
            callbackId,
        });
    };

    const getWatchlistActionButton = () => {
        if (
            watchList.shows.filter((show) => show.showName === showInfo.show)
                .length > 0
        ) {
            return (
                <Button
                    mode="contained"
                    color={colors.tertiary}
                    onPress={() => removeShowFromList()}
                >
                    <Icon
                        name="minus"
                        size={13}
                        color={colors.subsPleaseDark1}
                    />
                    {width > 500 ? (
                        <Text style={{ color: colors.subsPleaseDark1 }}>
                            Remove
                        </Text>
                    ) : (
                        <></>
                    )}
                </Button>
            );
        }
        return (
            <Button mode="contained" onPress={addShowToList}>
                <Icon name="plus" size={13} color={colors.subsPleaseLight1} />
                {width > 500 ? (
                    <Text style={{ color: colors.subsPleaseLight1 }}>Add</Text>
                ) : (
                    <></>
                )}
            </Button>
        );
    };

    const getPlayButton = () => {
        if (!showDownloaded) {
            return <></>;
        }
        if (castingAvailable) {
            return (
                <CastPlayButton
                    showName={showInfo.show}
                    showImageUrl={
                        new URL(showInfo.image_url, SubsPleaseApi.apiBaseUrl)
                            .href
                    }
                    episodeNumber={showInfo.episode}
                    releaseDate={showInfo.release_date}
                    fileMagnet={showDownloaded}
                />
            );
        }
        return (
            <PlayButton showName={showInfo.show} fileMagnet={showDownloaded} />
        );
    };

    const getActionInfoSection = () => {
        if (
            showDownloaded &&
            downloadingStatus === DownloadingStatus.NotDownloading
        ) {
            return getPlayButton();
        }
        if (downloadingStatus === DownloadingStatus.NotDownloading) {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <DownloadTorrentButton
                        resolution={'720'}
                        availableDownloads={showInfo.downloads}
                        showName={showInfo.show}
                        episodeNumber={showInfo.episode}
                        callbackId={callbackId}
                        onDownloadStatusChange={setDownloadingStatus}
                        onDownloadSpeed={setDownloadSpeed}
                        onDownloadProgress={setDownloadProgress}
                        onUploadSpeed={setUploadSpeed}
                        onShowDownloaded={() =>
                            setShowDownloaded(
                                showInfo.downloads.find(
                                    (download) => download.res === '720',
                                )?.magnet || '',
                            )
                        }
                    />
                    <DownloadTorrentButton
                        resolution={'1080'}
                        availableDownloads={showInfo.downloads}
                        showName={showInfo.show}
                        episodeNumber={showInfo.episode}
                        callbackId={callbackId}
                        onDownloadStatusChange={setDownloadingStatus}
                        onDownloadSpeed={setDownloadSpeed}
                        onDownloadProgress={setDownloadProgress}
                        onUploadSpeed={setUploadSpeed}
                        onShowDownloaded={() =>
                            setShowDownloaded(
                                showInfo.downloads.find(
                                    (download) => download.res === '720',
                                )?.magnet || '',
                            )
                        }
                    />
                </View>
            );
        }

        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon
                            name="arrow-up"
                            style={{ marginRight: 5, marginTop: 2 }}
                            size={13}
                            color={
                                Appearance.getColorScheme() === 'light'
                                    ? colors.subsPleaseDark3
                                    : colors.subsPleaseLight3
                            }
                        />
                        <Text
                            style={{
                                color:
                                    Appearance.getColorScheme() === 'light'
                                        ? colors.subsPleaseDark3
                                        : colors.subsPleaseLight3,
                            }}
                        >
                            {humanFileSize(uploadSpeed)}/S
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon
                            name="arrow-down"
                            style={{ marginRight: 5, marginTop: 2 }}
                            size={13}
                            color={
                                Appearance.getColorScheme() === 'light'
                                    ? colors.subsPleaseDark3
                                    : colors.subsPleaseLight3
                            }
                        />
                        <Text
                            style={{
                                color:
                                    Appearance.getColorScheme() === 'light'
                                        ? colors.subsPleaseDark3
                                        : colors.subsPleaseLight3,
                            }}
                        >
                            {humanFileSize(downloadSpeed)}/S
                        </Text>
                    </View>
                </View>

                {getPlayButton()}
            </View>
        );
    };

    const getProgressOverlay = () => {
        if (
            showDownloaded &&
            downloadingStatus === DownloadingStatus.NotDownloading
        ) {
            return (
                <Icon
                    name="check"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [{ translateX: -32 }, { translateY: -35 }],
                    }}
                    size={70}
                    color={colors.primary}
                />
            );
        } else if (
            downloadingStatus === DownloadingStatus.DownloadStarting ||
            downloadingStatus === DownloadingStatus.Downloading
        ) {
            return (
                <Progress.Pie
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [{ translateX: -35 }, { translateY: -35 }],
                    }}
                    color={'rgba(203,43,120,0.7)'}
                    progress={downloadProgress}
                    size={70}
                />
            );
        } else if (downloadingStatus === DownloadingStatus.Seeding) {
            return (
                <Icon
                    name="arrow-up"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [{ translateX: -32 }, { translateY: -35 }],
                    }}
                    size={70}
                    color={colors.primary}
                />
            );
        } else {
            return <></>;
        }
    };

    const onTitlePress = () => {
        navigation.navigate('release-info', { showInfo });
    };

    const animation = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(animation, {
            delay: index * 50 + 1,
            toValue: 1,
            speed: 8,
            useNativeDriver: true,
        }).start(() => {
            setAnimatingEntry(false);
        });
    }, [animation, index]);

    const opacityMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    const scaleMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });
    const translateMap = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
    });

    return (
        <Animated.View
            style={{
                opacity: opacityMap,
                transform: [{ translateX: translateMap }, { scale: scaleMap }],
            }}
            needsOffscreenAlphaCompositing={animatingEntry}
        >
            <Card style={styles.cardStyle}>
                <View style={{ flexDirection: 'row', height: 130 }}>
                    <View style={{ flex: 0.3 }}>
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
                            {showInfo.episode}
                        </Text>
                        <Image
                            style={styles.stretch}
                            source={{
                                uri: new URL(
                                    showInfo.image_url,
                                    SubsPleaseApi.apiBaseUrl,
                                ).href,
                            }}
                        />
                        {getProgressOverlay()}
                    </View>
                    <View style={{ flex: 0.8, padding: 5 }}>
                        <Title
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            onPress={onTitlePress}
                            style={{
                                flexGrow: 1,
                                color: textColour,
                                paddingLeft: 10,
                                paddingRight: 10,
                            }}
                        >
                            {showInfo.show}
                        </Title>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            {getActionInfoSection()}
                            {getWatchlistActionButton()}
                        </View>
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
};
