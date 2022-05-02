import * as React from 'react';
import {Button} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {convert} from '../services/converter';
import {downloadedShows} from '../services/DownloadedShows';

export type MakeCastableButtonType = {
  showName: string;
  fileMagnet: string;
};

export const MakeCastableButton = ({
  showName,
  fileMagnet,
}: MakeCastableButtonType) => {
  const [converting, setConverting] = React.useState(false);

  const showToast = (result: {message: string; fileName: string}) => {
    Toast.show({
      type: 'success',
      text1: result.message,
      text2: result.fileName,
    });
  };
  return (
    <Button
      mode="text"
      loading={converting}
      onPress={async () => {
        setConverting(true);
        const result = await convert.makeVideoCastable(
          await downloadedShows.getShowDownloadPath(showName),
          await downloadedShows.getShowFileName(fileMagnet),
        );
        setConverting(false);
        showToast(result);
      }}>
      Convert
    </Button>
  );
};
