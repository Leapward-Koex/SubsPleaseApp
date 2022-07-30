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
} from 'react-native';
import { Button, IconButton, Title, useTheme } from 'react-native-paper';
import { ShowInfo, WatchList } from '../../models/models';
import { Storage } from '../../services/Storage';
import { SubsPleaseApi } from '../../SubsPleaseApi';
import { ReleaseShow, ReleaseShowInforParams } from './ReleaseShow';

export const ShowInformationModal = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [showDescription, setShowDescription] = React.useState('');
    const { showInfo } = route.params as ReleaseShowInforParams;
    const styles = StyleSheet.create({
        centeredView: {
            paddingTop: 20,
            backgroundColor: colors.subsPleaseDark2,
            height: '100%',
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
        const getShowSynopsis = async () => {
            const storedSynopsis = await Storage.getItem<string>(
                `${showInfo.page}-synopsis` as any,
            );
            if (storedSynopsis) {
                setShowDescription(storedSynopsis);
            } else {
                const text = await SubsPleaseApi.getShowSynopsis(showInfo.page);
                if (typeof text === 'string') {
                    setShowDescription(text);
                    await AsyncStorage.setItem(
                        `${showInfo.page}-synopsis`,
                        JSON.stringify(text),
                    );
                }
            }
        };
        getShowSynopsis();
    }, [showInfo.page]);

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
            <View
                style={{
                    backgroundColor: colors.subsPleaseDark3,
                    margin: 10,
                    borderRadius: 10,
                    padding: 10,
                }}
            >
                <View style={{ paddingBottom: 15 }}>
                    <Title
                        style={{ color: colors.subsPleaseLight3, fontSize: 25 }}
                    >
                        {showInfo.show}
                    </Title>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ width: '30%' }}>
                        <Image
                            resizeMode="cover"
                            style={{
                                height: undefined,
                                aspectRatio: 11 / 16,
                                borderRadius: 5,
                            }}
                            source={{
                                uri: new URL(
                                    showInfo.image_url,
                                    SubsPleaseApi.apiBaseUrl,
                                ).href,
                            }}
                        />
                    </View>
                    <Text
                        style={{
                            width: '70%',
                            paddingLeft: 10,
                            paddingRight: 10,
                            fontSize: 18,
                            color: colors.subsPleaseLight3,
                        }}
                    >
                        {showDescription}
                    </Text>
                </View>
            </View>
        </View>
    );
};
