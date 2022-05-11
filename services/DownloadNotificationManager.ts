import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedShowPaths } from '../components/settingsPageComponents/SavedShowLocationSettings';
import { StorageKeys } from '../enums/enum';
import { fileExists, humanFileSize } from '../HelperFunctions';
import notifee from '@notifee/react-native';

export interface EpisodeDownloadProgress {
    episodeNumber: string;
    showName: string;
    totalSize: number;
    downloaded: number;
    notificationId: string;
    notificationSortValue: string;
}

class DownloadNotificationManger {
    private downloads: EpisodeDownloadProgress[] = [];
    private notificationIndex = 0;
    constructor() {}

    public getInprogressDownloads() {
        const totalDownloaded = this.downloads.reduce(
            (previousValue, currentValue) =>
                previousValue + currentValue.downloaded,
            0,
        );
        const totalToDownloaded = this.downloads.reduce(
            (previousValue, currentValue) =>
                previousValue + currentValue.totalSize,
            0,
        );
        return {
            totalDownloaded,
            totalToDownloaded,
            currentDownloadCount: this.downloads.length,
        };
    }

    public async addDownload(
        showName: string,
        episodeNumber: string,
        totalSize: number,
    ) {
        const channelId = await notifee.createChannel({
            id: 'Downloadnotifications',
            name: 'Episode download notifications',
        });
        const notificationSortValue = (this.notificationIndex++).toString();
        const notificationId = await notifee.displayNotification({
            id: showName + episodeNumber,
            title: `Downloading ${showName} ep: ${episodeNumber}`,
            android: {
                channelId,
                onlyAlertOnce: true,
                ongoing: true,
                smallIcon: 'subsplease_notification_icon',
                progress: {
                    max: totalSize,
                    current: 0,
                },
                sortKey: notificationSortValue,
            },
        });
        this.downloads.push({
            showName,
            episodeNumber,
            totalSize,
            downloaded: 0,
            notificationId,
            notificationSortValue,
        });
    }

    public async completeDownload(showName: string, episodeNumber: string) {
        this.downloads = this.downloads.filter(
            (download) =>
                download.showName !== showName &&
                download.episodeNumber !== episodeNumber,
        );
        // Show complete notification
        const channelId = await notifee.createChannel({
            id: 'Downloadnotifications',
            name: 'Episode download notifications',
        });
        await notifee.displayNotification({
            id: showName + episodeNumber,
            title: `Downloading ${showName} ep: ${episodeNumber}`,
            body: 'Download complete',
            android: {
                smallIcon: 'subsplease_notification_complete_icon',
                channelId,
            },
        });
    }

    public async onDataDownloaded(
        showName: string,
        episodeNumber: string,
        totalDownloaded: number,
        currentSpeed: number,
    ) {
        const downloadingEpisode = this.downloads.find(
            (download) =>
                download.showName === showName &&
                download.episodeNumber === episodeNumber,
        );
        if (!downloadingEpisode) {
            // Might not've been added yet.
            return;
        }
        downloadingEpisode.downloaded = totalDownloaded;
        // update notification here
        const channelId = await notifee.createChannel({
            id: 'Downloadnotifications',
            name: 'Episode download notifications',
        });
        await notifee.displayNotification({
            id: showName + episodeNumber,
            title: `Downloading ${showName} ep: ${episodeNumber}`,
            body: `${Math.round(
                (downloadingEpisode.downloaded / downloadingEpisode.totalSize) *
                    100,
            )}% - ${humanFileSize(
                downloadingEpisode.downloaded,
            )} / ${humanFileSize(
                downloadingEpisode.totalSize,
            )}. ${humanFileSize(currentSpeed)}/s`,
            android: {
                channelId,
                onlyAlertOnce: true,
                ongoing: true,
                smallIcon: 'subsplease_notification_icon',
                progress: {
                    max: downloadingEpisode.totalSize,
                    current: downloadingEpisode.downloaded,
                },
                sortKey: downloadingEpisode.notificationSortValue,
            },
        });
    }
}

const downloadNotificationManger = new DownloadNotificationManger();
export { downloadNotificationManger };
