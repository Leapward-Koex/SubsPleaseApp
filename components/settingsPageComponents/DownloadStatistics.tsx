import * as React from 'react';
import { Title, useTheme } from 'react-native-paper';
import { Appearance, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../stores/RootStore';
import { humanFileSize } from '../../HelperFunctions';
import { observer } from 'mobx-react-lite';

export const DownloadStatistics = observer(() => {
    const { colors } = useTheme();
    const { downloadStatisticsStore } = useStore();
    const styles = StyleSheet.create({
        textStyle: {
            color:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseDark3
                    : colors.subsPleaseLight1,
        },
        touchableStyle: {
            height: 60,
            backgroundColor:
                Appearance.getColorScheme() === 'light'
                    ? colors.subsPleaseLight3
                    : colors.subsPleaseDark1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            borderRadius: 0,
            marginBottom: 3,
        },
    });
    return (
        <>
            <View style={styles.touchableStyle}>
                <Title style={styles.textStyle}>Total Downloaded</Title>
                <View style={{ paddingRight: 10 }}>
                    <Text style={styles.textStyle}>
                        {humanFileSize(
                            downloadStatisticsStore.totalBytesDownloaded ?? 0,
                        )}
                    </Text>
                </View>
            </View>
            <View style={styles.touchableStyle}>
                <Title style={styles.textStyle}>Total Uploaded</Title>
                <View style={{ paddingRight: 10 }}>
                    <Text style={styles.textStyle}>
                        {humanFileSize(
                            downloadStatisticsStore.totalBytesUploaded ?? 0,
                        )}
                    </Text>
                </View>
            </View>
        </>
    );
});
