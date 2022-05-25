import * as React from 'react';
import { View, Keyboard, useWindowDimensions } from 'react-native';
import { Appbar, Button, Dialog, Portal, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleCast, { CastButton } from 'react-native-google-cast';
import { isCastingAvailable } from '../HelperFunctions';

interface ReleaseTabHeaderProps {
    filter: ShowFilter;
    onSearchChanged: (query: string) => void;
    onSearchCancelled: () => void;
    onFilterChanged: (filter: ShowFilter) => void;
}

export enum ShowFilter {
    None = '0',
    Downloaded = '1',
    Watching = '2',
}

export const ReleaseTabHeader = ({
    filter,
    onSearchChanged,
    onSearchCancelled,
    onFilterChanged,
}: ReleaseTabHeaderProps) => {
    const { width } = useWindowDimensions();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterPanelShown, setFilterPanelShown] = React.useState(false);
    const [castingAvailable, setCastingAvailable] = React.useState(false);
    const [mounted, setMounted] = React.useState(true);

    const onChangeText = (query: string) => {
        onSearchChanged(query);
        setSearchQuery(query);
    };

    const onBackButtonPressed = async () => {
        onSearchCancelled();
        setSearchQuery('');
        Keyboard.dismiss();
    };

    const onFilterPressed = async (filterValue: ShowFilter) => {
        console.log('setting last checked');
        onFilterChanged(filterValue);
        await AsyncStorage.setItem('headerFilter', filterValue);
    };

    const toggleFilterPanel = () => {
        setFilterPanelShown(!filterPanelShown);
    };

    React.useEffect(() => {
        (async () => {
            setCastingAvailable(await isCastingAvailable());
        })();
        return () => {
            setMounted(false);
        };
    }, []);

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
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button
                        mode="text"
                        compact
                        contentStyle={{ flexDirection: 'row-reverse' }}
                        style={{ paddingTop: 5 }}
                        onPress={onBackButtonPressed}
                    >
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </Button>
                    <Searchbar
                        placeholder="Search"
                        onChangeText={onChangeText}
                        value={searchQuery}
                        style={{ flexGrow: 1, width: width - 150 }}
                    />
                    <Button
                        mode="text"
                        compact
                        contentStyle={{ flexDirection: 'row-reverse' }}
                        style={{ paddingTop: 5, width: 50 }}
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
