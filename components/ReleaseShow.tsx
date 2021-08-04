import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { Image, StyleSheet, Text, View, Linking, ImageBackground } from 'react-native';
import { Appearance } from 'react-native-appearance';
import { Avatar, Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StorageKeys } from '../enums/enum';
import { getDayOfWeek } from '../HelperFunctions';
import { ShowInfo, ShowResolution, WatchList } from '../models/models';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { NativeModules } from 'react-native';
const { TorrentDownloader } = NativeModules

type releaseShowProps = {
    showInfo: ShowInfo,
    watchList: WatchList,
    onWatchListChanged: (updatedWatchList: WatchList) => void;
}

export const ReleaseShow = (props: releaseShowProps) => {
    const { showInfo, watchList, onWatchListChanged } = props;
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        stretch: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 130,
            resizeMode: 'cover',
        },
    });

    const getMagnetButton = (resolution: ShowResolution) => {
        const desiredResoltion = showInfo.downloads.find((showDownload) => showDownload.res === resolution);
        if (desiredResoltion) {
            const openTorrent = () => {
                // check if we can download it in the app here?
                Linking.openURL(desiredResoltion.magnet);
            }
            const downloadTorrent = () => {
                TorrentDownloader.createCalendarEvent('testName', 'testLocation');
            }
            return (
            <Button mode="text" onPress={() => openTorrent()} onLongPress={() => downloadTorrent()}>
                {`${resolution}p`}
            </Button>
            );
        }
    }

    const cardStyle = {
        marginLeft: 5,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 5,
        height: 130,
        backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseDark1 : colors.subsPleaseLight1,
    };

    const textColour = Appearance.getColorScheme() !== 'light' ? colors.darkText : colors.lightText;

    const addShowToList = () => {
        watchList.shows.push({
            showName: showInfo.show,
            showImage: showInfo.image_url,
            releaseTime: getDayOfWeek(showInfo.release_date)
        });
        onWatchListChanged(watchList);
    }

    const removeShowFromList = () => {
        watchList.shows = watchList.shows.filter((show) => show.showName !== showInfo.show);
        onWatchListChanged(watchList);
    }

    const getWatchlistActionButton = () => {
        if (watchList.shows.filter((show) => show.showName === showInfo.show).length > 0) {
            return (
            <Button mode="contained" color={colors.tertiary} onPress={() => removeShowFromList()}>
                <Icon name="minus" style={{paddingRight: 4}} size={13} color={colors.subsPleaseDark1} />
                <Text style={{color: colors.subsPleaseDark1 }}>Remove</Text>
            </Button>
            )
        }
        return (
            <Button mode="contained" onPress={() => addShowToList()}>
                <Icon name="plus" style={{paddingRight: 4}} size={13} color={colors.subsPleaseLight1} />
                <Text style={{color: colors.subsPleaseLight1 }}>Add</Text>
            </Button>
        )
    }

    return (
        <Card style={cardStyle}>
            <View style={{flexDirection: 'row', height: 130}}>
                <View style={{flex: 0.3}}>
                    <Text style={{position: 'absolute', color: colors.subsPleaseLight1, backgroundColor: colors.primary, zIndex: 10, borderRadius: 8, padding: 3, margin: 3}}>{showInfo.episode}</Text>
                    <Image
                        style={styles.stretch}
                        source={{
                        uri: new URL(showInfo.image_url, SubsPleaseApi.apiBaseUrl).href,
                        }}
                    />
                </View>
                <View style={{flex: 0.8, padding: 5}}>
                    <Title numberOfLines={2} ellipsizeMode='tail' style={{flexGrow: 1, color: textColour, paddingLeft: 10, paddingRight: 10}}>{showInfo.show}</Title>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                        <View style={{flexDirection: 'row'}}>
                            {getMagnetButton('720')}
                            {getMagnetButton('1080')}
                        </View>
                        {getWatchlistActionButton()}
                    </View>
                </View>
            </View>
        </Card>
    )
};