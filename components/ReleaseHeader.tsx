import * as React from 'react';
import { View, Keyboard, useWindowDimensions } from 'react-native';
import { Appbar, Button, Dialog, Portal, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleCast, { CastButton } from 'react-native-google-cast';

interface ReleaseTabHeaderProps {
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
    onSearchChanged,
    onSearchCancelled,
    onFilterChanged,
}: ReleaseTabHeaderProps) => {
    const { width } = useWindowDimensions();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterPanelShown, setFilterPanelShown] = React.useState(false);
    const [checked, setChecked] = React.useState(ShowFilter.None);

    const onChangeText = (query: string) => {
        onSearchChanged(query);
        setSearchQuery(query);
    };

    const onBackButtonPressed = async () => {
        onSearchCancelled();
        setSearchQuery('');
        Keyboard.dismiss();
        const lastFilter = (await AsyncStorage.getItem(
            'headerFilter',
        )) as ShowFilter | null;
        if (lastFilter) {
            setChecked(lastFilter);
            onFilterChanged(lastFilter);
        }
    };

    const onFilterPressed = async (filterValue: ShowFilter) => {
        setChecked(filterValue);
        onFilterChanged(filterValue);
        await AsyncStorage.setItem('headerFilter', filterValue);
    };

    const toggleFilterPanel = () => {
        setFilterPanelShown(!filterPanelShown);
    };

    React.useEffect(() => {
        (async () => {
            const lastFilter = (await AsyncStorage.getItem(
                'headerFilter',
            )) as ShowFilter | null;
            if (lastFilter) {
                setChecked(lastFilter);
                onFilterChanged(lastFilter);
            }
        })();
    }, [onFilterChanged]);

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
                    <CastButton
                        style={{
                            width: 50,
                            height: 24,
                            top: 12,
                            tintColor: 'white',
                        }}
                    />
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
                            onValueChange={(value) =>
                                onFilterPressed(value as ShowFilter)
                            }
                            value={checked}
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
