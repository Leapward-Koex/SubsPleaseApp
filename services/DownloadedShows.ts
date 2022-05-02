import AsyncStorage from '@react-native-async-storage/async-storage';
import {SavedShowPaths} from '../components/settingsPageComponents/SavedShowLocationSettings';
import {StorageKeys} from '../enums/enum';
import {fileExists} from '../HelperFunctions';

class DownloadedShows {
  public async getShowDownloadPath(showName: string) {
    const savedShowPaths = JSON.parse(
      (await AsyncStorage.getItem(StorageKeys.ShowPaths)) ??
        JSON.stringify({shows: []}),
    ) as SavedShowPaths;
    const matchingShow = savedShowPaths.shows.find(
      show => show.showName === showName,
    );

    if (matchingShow) {
      return matchingShow.showPath;
    }
    return '';
  }

  private getDownloadedShowsStorage = async () => {
    return JSON.parse(
      (await AsyncStorage.getItem(StorageKeys.DownloadedShows)) || '[]',
    ) as {key: string; fileName: string}[];
  };

  public async getShowFileName(magnet: string) {
    const downloadedShowsStorage = await this.getDownloadedShowsStorage();
    return (
      downloadedShowsStorage.find(
        downloadedShow => downloadedShow.key === magnet,
      )?.fileName || ''
    );
  }

  public async isShowDownloaded(showName: string, magnet: string) {
    const downloadedShowsStorage = await this.getDownloadedShowsStorage();

    if (
      !downloadedShowsStorage.find(
        downloadedShow => downloadedShow.key === magnet,
      )
    ) {
      return false;
    }

    const showPath = await this.getShowDownloadPath(showName);
    if (!showPath) {
      console.warn('Show doesnt have entry in show paths');
      return false;
    }

    const filePath = `${showPath}/${
      downloadedShowsStorage.find(
        downloadedShow => downloadedShow.key === magnet,
      )?.fileName
    }`;
    return await fileExists(filePath);
  }

  public async addDownloadedShow(magnet: string, fileName: string) {
    // Magnet acts as key,
    console.log('Adding downloaded show', magnet, fileName);
    const downloadedShowsStorage = await this.getDownloadedShowsStorage();
    if (!downloadedShowsStorage.find(storedFile => storedFile.key === magnet)) {
      downloadedShowsStorage.push({key: magnet, fileName});
      await AsyncStorage.setItem(
        StorageKeys.DownloadedShows,
        JSON.stringify(downloadedShowsStorage),
      );
    }
  }
}
const downloadedShows = new DownloadedShows();

export {downloadedShows};
