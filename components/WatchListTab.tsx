import LottieView from 'lottie-react-native';
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
        <>
            <View
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                }}
            >
                <LottieView
                    autoPlay
                    speed={0.3}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    resizeMode="cover"
                    source={require('../resources/animations/animated-background.json')}
                />
            </View>
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
        </>
    );
};
