import * as React from 'react';
import { Image, StyleSheet, Text, View, Linking } from 'react-native';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShowInfo, ShowResolution } from './BottomNavBar';

type releaseShowProps = {
    showInfo: ShowInfo
}

export const ReleaseShow = (props: releaseShowProps) => {
    const { showInfo } = props;
    const baseApiUrl = 'https://subsplease.org/';

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
                Linking.openURL(desiredResoltion.magnet)
            }
            return (
            <Button mode="text" onPress={() => openTorrent()}>
                {`${resolution}p`}
            </Button>
            );
        }
    }

    return (
        <Card style={{marginLeft: 5, marginTop: 10, marginBottom: 10, marginRight: 5}}>
            <View style={{flexDirection: 'row', height: 130}}>
                <View style={{flex: 0.3}}>
                <Image
                    style={styles.stretch}
                    source={{
                    uri: new URL(showInfo.image_url, baseApiUrl).href,
                    }}
                />
                </View>
                <View style={{flex: 0.8, padding: 5}}>
                    <Title style={{flexGrow: 1}}>{showInfo.show}</Title>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                        <View style={{flexDirection: 'row'}}>
                            {getMagnetButton('720')}
                            {getMagnetButton('1080')}
                        </View>
                    <Button mode="contained" onPress={() => console.log('Pressed')}>
                        <Icon name="plus" size={13} color="#FFF" />
                        Add
                    </Button>
                    </View>
                </View>
            </View>
        </Card>
    )
};