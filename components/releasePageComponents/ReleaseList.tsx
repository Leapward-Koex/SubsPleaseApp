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
import { EmptyListPlaceholder } from './EmptyListPlaceholder';

type ReleaseListType = {
    showList: ShowInfo[];
    onPullToRefresh: () => void;
    onItemLongPress: (showInfo: ShowInfo) => void;
    refreshing: boolean;
};

export const ReleaseList = ({
    showList,
    refreshing,
    onPullToRefresh,
    onItemLongPress,
}: ReleaseListType) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        backgroundStyle: {
            backgroundColor:
                Appearance.getColorScheme() !== 'light'
                    ? colors.subsPleaseDark2
                    : colors.subsPleaseLight3,
        },
        font: {
            color:
                Appearance.getColorScheme() !== 'light'
                    ? colors.darkText
                    : colors.lightText,
            fontSize: 20,
        },
    });

    const renderItem = ({ item, index }: ListRenderItemInfo<ShowInfo>) => {
        return (
            <ReleaseShow
                index={index}
                showInfo={item}
                onItemLongPress={() => onItemLongPress(item)}
            />
        );
    };

    const getItemKey = (show: ShowInfo) => `${show.page}${show.episode}`;
    return (
        <>
            {showList.length === 0 && !refreshing ? (
                <EmptyListPlaceholder />
            ) : (
                <FlatList
                    style={styles.backgroundStyle}
                    data={showList}
                    refreshing={refreshing}
                    onRefresh={onPullToRefresh}
                    renderItem={renderItem}
                    keyExtractor={getItemKey}
                />
            )}
        </>
    );
};
ReleaseList.whyDidYouRender = true;
