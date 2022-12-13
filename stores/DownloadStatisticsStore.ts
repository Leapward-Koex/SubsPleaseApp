import { StorageKeys } from '../enums/enum';
import { ShowInfo } from '../models/models';
import { Storage } from '../services/Storage';
import { makeObservable, observable, computed, action } from 'mobx';
import { RootStore } from './RootStore';

export class DownloadStatisticsStore {
    totalBytesDownloadedThisSession: number = 0;
    totalBytesUploadedThisSession: number = 0;
    totalBytesDownloaded: number | null = null;
    totalBytesUploaded: number | null = null;
    private rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeObservable(this, {
            totalBytesDownloaded: observable,
            addToTotalDownloadedBytes: action,
            addToTotalUploadedBytes: action,
        });
        Storage.getItem<number>(StorageKeys.TotalBytesDownloaded, 0).then(
            action((totalBytesDownloaded) => {
                this.totalBytesDownloaded = totalBytesDownloaded;
            }),
        );
        Storage.getItem<number>(StorageKeys.TotalBytesUploaded, 0).then(
            action((totalBytesUploaded) => {
                this.totalBytesUploaded = totalBytesUploaded;
            }),
        );
    }

    public async addToTotalDownloadedBytes(newDownloadedByteCount: number) {
        this.totalBytesDownloadedThisSession += newDownloadedByteCount;
        if (this.totalBytesDownloaded !== null) {
            this.totalBytesDownloaded += newDownloadedByteCount;
            await Storage.setItem(
                StorageKeys.TotalBytesDownloaded,
                this.totalBytesDownloaded,
            );
        }
    }

    public async addToTotalUploadedBytes(newUploadByteCount: number) {
        this.totalBytesUploadedThisSession += newUploadByteCount;
        if (this.totalBytesUploaded !== null) {
            this.totalBytesUploaded += newUploadByteCount;
            await Storage.setItem(
                StorageKeys.TotalBytesUploaded,
                this.totalBytesUploaded,
            );
        }
    }
}
