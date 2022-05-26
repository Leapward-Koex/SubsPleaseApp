import Toast from 'react-native-toast-message';

class StyledToast {
    public showToast(
        type: 'success' | 'error',
        title: string,
        subtitle?: string,
    ) {
        Toast.show({
            type,
            text1: title,
            text2: subtitle,
            visibilityTime: 5000,
        });
    }
}

const styledToast = new StyledToast();
export { styledToast };
