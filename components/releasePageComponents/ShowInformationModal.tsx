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
} from 'react-native';
import { Button, IconButton, Title, useTheme } from 'react-native-paper';
import { ShowInfo, WatchList } from '../../models/models';
import { Storage } from '../../services/Storage';
import { SubsPleaseApi } from '../../SubsPleaseApi';
import { ReleaseShow, ReleaseShowInforParams } from './ReleaseShow';
import { EpisodeInformationBlock } from './ShowInformationModalComponents/EpisodeInformationBlock';
import dateFormat from 'dateformat';
import { WatchedEpisodes } from '../../services/WatchedEpisodes';

export const ShowInformationModal = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [showDescription, setShowDescription] = React.useState('');
    const [isShowNew, setIsShowNew] = React.useState(false);
    const { showInfo } = route.params as ReleaseShowInforParams;
    const styles = StyleSheet.create({
        centeredView: {
            paddingTop: 20,
            backgroundColor: colors.subsPleaseDark2,
            height: '100%',
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
                    await AsyncStorage.setItem(
                        `${showInfo.page}-synopsis`,
                        JSON.stringify(text),
                    );
                }
            }
        };
        getShowSynopsis();
    }, [showInfo.page]);

    React.useEffect(() => {
        (async () => {
            setIsShowNew(await WatchedEpisodes.isShowNew(showInfo));
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
                    About Series
                </Text>
                <IconButton
                    color={colors.subsPleaseLight3}
                    onPress={() => navigation.goBack()}
                    icon={'close'}
                    size={20}
                />
            </View>
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
                        style={{ color: colors.subsPleaseLight3, fontSize: 25 }}
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
                    <View style={{ width: 200 }}>
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
                    <Text
                        style={{
                            fontSize: 18,
                            width:
                                Math.max(width - 250) < 200
                                    ? '100%'
                                    : Math.max(width - 250),
                            color: colors.subsPleaseLight3,
                            marginLeft: Math.max(width - 250) >= 200 ? 10 : 0,
                        }}
                    >
                        {showDescription}
                    </Text>
                </View>
            </View>
            <Text
                style={{
                    fontSize: 25,
                    color: colors.subsPleaseLight3,
                    marginLeft: 10,
                }}
            >
                About Episode
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
                    justifyContent: 'space-between',
                }}
            >
                {isShowNew && (
                    <EpisodeInformationBlock
                        iconName="new-box"
                        onPress={() => console.log('hello')}
                    />
                )}
                <EpisodeInformationBlock
                    iconName="calendar"
                    value={dateFormat(new Date(showInfo.release_date), 'd mmm')}
                />
                {showInfo.downloads.map((downloadInfo) => {
                    return (
                        <EpisodeInformationBlock
                            iconName="magnet"
                            value={`${downloadInfo.res}p`}
                            onPress={() => Linking.openURL(downloadInfo.magnet)}
                        />
                    );
                })}
            </View>
        </View>
    );
};
