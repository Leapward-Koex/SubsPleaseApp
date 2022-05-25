export type ShowResolution = '480' | '540' | '720' | '1080';

export interface ShowDownloadInfo {
    res: ShowResolution;
    magnet: string;
}

export interface ShowInfo {
    downloads: ShowDownloadInfo[];
    episode: string;
    image_url: string;
    page: string;
    release_date: string; // mm/dd/yy
    show: string;
    time: string; // 'New' or release date
    xdcc: string;
}

export interface SubsPleaseShowApiResult {
    [showEpisode: string]: ShowInfo;
}

export interface WatchListItem {
    showName: string;
    showImage: string;
    releaseTime: string;
}

export interface WatchList {
    shows: WatchListItem[];
}
