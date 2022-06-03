import * as React from 'react';
import {
    Animated,
    Appearance,
    StyleSheet,
    ListRenderItemInfo,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { ShowInfo, WatchList } from '../../models/models';
import { ReleaseShow } from '../ReleaseShow';

type ReleaseListType = {
    showList: ShowInfo[];
    watchList: WatchList;
    onWatchListChanged: (watchlist: WatchList) => void;
    onPullToRefresh: () => void;
    refreshing: boolean;
};

export const ReleaseList = ({
    showList,
    watchList,
    refreshing,
    onWatchListChanged,
    onPullToRefresh,
}: ReleaseListType) => {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();

    const onFlatlistScroll = () => {
        Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
        });
    };

    const styles = StyleSheet.create({
        backgroundStyle: {
            backgroundColor:
                Appearance.getColorScheme() !== 'light'
                    ? colors.subsPleaseDark2
                    : colors.subsPleaseLight3,
        },
    });

    const renderItem = ({ item, index }: ListRenderItemInfo<ShowInfo>) => {
        const itemHeight = 150;
        const inputRange = [
            -1,
            0,
            itemHeight * index,
            itemHeight * (index + 1.5),
        ];
        const opcaityInputRange = [
            -1,
            0,
            itemHeight * index,
            itemHeight * (index + 1),
        ];
        const translateY = scrollY.interpolate({
            inputRange,
            outputRange: [0, 0, 0, itemHeight],
        });
        const opacity = scrollY.interpolate({
            inputRange: opcaityInputRange,
            outputRange: [1, 1, 1, 0],
        });

        return (
            <Animated.View style={{ transform: [{ translateY }], opacity }}>
                <ReleaseShow
                    showInfo={item}
                    watchList={watchList}
                    onWatchListChanged={onWatchListChanged}
                />
            </Animated.View>
        );
    };

    const getItemKey = (show: ShowInfo) => `${show.page}${show.episode}`;
    return (
        <Animated.FlatList
            style={styles.backgroundStyle}
            data={showList}
            onScroll={onFlatlistScroll}
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            renderItem={renderItem}
            keyExtractor={getItemKey}
        />
    );
};
