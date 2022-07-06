import * as React from 'react';
import {
    Button,
    IconButton,
    Modal,
    Portal,
    TextInput,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { Appearance, KeyboardType, StyleSheet, Text, View } from 'react-native';
import { pickDirectory } from 'react-native-document-picker';
import { getRealPathFromContentUri } from '../../HelperFunctions';

type TextSettingsBoxType = {
    text: string;
    modalText: string;
    value: string | number;
    onChange: (newValue: string) => void;
    folderPicker?: boolean;
    keyboardType?: KeyboardType;
};

export const TextSettingsBox = ({
    text,
    value,
    modalText,
    onChange,
    folderPicker,
    keyboardType,
}: TextSettingsBoxType) => {
    const [visible, setVisible] = React.useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const { colors } = useTheme();
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
            paddingLeft: 20,
            borderRadius: 0,
            marginBottom: 3,
        },
        settingsContainer: {
            height: 60,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        modalStyle: {
            backgroundColor: 'white',
            padding: 20,
            margin: 30,
        },
        buttonStyle: {
            width: 100,
            marginTop: 20,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    });
    const stringValue = value?.toString() ?? '0';
    const onFolderClicked = async () => {
        const fileLocation = await pickDirectory();
        if (!fileLocation) {
            console.log('No file location selected');
            return;
        } else {
            const path = await getRealPathFromContentUri(fileLocation.uri);
            console.log(`Picked ${path}`);
            onChange(path);
        }
    };
    return (
        <>
            <TouchableRipple onPress={showModal} style={styles.touchableStyle}>
                <View style={styles.settingsContainer}>
                    <Title style={styles.textStyle}>{text}</Title>
                    <View style={{ paddingRight: 10 }}>
                        <Text style={styles.textStyle}>{value}</Text>
                    </View>
                </View>
            </TouchableRipple>
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={styles.modalStyle}
                >
                    <Title>{modalText}</Title>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <TextInput
                            style={{ flexGrow: 1 }}
                            value={stringValue}
                            keyboardType={keyboardType ?? 'default'}
                            onChangeText={onChange}
                        />
                        {folderPicker && (
                            <IconButton
                                color={colors.primary}
                                onPress={onFolderClicked}
                                icon={'folder'}
                                size={40}
                            />
                        )}
                    </View>

                    <Button
                        style={styles.buttonStyle}
                        mode="contained"
                        onPress={hideModal}
                    >
                        Close
                    </Button>
                </Modal>
            </Portal>
        </>
    );
};
