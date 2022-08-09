import * as React from 'react';
import { ImageBackground, useWindowDimensions, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { weekday } from '../HelperFunctions';
import { ShowDayInfo } from './watchlistPageCompontents/ShowDayInfo';

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

export const WatchListTab = () => {
    const carouselRef = React.useRef(null);
    const currentDayName = weekday[new Date().getDay()];
    const { width } = useWindowDimensions();
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
