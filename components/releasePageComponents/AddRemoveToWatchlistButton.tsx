import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { Button, TouchableRipple, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ShowInfo, WatchList } from '../../models/models';
import { action } from 'mobx';
import { WatchListStore } from '../../services/WatchListStore';
import { observer } from 'mobx-react-lite';

type AddRemoveToWatchlistButtonProps = {
    showInfo: ShowInfo;
    watchListStore: WatchListStore;
};

export const AddRemoveToWatchlistButton = observer(
    ({ showInfo, watchListStore }: AddRemoveToWatchlistButtonProps) => {
        const { colors } = useTheme();
        const { width } = useWindowDimensions();
        const getText = () => {
            if (width > 500) {
                return watchListStore.isShowOnWatchList(showInfo)
                    ? '  Remove'
                    : '  Add';
            }
            return ' ';
        };

        const onButtonPress = () => {
            if (watchListStore.isShowOnWatchList(showInfo)) {
                watchListStore.removeShowFromWatchList(showInfo.show);
            } else {
                watchListStore.addShowToWatchList(showInfo);
            }
        };
        return (
            <Button
                mode="contained"
                color={
                    watchListStore.isShowOnWatchList(showInfo)
                        ? colors.primary
                        : colors.secondary
                }
                onPress={action(() => onButtonPress())}
            >
                <Icon
                    name={
                        watchListStore.isShowOnWatchList(showInfo)
                            ? 'minus'
                            : 'plus'
                    }
                    size={15}
                    color={colors.subsPleaseLight1}
                />
                <Text style={{ color: colors.subsPleaseLight1 }}>
                    {getText()}
                </Text>
            </Button>
        );
    },
);
