import * as React from 'react';
import { Button } from 'react-native-paper';
import { downloadedShows } from '../../services/DownloadedShows';
import { View } from 'react-native';
import { openVideoIntent } from '../../HelperFunctions';

export type PlayButtonType = {
    showName: string;
    fileMagnet: string;
};

export const PlayButton = ({ showName, fileMagnet }: PlayButtonType) => {
    const [fileName, setFileName] = React.useState('');

    React.useEffect(() => {
        (async () => {
            const loadedFolderPath = await downloadedShows.getShowDownloadPath(
                showName,
            );
            const loadedFileName = await downloadedShows.getShowFileName(
                fileMagnet,
            );
            const absolutePath = `${loadedFolderPath}/${loadedFileName}`;
            setFileName(absolutePath);
        })();
    }, [fileMagnet, showName]);

    const playFile = async () => {
        console.log('Going to try playing', fileName);
        if (!fileName) {
            console.log('No filename, cannot play.', fileName);
            return;
        }

        console.log('Starting video in intent');
        openVideoIntent(fileName);
        return;
    };

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Button mode="text" onPress={() => playFile()}>
                Play
            </Button>
        </View>
    );
};
