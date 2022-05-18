import nodejs from 'nodejs-mobile-react-native';
import { getOpenPort } from '../HelperFunctions';
class LocalWebServerManager {
    private callbacks: {
        [callbackId: string]: { resolve: Function; reject: Function };
    } = {};
    openPort: number = -1;
    private serverStarted = false;
    constructor() {
        nodejs.channel.addListener('message', async (msg) => {
            const registeredCallback = this.callbacks[msg.callbackId];
            if (registeredCallback) {
                registeredCallback.resolve();
                delete this.callbacks[msg.callbackId];
            }
            if (msg.name === 'local-webserver-callback') {
                this.serverStarted = true;
            }
        });
    }

    private generateCallbackId() {
        return (Math.random() + 1).toString(36).substring(2);
    }

    public async startServer() {
        if (!this.serverStarted) {
            console.log('Getting free port to start server on.');
            const port = await getOpenPort();
            this.openPort = port;
            console.log(
                'Going to start local web server on port',
                this.openPort,
            );
            const callbackId = this.generateCallbackId();
            return await new Promise<void>((resolve, reject) => {
                this.callbacks[callbackId] = { resolve, reject };
                nodejs.channel.send({
                    name: 'start-server',
                    callbackId,
                    port: this.openPort,
                });
            });
        } else {
            console.log('Server already started, not starting a new one');
        }
    }

    public stopServer() {
        console.log('Going to stop local web server');
        nodejs.channel.send({
            name: 'stop-server',
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
