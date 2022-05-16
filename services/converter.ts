import {
    FFmpegKit,
    FFmpegKitConfig,
    ReturnCode,
} from 'ffmpeg-kit-react-native';
import nodejs from 'nodejs-mobile-react-native';
import { deleteFileIfExists, fileExists } from '../HelperFunctions';

class Converter {
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
            });
        });
    }
}

const convert = new Converter();
export { convert };
