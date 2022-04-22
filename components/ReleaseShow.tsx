import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Linking,
  ImageBackground,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Appearance} from 'react-native-appearance';
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StorageKeys} from '../enums/enum';
import {getDayOfWeek} from '../HelperFunctions';
import {ShowInfo, ShowResolution, WatchList} from '../models/models';
import {SubsPleaseApi} from '../SubsPleaseApi';
import {NativeModules} from 'react-native';
const {TorrentDownloader} = NativeModules;
import nodejs from 'nodejs-mobile-react-native';
import {DownloadDirectoryPath} from 'react-native-fs';
import * as Progress from 'react-native-progress';

type releaseShowProps = {
  showInfo: ShowInfo;
  watchList: WatchList;
  onWatchListChanged: (updatedWatchList: WatchList) => void;
};

export const ReleaseShow = ({
  showInfo,
  watchList,
  onWatchListChanged,
}: releaseShowProps) => {
  const {colors} = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [showDescription, setShowDescription] = React.useState('Loading...');
  const [fileSize, setFileSize] = React.useState(0);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [downloadSpeed, setDownloadSpeed] = React.useState(0);
  const [uploadSpeed, setUploadSpeed] = React.useState(0);
  const [downloaded, setDownloaded] = React.useState(0);
  const [callbackId] = React.useState(
    (Math.random() + 1).toString(36).substring(7),
  );

  const styles = StyleSheet.create({
    stretch: {
      borderTopLeftRadius: 3,
      borderBottomLeftRadius: 3,
      height: 130,
      resizeMode: 'cover',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
      maxHeight: '100%',
      overflow: 'scroll',
    },
    modalView: {
      maxHeight: Dimensions.get('window').height - 50,
      width: '90%',
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 5,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    modalText: {
      marginBottom: 20,
      fontSize: 20,
    },
  });

  const getMagnetButton = (resolution: ShowResolution) => {
    const desiredResoltion = showInfo.downloads.find(
      showDownload => showDownload.res === resolution,
    );
    if (desiredResoltion) {
      const openTorrent = () => {
        // check if we can download it in the app here?
        Linking.openURL(desiredResoltion.magnet);
      };
      const downloadTorrent = () => {
        nodejs.channel.addListener('message', msg => {
          if (msg.callbackId === callbackId) {
            if (msg.name === 'torrent-metadata') {
              setFileSize(msg.size);
            } else if (msg.name === 'torrent-progress') {
              setDownloadProgress(msg.progress);
              setDownloaded(msg.downloaded);
              setDownloadSpeed(msg.downloadSpeed);
              setUploadSpeed(msg.uploadSpeed);
            }
          }
        });
        nodejs.channel.send({
          name: 'download-torrent',
          callbackId,
          magnetUri: desiredResoltion.magnet,
          location: DownloadDirectoryPath,
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
    }
  };

  const cardStyle = {
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 5,
    height: 130,
    backgroundColor:
      Appearance.getColorScheme() !== 'light'
        ? colors.subsPleaseDark1
        : colors.subsPleaseLight1,
  };

  const textColour =
    Appearance.getColorScheme() !== 'light'
      ? colors.darkText
      : colors.lightText;

  const addShowToList = () => {
    watchList.shows.push({
      showName: showInfo.show,
      showImage: showInfo.image_url,
      releaseTime: getDayOfWeek(showInfo.release_date),
    });
    onWatchListChanged(watchList);
  };

  const removeShowFromList = () => {
    watchList.shows = watchList.shows.filter(
      show => show.showName !== showInfo.show,
    );
    onWatchListChanged(watchList);
  };

  const getShowSynopsis = async () => {
    const storedSynopsis = await AsyncStorage.getItem(
      `${showInfo.page}-synopsis`,
    );
    if (storedSynopsis) {
      setShowDescription(storedSynopsis);
    } else {
      const text = await SubsPleaseApi.getShowSynopsis(showInfo.page);
      if (typeof text === 'string') {
        setShowDescription(text);
        await AsyncStorage.setItem(`${showInfo.page}-synopsis`, text);
      }
    }
  };

  const getWatchlistActionButton = () => {
    if (
      watchList.shows.filter(show => show.showName === showInfo.show).length > 0
    ) {
      return (
        <Button
          mode="contained"
          color={colors.tertiary}
          onPress={() => removeShowFromList()}>
          <Icon
            name="minus"
            style={{paddingRight: 4}}
            size={13}
            color={colors.subsPleaseDark1}
          />
          {Dimensions.get('window').width > 500 ? (
            <Text style={{color: colors.subsPleaseDark1}}>Remove</Text>
          ) : (
            <></>
          )}
        </Button>
      );
    }
    return (
      <Button mode="contained" onPress={() => addShowToList()}>
        <Icon
          name="plus"
          style={{paddingRight: 4}}
          size={13}
          color={colors.subsPleaseLight1}
        />
        {Dimensions.get('window').width > 500 ? (
          <Text style={{color: colors.subsPleaseLight1}}>Add</Text>
        ) : (
          <></>
        )}
      </Button>
    );
  };

  return (
    <Card style={cardStyle}>
      <View style={{flexDirection: 'row', height: 130}}>
        <View style={{flex: 0.3}}>
          <Text
            style={{
              position: 'absolute',
              color: colors.subsPleaseLight1,
              backgroundColor: colors.primary,
              zIndex: 10,
              borderRadius: 8,
              padding: 3,
              margin: 3,
            }}>
            {showInfo.episode}
          </Text>
          <Image
            style={styles.stretch}
            source={{
              uri: new URL(showInfo.image_url, SubsPleaseApi.apiBaseUrl).href,
            }}
          />
          <Progress.Pie
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{translateX: -35}, {translateY: -35}],
            }}
            progress={downloadProgress}
            size={70}
          />
        </View>
        <View style={{flex: 0.8, padding: 5}}>
          <Title
            numberOfLines={2}
            ellipsizeMode="tail"
            onPress={() => {
              setModalVisible(true);
              getShowSynopsis();
            }}
            style={{
              flexGrow: 1,
              color: textColour,
              paddingLeft: 10,
              paddingRight: 10,
            }}>
            {showInfo.show}
          </Title>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              {getMagnetButton('720')}
              {getMagnetButton('1080')}
            </View>
            {getWatchlistActionButton()}
          </View>
        </View>
      </View>
      <View style={styles.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Image
                style={{
                  height: '30%',
                  width: '70%',
                  marginBottom: 15,
                }}
                resizeMode="contain"
                source={{
                  uri: new URL(showInfo.image_url, SubsPleaseApi.apiBaseUrl)
                    .href,
                }}
              />
              <ScrollView>
                <Text style={styles.modalText}>{showDescription}</Text>
              </ScrollView>
              <Button
                style={{marginTop: 15}}
                mode="contained"
                onPress={() => setModalVisible(!modalVisible)}>
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </Card>
  );
};
