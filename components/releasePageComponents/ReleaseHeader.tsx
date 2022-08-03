import * as React from 'react';
import { View, Keyboard, useWindowDimensions, StyleSheet } from 'react-native';
import { Appbar, Button, Dialog, Portal, Searchbar } from 'react-native-paper';
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
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterPanelShown, setFilterPanelShown] = React.useState(false);

    const styles = StyleSheet.create({
        header: { display: 'flex', flexDirection: 'row' },
        searchbar: { flexGrow: 1, width: width - 150 },
        showFilterButton: { paddingTop: 5, width: 50 },
        showFilterButtonContent: { flexDirection: 'row-reverse' },
    });

    const onChangeText = (query: string) => {
        onSearchChanged(query);
        setSearchQuery(query);
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
                    visible={filterPanelShown}
                    onDismiss={toggleFilterPanel}
                >
                    <Dialog.Title>Filter</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group
                            onValueChange={(value) => {
                                onFilterPressed(value as ShowFilter);
                                toggleFilterPanel();
                            }}
                            value={filter}
                        >
                            <RadioButton.Item
                                label="No filter"
                                value={ShowFilter.None}
                            />
                            <RadioButton.Item
                                label="New"
                                value={ShowFilter.NewRelease}
                            />
                            <RadioButton.Item
                                label="Watching shows"
                                value={ShowFilter.Watching}
                            />
                            <RadioButton.Item
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
