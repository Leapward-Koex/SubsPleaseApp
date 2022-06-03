import * as React from 'react';
import { IconButton, useTheme } from 'react-native-paper';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { MediaPlayerState } from 'react-native-google-cast';

type CastPlayerButtonControlsType = {
    handlePlayPause: () => void;
    skip: (delta: number) => void;
    playState: MediaPlayerState;
};

export const CastPlayerButtonControls = ({
    handlePlayPause,
    skip,
    playState,
}: CastPlayerButtonControlsType) => {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        controlButtonContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    });

    const buttonSizes = {
        small: width * 0.06,
        medium: width * 0.08,
        large: width * 0.1,
    };
    return (
        <View style={styles.controlButtonContainer}>
            <IconButton
                color={colors.primary}
                onPress={() => null}
                size={buttonSizes.small}
                icon={'skip-previous-outline'}
            />
            <IconButton
                color={colors.primary}
                onPress={() => skip(-10)}
                icon={'rewind-10'}
                size={buttonSizes.medium}
            />
            <IconButton
                color={colors.primary}
                onPress={handlePlayPause}
                disabled={playState === MediaPlayerState.IDLE}
                icon={playState === MediaPlayerState.PLAYING ? 'pause' : 'play'}
                size={buttonSizes.large}
            />
            <IconButton
                color={colors.primary}
                onPress={() => skip(10)}
                icon={'fast-forward-10'}
                size={buttonSizes.medium}
            />
            <IconButton
                color={colors.primary}
                onPress={() => null}
                icon={'skip-next-outline'}
                size={buttonSizes.medium}
            />
        </View>
    );
};
