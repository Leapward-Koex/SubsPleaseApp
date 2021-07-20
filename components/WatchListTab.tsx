import * as React from 'react';
import {Animated, Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, View} from 'react-native';
import {Button, Card, Text, Title, useTheme} from 'react-native-paper';
import {ReleaseShow} from './ReleaseShow';
import { Appearance } from 'react-native-appearance'
import { ShowInfo, WatchList, WatchListItem } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { SubsPleaseApi } from '../SubsPleaseApi';
import Carousel from 'react-native-snap-carousel';
import { weekday } from '../HelperFunctions'
import Icon from 'react-native-vector-icons/FontAwesome';

const {height, width} = Dimensions.get('window');
interface DayOfWeek {
    dayName: string
}
const daysOfWeek: DayOfWeek[] = [
    { dayName: 'Monday' },
    { dayName: 'Tuesday' },
    { dayName: 'Wednesday' },
    { dayName: 'Thursday' },
    { dayName: 'Friday' },
    { dayName: 'Saturday' },
    { dayName: 'Sunday' },
]

type WatshListShowProps = {
    showInfo: WatchListItem;
    onShowRemoved: (showName: string) => Promise<void>;
}
const WatchListShow = (props: WatshListShowProps) => {
    const { showInfo, onShowRemoved } = props;
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
        <Card style={{marginBottom: 5, elevation: 2}} >
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
                    <Title numberOfLines={2} ellipsizeMode='tail' style={{flexGrow: 1, color: colors.lightText, paddingLeft: 10, paddingRight: 10}}>{showInfo.showName}</Title>
                    <Button mode="contained" color={colors.tertiary} onPress={() => onShowRemoved(showInfo.showName)}>
                        <Icon name="minus" style={{paddingRight: 4}} size={13} color={colors.subsPleaseDark1} />
                        <Text style={{color: colors.subsPleaseDark1 }}>Remove</Text>
                    </Button>
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
        marginTop: 0,
        padding: 20,
        height: height - 160,
        //width: width - 40,
        borderRadius: 10,
        backgroundColor: Appearance.getColorScheme() !== 'light' ? colors.subsPleaseLight1 : colors.subsPleaseLight1,
        shadowColor: "#000",
        
        elevation: 6
    };
    React.useEffect(() => {
        const init = async () => {
            const watchList: WatchList = JSON.parse(await AsyncStorage.getItem(StorageKeys.WatchList) ?? "{shows: []}");
            setShowsForCurrentDay(watchList.shows.filter((show) => show.releaseTime === dayName));
        }
        init();
    }, [])

    const onRemoveShow = async (showName: string) => {
        const watchList: WatchList = JSON.parse(await AsyncStorage.getItem(StorageKeys.WatchList) ?? "{shows: []}");
        watchList.shows = watchList.shows.filter((show) => show.showName !== showName);
        setShowsForCurrentDay(watchList.shows.filter((show) => show.releaseTime === dayName));
        AsyncStorage.setItem(StorageKeys.WatchList, JSON.stringify(watchList));
    }

    const getNoShowText = (showCount: number) => {
        if(!showCount) {
            return (
                <>
                    <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: 18, paddingTop:'70%', paddingBottom: 10}}>Nothing on today...</Text>
                    <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: 18}}>(╯︵╰,)</Text>
                </>
            )
        }
    }

    return (
        <View style={{marginTop: 20}}>
            <Text style={{textAlignVertical: "center", textAlign: "center", fontSize: 24}}>{dayName}</Text>
            <View style={cardStyle}>
                {getNoShowText(showsForCurrentDay.length)}
                {showsForCurrentDay.map((show, index) => <WatchListShow key={index} onShowRemoved={onRemoveShow} showInfo={show} />)}
            </View>
        </View>
    );
}

export const WatchListTab = () => {
    const carouselRef = React.useRef(null);
    const currentDayName = weekday[new Date().getDay()];
    const dayOfWeekIndex = daysOfWeek.indexOf(daysOfWeek.filter((dayOfWeek) => dayOfWeek.dayName === currentDayName)[0]);
    return (
        <View style={{
        backgroundColor: 'white',
        height: '100%'}}>

            <ImageBackground style={{width: '100%', height: '100%'}} source={require('../resources/images/primary-tertiary-blur-bg.png')}>
                <Carousel
                ref={carouselRef}
                data={daysOfWeek}
                renderItem={({item, index}) => <ShowDayInfo {...item}/> }
                enableMomentum={true}
                firstItem={dayOfWeekIndex}
                layoutCardOffset={18}
                inactiveSlideOpacity={0.7}
                sliderWidth={width }
                itemWidth={width}
                itemHeight={height}
                />
            </ImageBackground>

        </View>
    );
}