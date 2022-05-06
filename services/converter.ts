import {
    FFmpegKit,
    FFmpegKitConfig,
    ReturnCode,
} from 'ffmpeg-kit-react-native';
import { deleteFileIfExists } from '../HelperFunctions';

class Converter {
    public async extractSubtitles(
        sourceFilePath: string,
        sourceFileName: string,
    ) {
        return new Promise<{ message: string; fileName: string }>(
            async (resolve) => {
                const sourcePath = sourceFilePath.replace(sourceFileName, '');
                const fileNameWithoutExtension = sourceFileName.substring(
                    0,
                    sourceFileName.length - 4,
                );
                const subtitleFilePath = `${sourcePath}/${fileNameWithoutExtension}.vtt`;
                const deleteSubFileResult = await deleteFileIfExists(
                    subtitleFilePath,
                );

                if (!deleteSubFileResult) {
                    resolve({
                        message: 'Could not delete existing file',
                        fileName: subtitleFilePath,
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
                    });
                } else if (ReturnCode.isCancel(returnCode)) {
                    console.log('Error convert!');
                    resolve({
                        message: 'Error whilst converting',
                        fileName: sourceFileName,
                    });
                } else {
                    console.log('Unknown error while converting convert!');
                    resolve({
                        message: 'Unknown error whilst converting',
                        fileName: sourceFileName,
                    });
                }
            },
        );
    }
}

const convert = new Converter();
export { convert };
