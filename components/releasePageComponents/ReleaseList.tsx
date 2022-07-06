import * as React from 'react';
import {
    Appearance,
    StyleSheet,
    ListRenderItemInfo,
    FlatList,
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
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        backgroundStyle: {
            backgroundColor:
                Appearance.getColorScheme() !== 'light'
                    ? colors.subsPleaseDark2
                    : colors.subsPleaseLight3,
        },
    });

    const renderItem = ({ item, index }: ListRenderItemInfo<ShowInfo>) => {
        return (
            <ReleaseShow
                index={index}
                showInfo={item}
                watchList={watchList}
                onWatchListChanged={onWatchListChanged}
            />
        );
    };

    const getItemKey = (show: ShowInfo) => `${show.page}${show.episode}`;
    return (
        <FlatList
            style={styles.backgroundStyle}
            data={showList}
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            renderItem={renderItem}
            keyExtractor={getItemKey}
        />
    );
};
