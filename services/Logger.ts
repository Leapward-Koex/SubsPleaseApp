import crashlytics from '@react-native-firebase/crashlytics';

class Logger {
    error(...parts: any[]) {
        crashlytics().log(parts.join(' '));
        console.error(parts.join(' '));
    }
}

const logger = new Logger();
export { logger };
