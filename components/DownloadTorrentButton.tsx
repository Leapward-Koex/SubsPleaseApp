import * as React from 'react';
import { Linking } from 'react-native';
import { Button } from 'react-native-paper';
import { ShowDownloadInfo } from '../models/models';
import nodejs from 'nodejs-mobile-react-native';
import { pickDirectory } from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getRealPathFromContentUri,
    requestStoragePermission,
} from '../HelperFunctions';
import { StorageKeys } from '../enums/enum';
import { SavedShowPaths } from './settingsPageComponents/SavedShowLocationSettings';
import { convert } from '../services/converter';
import { downloadedShows } from '../services/DownloadedShows';
import { downloadNotificationManger } from '../services/DownloadNotificationManager';

type DownloadTorrentButtonProps = {
    resolution: string;
    availableDownloads: ShowDownloadInfo[];
    showName: string;
    episodeNumber: string;
    callbackId: string;
    onDownloadStatusChange: (newStatus: DownloadingStatus) => void;
    onFileSizeObtained?: (fileSize: number) => void;
    onDownloadProgress?: (percentage: number) => void; // 0 -> 1
    onDownloaded?: (totalDownloaded: number) => void;
    onDownloadSpeed: (currentDownloadSpeed: number) => void;
    onUploadSpeed: (currentUploadSpeed: number) => void;
    onShowDownloaded: () => void;
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
    episodeNumber,
    callbackId,
    onDownloadStatusChange,
    onFileSizeObtained,
    onDownloadProgress,
    onDownloaded,
    onDownloadSpeed,
    onUploadSpeed,
    onShowDownloaded,
}: DownloadTorrentButtonProps) => {
    const desiredResoltion = availableDownloads.find(
        (showDownload) => showDownload.res === resolution,
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

    const getStoredShowPaths = async () => {
        return JSON.parse(
            (await AsyncStorage.getItem(StorageKeys.ShowPaths)) ??
                JSON.stringify({ shows: [] }),
        ) as SavedShowPaths;
    };

    const downloadTorrent = async () => {
        // get stored location else
        let path: string | null | undefined = '';
        if (!(await requestStoragePermission())) {
            console.warn('Required permissions were not accepted.');
            return;
        }

        let storedShowPaths = await getStoredShowPaths();
        console.log('Stored show paths', storedShowPaths);

        const currentShow = storedShowPaths.shows.find(
            (show) => show.showName === showName,
        );

        if (!currentShow?.showPath) {
            const fileLocation = await pickDirectory();
            if (!fileLocation) {
                console.log('No file location selected');
                return;
            } else {
                path = await getRealPathFromContentUri(fileLocation.uri);
                storedShowPaths = await getStoredShowPaths();
                storedShowPaths.shows.push({ showName, showPath: path });

                await AsyncStorage.setItem(
                    StorageKeys.ShowPaths,
                    JSON.stringify(storedShowPaths),
                );
            }
        } else {
            path = currentShow.showPath;
        }

        onDownloadStatusChange(DownloadingStatus.DownloadStarting);

        nodejs.channel.addListener('message', async (msg) => {
            if (msg.callbackId === callbackId) {
                if (msg.name === 'torrent-metadata') {
                    onDownloadStatusChange(DownloadingStatus.Downloading);
                    onFileSizeObtained?.(msg.size);
                    downloadNotificationManger.addDownload(
                        showName,
                        episodeNumber,
                        msg.size,
                    );
                } else if (msg.name === 'torrent-progress') {
                    onDownloadProgress?.(msg.progress);
                    onDownloaded?.(msg.downloaded);
                    onDownloadSpeed(msg.downloadSpeed);
                    onUploadSpeed(msg.uploadSpeed);
                    downloadNotificationManger.onDataDownloaded(
                        showName,
                        episodeNumber,
                        msg.downloaded,
                    );
                } else if (msg.name === 'torrent-done') {
                    onShowDownloaded();
                    await downloadedShows.addDownloadedShow(
                        desiredResoltion.magnet,
                        msg.sourceFileName,
                    );
                    onDownloadStatusChange(DownloadingStatus.Seeding);
                    downloadNotificationManger.completeDownload(
                        showName,
                        episodeNumber,
                    );
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
            onLongPress={() => downloadTorrent()}
        >
            {`${resolution}p`}
        </Button>
    );
};
