import * as React from 'react';
import {Animated, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, View} from 'react-native';
import {Card, Text, Title, useTheme} from 'react-native-paper';
import {ReleaseShow} from './ReleaseShow';
import { Appearance } from 'react-native-appearance'
import { ShowInfo, WatchList, WatchListItem } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { SubsPleaseApi } from '../SubsPleaseApi';

const {height, width} = Dimensions.get('window');

const daysOfWeek = [
    { dayName: 'Monday' },
    { dayName: 'Tuesday' },
    { dayName: 'Wednesday' },
    { dayName: 'Thursday' },
    { dayName: 'Friday' },
    { dayName: 'Saturday' },
    { dayName: 'Sunday' },
]
const WatchListShow = (showInfo: WatchListItem) => {
    const { colors } = useTheme();
    const textColour = Appearance.getColorScheme() !== 'light' ? colors.darkText : colors.lightText;
    const styles = StyleSheet.create({
        stretch: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 130,
            resizeMode: 'cover',
        },
    });
    return (
        <Card>
            <View style={{flexDirection: 'row', height: 130}}>  
                <View style={{flex: 0.3}}>
                <Image
                    style={styles.stretch}
                    source={{
                    uri: new URL(showInfo.showImage, SubsPleaseApi.apiBaseUrl).href,
                    }}
                />
                </View>
                <View style={{flex: 0.8, padding: 5}}>
                    <Title numberOfLines={2} ellipsizeMode='tail' style={{flexGrow: 1, color: textColour, paddingLeft: 10, paddingRight: 10}}>{showInfo.showName}</Title>
                </View>
            </View>
        </Card>
    );
}

type ShowDayInfoProps = {
    dayName: string;
}
const ShowDayInfo = (props: ShowDayInfoProps) => {
    const { dayName } = props;
    const { colors } = useTheme();
    const [showsForCurrentDay, setShowsForCurrentDay] = React.useState<WatchListItem[]>([])
    const cardStyle = {
        margin: 20,
        width: width - 40,
        backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseDark1 : colors.subsPleaseLight1,
    };
    React.useEffect(() => {
        const init = async () => {
            const watchList: WatchList = JSON.parse(await AsyncStorage.getItem(StorageKeys.WatchList) ?? "{shows: []}");
            setShowsForCurrentDay(watchList.shows.filter((show) => show.releaseTime === dayName));
        }
        init();
    }, [])

    return (
        <Card style={cardStyle}>
            {showsForCurrentDay.map((show, index) => <WatchListShow key={index} {...show}/>)}
        </Card>
    );
}

export const WatchListTab = () => {
    return (
            <FlatList 
                horizontal
                snapToInterval={width}
                decelerationRate={'fast'}
                disableIntervalMomentum
                data={daysOfWeek}
                renderItem={({ item }) => <ShowDayInfo {...item}/> }
                keyExtractor={(item) => item.dayName}
            />
    );
}