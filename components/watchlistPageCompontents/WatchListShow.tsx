import React from 'react';
import { Appearance, Image, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Title, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubsPleaseApi } from '../../ExternalApis/SubsPleaseApi';
import { WatchListItem } from '../../models/models';
import { watchListStore } from '../../services/WatchListStore';
import { action } from 'mobx';

type WatshListShowProps = {
    showInfo: WatchListItem;
};
export const WatchListShow = (props: WatshListShowProps) => {
    const { showInfo } = props;
    const { colors } = useTheme();
    const textColour =
        Appearance.getColorScheme() !== 'light'
            ? colors.darkText
            : colors.lightText;
    const styles = StyleSheet.create({
        stretch: {
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
            height: 130,
            resizeMode: 'cover',
        },
    });
    return (
        <Card style={{ marginBottom: 5, elevation: 2 }}>
            <View style={{ flexDirection: 'row', height: 130 }}>
                <View style={{ flex: 0.3 }}>
                    <Image
                        style={styles.stretch}
                        source={{
                            uri: new URL(
                                showInfo.showImage,
                                SubsPleaseApi.apiBaseUrl,
                            ).href,
                        }}
                    />
                </View>
                <View style={{ flex: 0.8, padding: 5 }}>
                    <Title
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                            flexGrow: 1,
                            color: colors.lightText,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}
                    >
                        {showInfo.showName}
                    </Title>
                    <Button
                        mode="contained"
                        color={colors.tertiary}
                        onPress={action(() =>
                            watchListStore.removeShowFromWatchList(
                                showInfo.showName,
                            ),
                        )}
                    >
                        <Icon
                            name="minus"
                            style={{ paddingRight: 4 }}
                            size={13}
                            color={colors.subsPleaseDark1}
                        />
                        <Text style={{ color: colors.subsPleaseDark1 }}>
                            {'  '}Remove
                        </Text>
                    </Button>
                </View>
            </View>
        </Card>
    );
};
