import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { Button, TouchableRipple, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

type AddRemoveToWatchlistButtonProps = {
    onWatchlist: boolean;
    onAddToWatchlist: () => void;
    onRemoveFromWatchlist: () => void;
};

export const AddRemoveToWatchlistButton = ({
    onWatchlist,
    onAddToWatchlist,
    onRemoveFromWatchlist,
}: AddRemoveToWatchlistButtonProps) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const getText = () => {
        if (width > 500) {
            return onWatchlist ? 'Remove' : 'Add';
        }
        return ' ';
    };

    const onButtonPress = () => {
        onWatchlist ? onRemoveFromWatchlist() : onAddToWatchlist();
    };
    return (
        <Button
            mode="contained"
            color={onWatchlist ? colors.primary : colors.secondary}
            onPress={onButtonPress}
        >
            <Icon
                name={onWatchlist ? 'minus' : 'plus'}
                size={15}
                color={colors.subsPleaseLight1}
            />
            <Text style={{ color: colors.subsPleaseLight1 }}>{getText()}</Text>
        </Button>
    );
};
