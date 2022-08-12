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

    const getKaomoji = () => {
        const kaomojis = [
            '(ノ﹏ヽ)',
            '(-人-。)',
            '(╯︵╰,)',
            '(´；д；`)',
            '(´＿｀。)',
            '(づ-̩̩̩-̩̩̩_-̩̩̩-̩̩̩)づ',
            'ヽ(´□｀。)ﾉ',
            '( ; ω ; )',
        ];
        return kaomojis[Math.floor(Math.random() * kaomojis.length)];
    };

    const getNoShowText = (showCount: number) => {
        if (!showCount) {
            return (
                <View
                    style={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            paddingBottom: 10,
                            fontSize: 18,
                        }}
                    >
                        Nothing on today...
                    </Text>
                    <Text
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        {getKaomoji()}
                    </Text>
                </View>
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
                    color: colors.subsPleaseLight1,
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
