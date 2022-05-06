import nodejs from 'nodejs-mobile-react-native';
class LocalWebServerManager {
    private callbacks: {
        [callbackId: string]: { resolve: Function; reject: Function };
    } = {};
    constructor() {
        nodejs.channel.addListener('message', async (msg) => {
            const registeredCallback = this.callbacks[msg.callbackId];
            if (registeredCallback) {
                registeredCallback.resolve();
                delete this.callbacks[msg.callbackId];
            }
        });
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }

    public startServer(port = 48839) {
        const callbackId = this.generateCallbackId();
        return new Promise<void>((resolve, reject) => {
            this.callbacks[callbackId] = { resolve, reject };
            nodejs.channel.send({
                name: 'start-server',
                callbackId,
                port,
            });
        });
    }

    public registerFileToPlay(filePath: string) {
        const callbackId = this.generateCallbackId();
        return new Promise<void>((resolve, reject) => {
            this.callbacks[callbackId] = { resolve, reject };
            nodejs.channel.send({
                name: 'register-file',
                callbackId,
                filePath,
            });
        });
    }
}
const localWebServerManager = new LocalWebServerManager();

export { localWebServerManager };
