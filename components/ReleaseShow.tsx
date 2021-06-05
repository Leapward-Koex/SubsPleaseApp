import * as React from 'react';
import { Image, StyleSheet, Text, View, Linking } from 'react-native';
import { Appearance } from 'react-native-appearance';
import { Avatar, Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SubsPleaseApi } from '../SubsPleaseApi';
import { ShowInfo, ShowResolution } from './BottomNavBar';

type releaseShowProps = {
    showInfo: ShowInfo
}

export const ReleaseShow = (props: releaseShowProps) => {
    const { showInfo } = props;
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
            return (
            <Button mode="text" onPress={() => openTorrent()}>
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
        backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseDark1 : colors.subsPleaseLight1,
    };

    const textColour = Appearance.getColorScheme() !== 'light' ? colors.darkText : colors.lightText;

    return (
        <Card style={cardStyle}>
            <View style={{flexDirection: 'row', height: 130}}>
                <View style={{flex: 0.3}}>
                <Image
                    style={styles.stretch}
                    source={{
                    uri: new URL(showInfo.image_url, SubsPleaseApi.apiBaseUrl).href,
                    }}
                />
                </View>
                <View style={{flex: 0.8, padding: 5}}>
                    <Title style={{flexGrow: 1, color: textColour}}>{showInfo.show}</Title>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                        <View style={{flexDirection: 'row'}}>
                            {getMagnetButton('720')}
                            {getMagnetButton('1080')}
                        </View>
                    <Button mode="contained" onPress={() => console.log('Pressed')}>
                        <Icon name="plus" style={{paddingRight: 4}} size={13} color={textColour} />
                        <Text style={{color: textColour }}>Add</Text>
                    </Button>
                    </View>
                </View>
            </View>
        </Card>
    )
};