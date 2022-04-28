import * as React from 'react';
import {Linking} from 'react-native';
import {Button} from 'react-native-paper';
import {ShowDownloadInfo} from '../models/models';
import nodejs from 'nodejs-mobile-react-native';
import {pickDirectory} from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRealPathFromContentUri,
  requestStoragePermission,
} from '../HelperFunctions';
import {NativeModules} from 'react-native';

const {FilePathModule} = NativeModules;

type DownloadTorrentButtonProps = {
  resolution: string;
  availableDownloads: ShowDownloadInfo[];
  showName: string;
  callbackId: string;
  onDownloadStatusChange: (newStatus: DownloadingStatus) => void;
  onFileSizeObtained?: (fileSize: number) => void;
  onDownloadProgress?: (percentage: number) => void; // 0 -> 1
  onDownloaded?: (totalDownloaded: number) => void;
  onDownloadSpeed: (currentDownloadSpeed: number) => void;
  onUploadSpeed: (currentUploadSpeed: number) => void;
};

export enum DownloadingStatus {
  NotDownloading,
  DownloadStarting,
  Downloading,
  Seeding,
  Completed,
}

export const DownloadTorrentButton = ({
  resolution,
  availableDownloads,
  showName,
  callbackId,
  onDownloadStatusChange,
  onFileSizeObtained,
  onDownloadProgress,
  onDownloaded,
  onDownloadSpeed,
  onUploadSpeed,
}: DownloadTorrentButtonProps) => {
  const showDownloadPathKey = `${showName}-download-path`;

  const desiredResoltion = availableDownloads.find(
    showDownload => showDownload.res === resolution,
  );
  if (!desiredResoltion) {
    console.error(
      'Could not find specified resoultion for show',
      JSON.stringify(availableDownloads),
      'Requested resolution',
      resolution,
    );
    return <></>;
  }
  const openTorrent = () => {
    // check if we can download it in the app here?
    Linking.openURL(desiredResoltion.magnet);
  };

  const downloadTorrent = async () => {
    // get stored location else
    let path: string | null | undefined = 'a';
    if (!(await requestStoragePermission())) {
      console.warn('Required permissions were not accepted.');
    }
    path = await AsyncStorage.getItem(showDownloadPathKey);
    if (!path) {
      const fileLocation = await pickDirectory();
      if (!fileLocation) {
        console.log('No file location selected');
        return;
      } else {
        path = await getRealPathFromContentUri(fileLocation.uri);
        await AsyncStorage.setItem(showDownloadPathKey, path);
      }
    }

    onDownloadStatusChange(DownloadingStatus.DownloadStarting);

    nodejs.channel.addListener('message', async msg => {
      if (msg.callbackId === callbackId) {
        if (msg.name === 'torrent-metadata') {
          onDownloadStatusChange(DownloadingStatus.Downloading);
          onFileSizeObtained?.(msg.size);
        } else if (msg.name === 'torrent-progress') {
          onDownloadProgress?.(msg.progress);
          onDownloaded?.(msg.downloaded);
          onDownloadSpeed(msg.downloadSpeed);
          onUploadSpeed(msg.uploadSpeed);
        } else if (msg.name === 'torrent-done') {
          onDownloadStatusChange(DownloadingStatus.Seeding);
        }
      }
    });
    nodejs.channel.send({
      name: 'download-torrent',
      callbackId,
      magnetUri: desiredResoltion.magnet,
      location: path,
    });
  };

  return (
    <Button
      mode="text"
      onPress={() => openTorrent()}
      onLongPress={() => downloadTorrent()}>
      {`${resolution}p`}
    </Button>
  );
};
