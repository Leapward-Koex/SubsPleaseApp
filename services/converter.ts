import {
    FFmpegKit,
    FFmpegKitConfig,
    ReturnCode,
} from 'ffmpeg-kit-react-native';
import nodejs from 'nodejs-mobile-react-native';
import {
    deleteFileIfExists,
    fileExists,
    getExtensionlessFilepath,
    getFileNameFromFilePath,
} from '../HelperFunctions';
import { TemporaryDirectoryPath } from 'react-native-fs';

class Converter {
    private imageCache: { [filePath: string]: string } = {};
    public async extractSubtitles(
        sourceFilePath: string,
        sourceFileName: string,
    ) {
        return new Promise<{
            message: string;
            fileName: string;
            subtitleFile: string;
        }>(async (resolve) => {
            const sourcePath = sourceFilePath.replace(sourceFileName, '');
            const fileNameWithoutExtension = sourceFileName.substring(
                0,
                sourceFileName.length - 4,
            );
            const subtitleFilePath = `${sourcePath}/${fileNameWithoutExtension}.vtt`;
            const subtitleFileExists = await fileExists(subtitleFilePath);

            if (subtitleFileExists) {
                console.log('Not extracting subtitles as they already exist');
                resolve({
                    message: 'Subtitle file already exists',
                    fileName: subtitleFilePath,
                    subtitleFile: subtitleFilePath,
                });
                return;
            }

            console.log(sourcePath, sourceFileName);
            const convertArguments = `-i "${sourcePath}/${sourceFileName}" -map 0:s:0 "${subtitleFilePath}"`;
            console.log('Convert arguments', convertArguments);
            const session = await FFmpegKit.execute(convertArguments);
            console.log('Session started!', session.getState());
            const returnCode = await session.getReturnCode();
            if (ReturnCode.isSuccess(returnCode)) {
                console.log('Success convert!');
                resolve({
                    message: 'Success converting',
                    fileName: sourceFileName,
                    subtitleFile: subtitleFilePath,
                });
            } else if (ReturnCode.isCancel(returnCode)) {
                console.log('Error convert!');
                resolve({
                    message: 'Error whilst converting',
                    fileName: sourceFileName,
                    subtitleFile: '',
                });
            } else {
                console.log('Unknown error while converting convert!');
                resolve({
                    message: 'Unknown error whilst converting',
                    fileName: sourceFileName,
                    subtitleFile: '',
                });
            }
        });
    }

    private async readB64FromFile(filePath: string) {
        return new Promise<string>((resolve) => {
            const callbackId = filePath + 'thumbnail';
            nodejs.channel.addListener('message', async (msg) => {
                if (msg.callbackId === callbackId) {
                    this.imageCache[filePath] = msg.b64String;
                    resolve(msg.b64String);
                }
            });
            nodejs.channel.send({
                name: 'base64-image',
                callbackId,
                outputFilePath: filePath,
            });
        });
    }

    public async getB64VideoThumbnail(videoPath: string) {
        const fileName = getFileNameFromFilePath(videoPath);
        const outputFileName = `${getExtensionlessFilepath(fileName)}.jpg`;
        const outputFilePath = `${TemporaryDirectoryPath}/${outputFileName}`;
        const convertArguments = `-ss 30 -i "${videoPath}" -qscale:v 4 -frames:v 1 "${outputFilePath}"`;

        if (this.imageCache[outputFilePath]) {
            console.log('Found image in cache for', videoPath);
            return this.imageCache[outputFilePath];
        } else if (await fileExists(outputFilePath)) {
            console.log('Reading image from file', outputFilePath);
            return this.readB64FromFile(outputFilePath);
        } else {
            console.log(
                'Going to extract thumbnail with arguments:',
                convertArguments,
            );
            const session = await FFmpegKit.execute(convertArguments);
            const returnCode = await session.getReturnCode();
            if (ReturnCode.isSuccess(returnCode)) {
                console.log('Success getting thumbnail');
                return this.readB64FromFile(outputFilePath);
            } else if (ReturnCode.isCancel(returnCode)) {
                console.log('Error getting thumbnail');
            } else {
                console.log('Unknown error getting thumbnail');
            }
        }
        return '';
    }

    public async tidySubtitles(filePath: string) {
        const callbackId = `${filePath}-tidyVtt`;
        return new Promise<void>((resolve) => {
            nodejs.channel.addListener('message', async (msg) => {
                if (msg.callbackId === callbackId) {
                    resolve();
                }
            });
            nodejs.channel.send({
                name: 'tidy-vtt',
                callbackId,
                filePath,
            });
        });
    }
}

const convert = new Converter();
export { convert };
