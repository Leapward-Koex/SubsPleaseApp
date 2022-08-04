import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    Pressable,
    View,
    Image,
    useWindowDimensions,
    Linking,
    ScrollView,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    IconButton,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { ShowInfo, WatchList } from '../../models/models';
import { Storage } from '../../services/Storage';
import { SubsPleaseApi } from '../../ExternalApis/SubsPleaseApi';
import { ReleaseShow, ReleaseShowInforParams } from './ReleaseShow';
import { EpisodeInformationBlock } from './ShowInformationModalComponents/EpisodeInformationBlock';
import dateFormat from 'dateformat';
import { WatchedEpisodes } from '../../services/WatchedEpisodes';
import { WatchListService } from '../../services/WatchList';
import { StorageKeys } from '../../enums/enum';
import { JikanApi, JikanShow } from '../../ExternalApis/JikanApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RedditApi, Thread } from '../../ExternalApis/RedditApi';

export const ShowInformationModal = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [showDescription, setShowDescription] = React.useState('');
    const [loadingJikan, setLoadingJikan] = React.useState(false);
    const [jikanShowInfo, setJikanShowInfo] = React.useState<JikanShow>();
    const [redditThread, setRedditThread] = React.useState<Thread>();
    const [isShowNew, setIsShowNew] = React.useState(false);
    const [showOnWatchList, setShowOnWatchList] = React.useState(false);
    const { showInfo } = route.params as ReleaseShowInforParams;
    const styles = StyleSheet.create({
        centeredView: {
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: colors.subsPleaseDark2,
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
        textStyle: {
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });

    React.useEffect(() => {
        const getShowSynopsis = async () => {
            const storedSynopsis = await Storage.getItem<string>(
                `${showInfo.page}-synopsis` as any,
            );
            if (storedSynopsis) {
                setShowDescription(storedSynopsis);
            } else {
                const text = await SubsPleaseApi.getShowSynopsis(showInfo.page);
                if (typeof text === 'string') {
                    setShowDescription(text);
                    await Storage.setItem(
                        `${showInfo.page}-synopsis` as StorageKeys,
                        text,
                    );
                }
            }
        };
        const getJikanShowInfo = async () => {
            const storedJikanShows = await Storage.getItem<{
                [key: string]: { show: JikanShow; expiry: Date };
            }>(StorageKeys.JikanShowInfo, {});
            if (
                storedJikanShows[showInfo.page] &&
                new Date(storedJikanShows[showInfo.page].expiry).getTime() >
                    Date.now()
            ) {
                setJikanShowInfo(storedJikanShows[showInfo.page].show);
            } else {
                setLoadingJikan(true);
                const matchingShows = await JikanApi.tryFindShow(showInfo.show);
                if (matchingShows.length > 0) {
                    // todo, if more than one open dialog with selector
                    setJikanShowInfo(matchingShows[0]);
                    const nextWeek = new Date();
                    // 7 day expiry
                    nextWeek.setDate(new Date().getDate() + 7);
                    storedJikanShows[showInfo.page] = {
                        show: matchingShows[0],
                        expiry: nextWeek,
                    };
                    Storage.setItem(
                        StorageKeys.JikanShowInfo,
                        storedJikanShows,
                    );
                } else {
                    console.warn(
                        'No JikanShow info found for show ' + showInfo.show,
                    );
                }
                setLoadingJikan(false);
            }
        };
        const getRedditThread = async () => {
            const thread = await RedditApi.tryFindDiscussionThread(showInfo);
            if (thread) {
                setRedditThread(thread);
            }
        };
        getShowSynopsis();
        getJikanShowInfo();
        getRedditThread();
    }, [showInfo, showInfo.page, showInfo.show]);

    React.useEffect(() => {
        (async () => {
            setIsShowNew(await WatchedEpisodes.isShowNew(showInfo));
            setShowOnWatchList(
                await WatchListService.isShowOnWatchList(showInfo),
            );
        })();
    }, [showInfo]);

    const { width } = useWindowDimensions();

    return (
        <View style={styles.centeredView}>
            <View
                style={{
                    width: '80%',
                    height: 5,
                    borderRadius: 5,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginBottom: 20,
                    backgroundColor: colors.subsPleaseDark3,
                }}
            />
            <View
                style={{
                    marginLeft: 10,
                    marginRight: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={{ fontSize: 25, color: colors.subsPleaseLight3 }}>
                    About
                </Text>
                <IconButton
                    color={colors.subsPleaseLight3}
                    onPress={() => navigation.goBack()}
                    icon={'close'}
                    size={20}
                />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    backgroundColor: colors.subsPleaseDark2,
                    marginBottom: 45,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.subsPleaseDark3,
                        margin: 10,
                        borderRadius: 10,
                        padding: 10,
                    }}
                >
                    <View style={{ paddingBottom: 15 }}>
                        <Title
                            style={{
                                color: colors.subsPleaseLight3,
                                fontSize: 25,
                            }}
                        >
                            {showInfo.show}
                        </Title>
                    </View>
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                        }}
                    >
                        <View
                            style={{
                                width:
                                    Math.max(width - 250) < 200 ? '100%' : 200,
                            }}
                        >
                            <Image
                                resizeMode="cover"
                                style={{
                                    height: undefined,
                                    aspectRatio: 11 / 16,
                                    borderRadius: 5,
                                }}
                                source={{
                                    uri: new URL(
                                        showInfo.image_url,
                                        SubsPleaseApi.apiBaseUrl,
                                    ).href,
                                }}
                            />
                        </View>
                        {showDescription ? (
                            <Text
                                style={{
                                    fontSize: 18,
                                    width:
                                        Math.max(width - 250) < 200
                                            ? '100%'
                                            : Math.max(width - 250),
                                    color: colors.subsPleaseLight3,
                                    marginLeft:
                                        Math.max(width - 250) >= 200 ? 10 : 0,
                                }}
                            >
                                {showDescription}
                            </Text>
                        ) : (
                            <ActivityIndicator
                                animating={true}
                                style={{
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    marginTop: 25,
                                    marginBottom: 25,
                                }}
                                size={'large'}
                                color={colors.primary}
                            />
                        )}
                    </View>
                </View>
                <Text
                    style={{
                        fontSize: 20,
                        color: colors.subsPleaseLight3,
                        marginLeft: 10,
                    }}
                >
                    Episode details
                </Text>
                <View
                    style={{
                        backgroundColor: colors.subsPleaseDark3,
                        margin: 10,
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                    }}
                >
                    {isShowNew && (
                        <EpisodeInformationBlock
                            iconName="new-box"
                            value={'New'}
                            onPress={() => console.log('hello')}
                        />
                    )}
                    <EpisodeInformationBlock
                        iconName="calendar"
                        value={dateFormat(
                            new Date(showInfo.release_date),
                            'd mmm',
                        )}
                        toastMessage="Episode release date"
                    />
                    {jikanShowInfo && jikanShowInfo.score && (
                        <EpisodeInformationBlock
                            iconName="star-outline"
                            toastMessage={`Average rating from ${jikanShowInfo.scored_by} users`}
                            value={jikanShowInfo.score!.toString()}
                        />
                    )}
                    {jikanShowInfo && jikanShowInfo.episodes && (
                        <EpisodeInformationBlock
                            iconName="video"
                            toastMessage="Number of episodes"
                            value={jikanShowInfo.episodes!.toString()}
                        />
                    )}

                    {/* {showInfo.downloads.map((downloadInfo, index) => {
                        return (
                            <EpisodeInformationBlock
                                iconName="magnet"
                                key={index}
                                value={`${downloadInfo.res}p`}
                                onPress={() =>
                                    Linking.openURL(downloadInfo.magnet)
                                }
                            />
                        );
                    })} */}
                    {/*
					// link to episode discussio on reddit?
				*/}
                </View>
                {showOnWatchList && (
                    <TouchableRipple
                        style={{
                            backgroundColor: colors.subsPleaseDark3,
                            margin: 10,
                            borderRadius: 10,
                            padding: 10,
                        }}
                        onPress={() => {
                            WatchedEpisodes.setShowWatched(showInfo, isShowNew);
                            setIsShowNew(!isShowNew);
                        }}
                    >
                        <View
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: colors.subsPleaseLight3,
                                }}
                            >
                                Mark as {isShowNew ? 'watched' : 'new'}
                            </Text>
                        </View>
                    </TouchableRipple>
                )}
                {loadingJikan && (
                    <ActivityIndicator
                        animating={true}
                        style={{
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginTop: 25,
                            marginBottom: 25,
                        }}
                        size={'large'}
                        color={colors.primary}
                    />
                )}

                {jikanShowInfo && (
                    <TouchableRipple
                        style={{
                            backgroundColor: colors.subsPleaseDark3,
                            margin: 10,
                            borderRadius: 10,
                            padding: 10,
                        }}
                        onPress={() => {
                            Linking.openURL(jikanShowInfo.url);
                        }}
                    >
                        <View
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: colors.subsPleaseLight3,
                                }}
                            >
                                Open MAL page.
                            </Text>
                            <Icon
                                name="open-in-new"
                                color={colors.subsPleaseLight3}
                                size={25}
                            />
                        </View>
                    </TouchableRipple>
                )}
                {redditThread && (
                    <TouchableRipple
                        style={{
                            backgroundColor: colors.subsPleaseDark3,
                            margin: 10,
                            borderRadius: 10,
                            padding: 10,
                        }}
                        onPress={() => {
                            Linking.openURL(redditThread.data.url);
                        }}
                    >
                        <View
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: colors.subsPleaseLight3,
                                }}
                            >
                                Open Reddit discussion thread.
                            </Text>
                            <Icon
                                name="open-in-new"
                                color={colors.subsPleaseLight3}
                                size={25}
                            />
                        </View>
                    </TouchableRipple>
                )}
            </ScrollView>
        </View>
    );
};
