import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import {
    Appearance,
    StyleSheet,
    ListRenderItemInfo,
    FlatList,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { ShowInfo, WatchList } from '../../models/models';
import { ReleaseShow } from './ReleaseShow';

type ReleaseListType = {
    showList: ShowInfo[];
    onPullToRefresh: () => void;
    refreshing: boolean;
};

export const ReleaseList = ({
    showList,
    refreshing,
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
        return <ReleaseShow index={index} showInfo={item} />;
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
ReleaseList.whyDidYouRender = true;
