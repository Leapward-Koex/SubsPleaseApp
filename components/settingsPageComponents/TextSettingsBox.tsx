import * as React from 'react';
import {
    Button,
    Modal,
    Portal,
    TextInput,
    Title,
    TouchableRipple,
    useTheme,
} from 'react-native-paper';
import { Appearance, StyleSheet, Text, View } from 'react-native';

type TextSettingsBoxType = {
    text: string;
    modalText: string;
    value: string | number;
    onChange: (newValue: string) => void;
};

export const TextSettingsBox = ({
    text,
    value,
    modalText,
    onChange,
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
                    <TextInput
                        value={stringValue}
                        keyboardType="numeric"
                        onChangeText={onChange}
                    />
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
