import * as React from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    useWindowDimensions,
    View,
    Appearance,
} from 'react-native';
import { Button, Card, Text, Title, useTheme } from 'react-native-paper';
import { WatchList, WatchListItem } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../enums/enum';
import { SubsPleaseApi } from '../ExternalApis/SubsPleaseApi';
import Carousel from 'react-native-snap-carousel';
import { weekday } from '../HelperFunctions';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Storage } from '../services/Storage';
import { watchListStore } from '../services/WatchListStore';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';

interface DayOfWeek {
    dayName: string;
}
const daysOfWeek: DayOfWeek[] = [
    { dayName: 'Monday' },
    { dayName: 'Tuesday' },
    { dayName: 'Wednesday' },
    { dayName: 'Thursday' },
    { dayName: 'Friday' },
    { dayName: 'Saturday' },
    { dayName: 'Sunday' },
];

type WatshListShowProps = {
    showInfo: WatchListItem;
};
const WatchListShow = (props: WatshListShowProps) => {
    const { showInfo } = props;
    const { colors } = useTheme();
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
    });
    return (
        <Card style={{ marginBottom: 5, elevation: 2 }}>
            <View style={{ flexDirection: 'row', height: 130 }}>
                <View style={{ flex: 0.3 }}>
                    <Image
                        style={styles.stretch}
                        source={{
                            uri: new URL(
                                showInfo.showImage,
                                SubsPleaseApi.apiBaseUrl,
                            ).href,
                        }}
                    />
                </View>
                <View style={{ flex: 0.8, padding: 5 }}>
                    <Title
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                            flexGrow: 1,
                            color: colors.lightText,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}
                    >
                        {showInfo.showName}
                    </Title>
                    <Button
                        mode="contained"
                        color={colors.tertiary}
                        onPress={action(() =>
                            watchListStore.removeShowFromWatchList(
                                showInfo.showName,
                            ),
                        )}
                    >
                        <Icon
                            name="minus"
                            style={{ paddingRight: 4 }}
                            size={13}
                            color={colors.subsPleaseDark1}
                        />
                        <Text style={{ color: colors.subsPleaseDark1 }}>
                            Remove
                        </Text>
                    </Button>
                </View>
            </View>
        </Card>
    );
};

type ShowDayInfoProps = {
    dayName: string;
};
const ShowDayInfo = observer((props: ShowDayInfoProps) => {
    const { dayName } = props;
    const { colors } = useTheme();
    const { height } = useWindowDimensions();
    const cardStyle = {
        margin: 20,
        marginTop: 0,
        padding: 20,
        height: height - 160,
        //width: width - 40,
        borderRadius: 10,
        backgroundColor:
            Appearance.getColorScheme() !== 'light'
                ? colors.subsPleaseLight1
                : colors.subsPleaseLight1,
        shadowColor: '#000',

        elevation: 6,
    };

    const getNoShowText = (showCount: number) => {
        if (!showCount) {
            return (
                <>
                    <Text
                        style={{
                            textAlignVertical: 'center',
                            textAlign: 'center',
                            fontSize: 18,
                            paddingTop: '70%',
                            paddingBottom: 10,
                        }}
                    >
                        Nothing on today...
                    </Text>
                    <Text
                        style={{
                            textAlignVertical: 'center',
                            textAlign: 'center',
                            fontSize: 18,
                        }}
                    >
                        (╯︵╰,)
                    </Text>
                </>
            );
        }
    };

    return (
        <View style={{ marginTop: 20 }}>
            <Text
                style={{
                    textAlignVertical: 'center',
                    textAlign: 'center',
                    fontSize: 24,
                }}
            >
                {dayName}
            </Text>
            <View style={cardStyle}>
                {getNoShowText(watchListStore.getShowsOnday(dayName).length)}
                {watchListStore.getShowsOnday(dayName).map((show, index) => (
                    <WatchListShow key={index} showInfo={show} />
                ))}
            </View>
        </View>
    );
});

export const WatchListTab = () => {
    const carouselRef = React.useRef(null);
    const currentDayName = weekday[new Date().getDay()];
    const { height, width } = useWindowDimensions();
    const dayOfWeekIndex = daysOfWeek.indexOf(
        daysOfWeek.filter(
            (dayOfWeek) => dayOfWeek.dayName === currentDayName,
        )[0],
    );

    return (
        <View
            style={{
                backgroundColor: 'white',
                height: '100%',
            }}
        >
            <ImageBackground
                style={{ width: '100%', height: '100%' }}
                source={require('../resources/images/primary-tertiary-blur-bg.png')}
            >
                <Carousel
                    ref={carouselRef}
                    data={daysOfWeek}
                    renderItem={({ item, index }) => <ShowDayInfo {...item} />}
                    firstItem={dayOfWeekIndex}
                    loop
                    layoutCardOffset={18}
                    inactiveSlideOpacity={0.7}
                    sliderWidth={width}
                    itemWidth={width}
                    vertical={false}
                    useExperimentalSnap
                />
            </ImageBackground>
        </View>
    );
};
