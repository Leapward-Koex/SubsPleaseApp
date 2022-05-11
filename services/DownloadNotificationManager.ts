import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedShowPaths } from '../components/settingsPageComponents/SavedShowLocationSettings';
import { StorageKeys } from '../enums/enum';
import { fileExists } from '../HelperFunctions';

export interface EpisodeDownloadProgress {
    episodeNumber: string;
    showName: string;
    totalSize: number;
    downloaded: number;
}

class DownloadNotificationManger {
    private downloads: EpisodeDownloadProgress[] = [];
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

    public addDownload(
        showName: string,
        episodeNumber: string,
        totalSize: number,
    ) {
        this.downloads.push({
            showName,
            episodeNumber,
            totalSize,
            downloaded: 0,
        });
        // Show notification
    }

    public completeDownload(showName: string, episodeNumber: string) {
        this.downloads = this.downloads.filter(
            (download) =>
                download.showName !== showName &&
                download.episodeNumber !== episodeNumber,
        );
        // Show complete notification
    }

    public onDataDownloaded(
        showName: string,
        episodeNumber: string,
        totalDownloaded: number,
    ) {
        const downloadingEpisode = this.downloads.find(
            (download) =>
                download.showName === showName &&
                download.episodeNumber === episodeNumber,
        );
        if (!downloadingEpisode) {
            console.error(
                'Could not find downloading episode',
                showName,
                episodeNumber,
                'Downloading: ',
                JSON.stringify(this.downloads),
            );
            return;
        }
        downloadingEpisode.downloaded = totalDownloaded;
        // update notification here
    }
}

const downloadNotificationManger = new DownloadNotificationManger();
export { downloadNotificationManger };
