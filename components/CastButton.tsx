import * as React from 'react';
import {Button} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {convert} from '../services/converter';
import {downloadedShows} from '../services/DownloadedShows';
import {CastButton, useRemoteMediaClient} from 'react-native-google-cast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View} from 'react-native';
import {localWebServerManager} from '../services/LocalWebServerManager';

export type CastButtonType = {
  showName: string;
  fileMagent: string;
};

export const CustomCastButton = ({showName, fileMagent}: CastButtonType) => {
  const [fileName, setFileName] = React.useState('');
  const client = useRemoteMediaClient();

  React.useEffect(() => {
    (async () => {
      const loadedFolderPath = await downloadedShows.getShowDownloadPath(
        showName,
      );
      const loadedFileName = await downloadedShows.getShowFileName(fileMagent);
      const absolutePath = `${loadedFolderPath}/${loadedFileName}`;
      console.log('loading filename', absolutePath);
      setFileName(absolutePath);
    })();
  }, [fileMagent, showName]);

  const castToReciever = async () => {
    console.log('Casting', fileName);
    if (!fileName) {
      return;
    }
    if (!client) {
      // Start cast dialog somehow
      return;
    }
    await localWebServerManager.registerFileToPlay(fileName);
    client
      .loadMedia({
        mediaInfo: {
          contentUrl: 'http:/192.168.1.16:48839/video',
          contentType: 'video/mp4',
          mediaTracks: [
            {
              id: 1, // assign a unique numeric ID
              type: 'text',
              subtype: 'subtitles',
              name: 'English Subtitle',
              contentId: 'http:/192.168.1.16:48839/vtt',
              language: 'en-US',
              contentType: 'text/vtt',
            } as any,
          ],
          textTrackStyle: {
            backgroundColor: '#FF000000',
            edgeColor: '#000000FF',
            edgeType: 'outline',
            windowType: 'none',
            windowColor: '#00000000',
          },
        },
      })
      .then(() => {
        client.setActiveTrackIds([1]);
      });
  };

  // This will render native Cast button.
  // When a user presses it, a Cast dialog will prompt them to select a Cast device to connect to.
  return (
    <View>
      <Button onPress={() => castToReciever()}>
        <Icon size={24} name="play" />
        Plays
      </Button>
    </View>
  );
};
