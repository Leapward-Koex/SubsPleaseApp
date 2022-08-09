import { observer } from 'mobx-react-lite';
import React from 'react';
import { useWindowDimensions, Appearance, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { watchListStore } from '../../services/WatchListStore';
import { WatchListShow } from './WatchListShow';

type ShowDayInfoProps = {
    dayName: string;
};
export const ShowDayInfo = observer((props: ShowDayInfoProps) => {
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
