import * as React from 'react';
import {View, Keyboard, Dimensions} from 'react-native';
import {Appbar, Button, Searchbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ReleaseTabHeaderProps {
  onSearchChanged: (query: string) => void;
  onSearchCancelled: () => void;
}
export const ReleaseTabHeader = (props: ReleaseTabHeaderProps) => {
  const {onSearchChanged, onSearchCancelled} = props;
  const [searchQuery, setSearchQuery] = React.useState('');

  const onChangeText = (query: string) => {
    onSearchChanged(query);
    setSearchQuery(query);
  };

  const onBackButtonPressed = () => {
    onSearchCancelled();
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <Appbar.Header statusBarHeight={1}>
      <View style={{display: 'flex', flexDirection: 'row'}}>
        <Button
          mode="text"
          compact
          contentStyle={{flexDirection: 'row-reverse'}}
          style={{paddingTop: 5}}
          onPress={onBackButtonPressed}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </Button>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeText}
          value={searchQuery}
          style={{flexGrow: 1, width: Dimensions.get('window').width - 50}}
        />
      </View>
    </Appbar.Header>
  );
};
