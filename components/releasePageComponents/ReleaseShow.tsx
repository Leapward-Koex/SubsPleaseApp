import * as React from 'react';
import {
    Image,
    StyleSheet,
    View,
    useWindowDimensions,
    Appearance,
    Animated,
} from 'react-native';
import {
    Button,
    Card,
    Title,
    useTheme,
    Text,
    TouchableRipple,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    getDayOfWeek,
    humanFileSize,
    isCastingAvailable,
} from '../../HelperFunctions';
import { ShowInfo, WatchList } from '../../models/models';
import { SubsPleaseApi } from '../../ExternalApis/SubsPleaseApi';
import nodejs from 'nodejs-mobile-react-native';
import * as Progress from 'react-native-progress';
import {
    DownloadingStatus,
    DownloadTorrentButton,
} from './DownloadTorrentButton';
import { downloadedShows } from '../../services/DownloadedShows';
import { PlayButton } from './PlayButton';
import { CastPlayButton } from './CastPlayButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AddRemoveToWatchlistButton } from './AddRemoveToWatchlistButton';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';

type releaseShowProps = {
    showInfo: ShowInfo;
    index: number;
    onItemLongPress: () => void;
};

export interface ReleaseShowInforParams {
    showInfo: ShowInfo;
}

export const ReleaseShow = observer(
    ({ showInfo, index, onItemLongPress }: releaseShowProps) => {
        const { colors } = useTheme();
        const { watchedEpisodeStore } = useStore();
        const [downloadingStatus, setDownloadingStatus] = React.useState(
            DownloadingStatus.NotDownloading,
        );
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

                const showDownloaded720 =
                    await downloadedShows.isShowDownloaded(
                        showInfo.show,
                        show720p?.magnet || '',
                    );
                const showDownloaded1080 =
                    await downloadedShows.isShowDownloaded(
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
                height: 150,
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
            cardStyle: {
                marginLeft: 5,
                marginTop: 10,
                marginBottom: 10,
                marginRight: 5,
                height: 150,
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

        const setTorrentState = (state: 'resume' | 'pause') => {
            setTorrentPaused(state !== 'resume');
            nodejs.channel.send({
                name: state,
                callbackId,
            });
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
                            new URL(
                                showInfo.image_url,
                                SubsPleaseApi.apiBaseUrl,
                            ).href
                        }
                        episodeNumber={showInfo.episode}
                        releaseDate={showInfo.release_date}
                        fileMagnet={showDownloaded}
                    />
                );
            }
            return (
                <PlayButton
                    showName={showInfo.show}
                    fileMagnet={showDownloaded}
                />
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
                            transform: [
                                { translateX: -32 },
                                { translateY: -35 },
                            ],
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
                            transform: [
                                { translateX: -35 },
                                { translateY: -35 },
                            ],
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
                            transform: [
                                { translateX: -32 },
                                { translateY: -35 },
                            ],
                        }}
                        size={70}
                        color={colors.primary}
                    />
                );
            } else {
                return <></>;
            }
        };

        const animation = React.useRef(new Animated.Value(0)).current;

        React.useEffect(() => {
            Animated.spring(animation, {
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
                    transform: [
                        { translateX: translateMap },
                        { scale: scaleMap },
                    ],
                }}
                needsOffscreenAlphaCompositing={animatingEntry}
            >
                <Card style={styles.cardStyle}>
                    <TouchableRipple
                        onPress={() =>
                            navigation.navigate('release-info', { showInfo })
                        }
                        onLongPress={onItemLongPress}
                    >
                        <View style={{ flexDirection: 'row', height: 150 }}>
                            <View style={{ flex: 0.3 }}>
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 10,
                                        padding: 3,
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    {watchedEpisodeStore.isShowNew(
                                        showInfo,
                                    ) && (
                                        <Text
                                            style={{
                                                color: colors.subsPleaseLight1,
                                                backgroundColor: colors.primary,
                                                borderRadius: 4,
                                                padding: 3,
                                                marginRight: 5,
                                            }}
                                        >
                                            NEW
                                        </Text>
                                    )}

                                    <Text
                                        style={{
                                            color: colors.subsPleaseLight1,
                                            backgroundColor: colors.secondary,
                                            borderRadius: 4,
                                            padding: 3,
                                        }}
                                    >
                                        {showInfo.episode}
                                    </Text>
                                </View>

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
                                    <AddRemoveToWatchlistButton
                                        showInfo={showInfo}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableRipple>
                </Card>
            </Animated.View>
        );
    },
);
