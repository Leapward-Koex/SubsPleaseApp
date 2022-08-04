import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    Pressable,
    View,
    Image,
    useWindowDimensions,
    Linking,
    ScrollView,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    IconButton,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';

export const EditSettingsModal = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [allSettings, setAllSettings] = React.useState<
        [string, string | null][]
    >([]);
    const styles = StyleSheet.create({
        centeredView: {
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: colors.subsPleaseDark2,
        },
        button: {
            borderRadius: 20,
            padding: 10,
            elevation: 2,
        },
        buttonOpen: {
            backgroundColor: '#F194FF',
        },
        buttonClose: {
            backgroundColor: '#2196F3',
        },
        textStyle: {
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });

    React.useEffect(() => {
        (async () => {
            const keys = await AsyncStorage.getAllKeys();
            const keyValues = await AsyncStorage.multiGet(keys);
            setAllSettings(keyValues);
        })();
    }, []);

    const { width } = useWindowDimensions();

    return (
        <View style={styles.centeredView}>
            <View
                style={{
                    width: '80%',
                    height: 5,
                    borderRadius: 5,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginBottom: 20,
                    backgroundColor: colors.subsPleaseDark3,
                }}
            />
            <View
                style={{
                    marginLeft: 10,
                    marginRight: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={{ fontSize: 25, color: colors.subsPleaseLight3 }}>
                    About
                </Text>
                <IconButton
                    color={colors.subsPleaseLight3}
                    onPress={() => navigation.goBack()}
                    icon={'close'}
                    size={20}
                />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    backgroundColor: colors.subsPleaseDark2,
                    marginBottom: 45,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.subsPleaseDark3,
                        margin: 10,
                        borderRadius: 10,
                        padding: 10,
                    }}
                >
                    {allSettings.map((setting) => {
                        return (
                            <View key={setting[0]}>
                                <Text>{setting[0]}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};
