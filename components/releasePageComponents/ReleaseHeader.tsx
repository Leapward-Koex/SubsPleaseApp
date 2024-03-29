import * as React from 'react';
import {
    View,
    Keyboard,
    useWindowDimensions,
    StyleSheet,
    Appearance,
} from 'react-native';
import {
    Appbar,
    Button,
    Dialog,
    Portal,
    Searchbar,
    useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleCast, { CastButton } from 'react-native-google-cast';
import { Storage } from '../../services/Storage';
import { StorageKeys } from '../../enums/enum';

interface ReleaseTabHeaderProps {
    filter: ShowFilter;
    castingAvailable: boolean;
    onSearchChanged: (query: string) => void;
    onFilterChanged: (filter: ShowFilter) => void;
}

export enum ShowFilter {
    None = '0',
    Downloaded = '1',
    Watching = '2',
    NewRelease = '3',
}

export const ReleaseTabHeader = ({
    filter,
    castingAvailable,
    onSearchChanged,
    onFilterChanged,
}: ReleaseTabHeaderProps) => {
    const { width } = useWindowDimensions();
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterPanelShown, setFilterPanelShown] = React.useState(false);

    const styles = StyleSheet.create({
        header: { display: 'flex', flexDirection: 'row' },
        searchbar: { flexGrow: 1, width: width - 150 },
        showFilterButton: { paddingTop: 5, width: 50 },
        showFilterButtonContent: { flexDirection: 'row-reverse' },
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
        },
    });

    const onChangeText = async (query: string) => {
        onSearchChanged(query);
        setSearchQuery(query);
        if (query && filter !== ShowFilter.None) {
            onFilterChanged(ShowFilter.None);
        } else if (!query) {
            const lastFilter = await Storage.getItem(
                StorageKeys.HeaderFilter,
                ShowFilter.None,
            );
            onFilterChanged(lastFilter);
        }
    };

    const onFilterPressed = async (filterValue: ShowFilter) => {
        console.log('setting last checked');
        onFilterChanged(filterValue);
        await Storage.setItem(StorageKeys.HeaderFilter, filterValue);
    };

    const toggleFilterPanel = () => {
        setFilterPanelShown(!filterPanelShown);
    };

    const getCastButton = () => {
        if (castingAvailable) {
            return (
                <CastButton
                    style={{
                        width: 50,
                        height: 24,
                        top: 12,
                        tintColor: 'white',
                    }}
                />
            );
        }
        return <></>;
    };

    const radioButtonStyle =
        Appearance.getColorScheme() !== 'light'
            ? colors.darkText
            : colors.lightText;
    return (
        <>
            <Appbar.Header statusBarHeight={1}>
                <View style={styles.header}>
                    <Searchbar
                        placeholder="Search"
                        onChangeText={onChangeText}
                        value={searchQuery}
                        style={styles.searchbar}
                    />
                    <Button
                        mode="text"
                        compact
                        contentStyle={styles.showFilterButtonContent}
                        style={styles.showFilterButton}
                        onPress={toggleFilterPanel}
                    >
                        <Icon name="filter-variant" size={24} color="#fff" />
                    </Button>
                    {getCastButton()}
                </View>
            </Appbar.Header>
            <Portal>
                <Dialog
                    style={styles.backgroundStyle}
                    visible={filterPanelShown}
                    onDismiss={toggleFilterPanel}
                >
                    <Dialog.Title style={styles.font}>Filter</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group
                            onValueChange={(value) => {
                                onFilterPressed(value as ShowFilter);
                                toggleFilterPanel();
                            }}
                            value={filter}
                        >
                            <RadioButton.Item
                                uncheckedColor={radioButtonStyle}
                                labelStyle={styles.font}
                                label="No filter"
                                value={ShowFilter.None}
                            />
                            <RadioButton.Item
                                uncheckedColor={radioButtonStyle}
                                labelStyle={styles.font}
                                label="New"
                                value={ShowFilter.NewRelease}
                            />
                            <RadioButton.Item
                                uncheckedColor={radioButtonStyle}
                                labelStyle={styles.font}
                                label="Watching shows"
                                value={ShowFilter.Watching}
                            />
                            <RadioButton.Item
                                uncheckedColor={radioButtonStyle}
                                labelStyle={styles.font}
                                label="Downloaded shows"
                                value={ShowFilter.Downloaded}
                            />
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={toggleFilterPanel}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
};
