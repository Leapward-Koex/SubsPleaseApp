const rn_bridge = require('rn-bridge');
const WebTorrent = require('webtorrent');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const throttle = require('lodash.throttle');
const jsonfile = require('jsonfile');

function log(...args) {
  rn_bridge.channel.send({
    name: 'log',
    text: args.join(' '),
  });
}

console.log = log;
console.error = log;

const torrentObjects = {};
let localServer = null;
let localFilePathToPlay = null;

class TorrentClient {
  client;
  callbackId;
  torrent;
  constructor(callbackId) {
    this.client = new WebTorrent();
    this.callbackId = callbackId;
  }

  downloadTorrent(magnetUri, location) {
    console.log('Starting torrent', this.callbackId);
    this.client.add(magnetUri, {path: location}, torrent => {
      // Got torrent metadata!
      rn_bridge.channel.send({
        callbackId: this.callbackId,
        name: 'torrent-metadata',
        size: torrent.length,
      });
      this.torrent = torrent;
      console.log('Torrent client is downloading:', torrent.infoHash);
      console.log(
        'Torrent data, file path:',
        torrent.files[0].path,
        'file name:',
        torrent.files[0].name,
      );
      const throttledDownloadHandler = throttle(() => {
        console.log('Torrent update', torrent.progress);
        rn_bridge.channel.send({
          callbackId: this.callbackId,
          name: 'torrent-progress',
          downloaded: torrent.downloaded,
          downloadSpeed: torrent.downloadSpeed,
          uploadSpeed: torrent.uploadSpeed,
          progress: torrent.progress,
        });
      }, 1000);
      torrent.on('download', bytes => {
        throttledDownloadHandler();
      });
      torrent.on('done', () => {
        console.log('Torrent downloaded');
        rn_bridge.channel.send({
          name: 'torrent-done',
          callbackId: this.callbackId,
          sourceFilePath: torrent.files[0].path,
          sourceFileName: torrent.files[0].name,
        });
      });
    });
  }

  pause() {
    if (this.torrent && !this.torrent.paused) {
      console.log('Pausing', this.callbackId);
      this.torrent.pause();
    }
  }

  resume() {
    if (this.torrent && this.torrent.paused) {
      console.log('Resuming', this.callbackId);
      this.torrent.resume();
    }
  }
}

class LocalWebServer {
  constructor(port) {
    console.log('Starting local webserver on port', port);
    this.app = express();
    this.app.use(cors());
    this.app.listen(port, () => {
      console.log(`Local webserver listening on port ${port}`);
    });

    this.app.get('/video', function (req, res) {
      console.log('Handling video route', localFilePathToPlay);
      if (!localFilePathToPlay) {
        console.error('No local file to play setup!');
        return;
      }
      const stat = fs.statSync(localFilePathToPlay);
      const fileSize = stat.size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(localFilePathToPlay, {start, end});
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(localFilePathToPlay).pipe(res);
      }
    });

    this.app.get('/vtt', function (req, res) {
      console.log('Handling vtt subtitle route');
      if (!localFilePathToPlay) {
        console.err('No local file to play setup!');
        return;
      }
      const filePathWithoutExtension = localFilePathToPlay.substring(
        0,
        localFilePathToPlay.length - 4,
      );

      res.sendFile(`${filePathWithoutExtension}.vtt`);
    });
  }
}

// Echo every message received from react-native.
rn_bridge.channel.on('message', msg => {
  try {
    if (msg.name === 'download-torrent') {
      const torrentClient = new TorrentClient(msg.callbackId);
      torrentClient.downloadTorrent(msg.magnetUri, msg.location);
      torrentObjects[msg.callbackId] = torrentClient;
    } else if (msg.name === 'pause') {
      if (torrentObjects[msg.callbackId]) {
        console.log('Pasuing', msg.callbackId);
        torrentObjects[msg.callbackId].pause();
      }
    } else if (msg.name === 'resume') {
      if (torrentObjects[msg.callbackId]) {
        torrentObjects[msg.callbackId].resume();
      }
    } else if (msg.name === 'write-json') {
      console.log('Writing backup for', JSON.stringify(msg));
      jsonfile.writeFile(msg.fileName, JSON.parse(msg.payload), err => {
        rn_bridge.channel.send({
          name: 'write-json-callback',
          callbackId: msg.callbackId,
          error: err,
        });
      });
    } else if (msg.name === 'read-json') {
      console.log('Reading backup for', JSON.stringify(msg));
      jsonfile.readFile(msg.fileName, (err, object) => {
        rn_bridge.channel.send({
          name: 'read-json-callback',
          callbackId: msg.callbackId,
          error: err,
          payload: JSON.stringify(object),
        });
      });
    } else if (msg.name === 'start-server') {
      console.log('Starting local webserver', JSON.stringify(msg));
      localServer = new LocalWebServer(msg.port);
      rn_bridge.channel.send({
        name: 'local-webserver-callback',
        callbackId: msg.callbackId,
      });
    } else if (msg.name === 'register-file') {
      console.log(
        'Registering local file with local webserver',
        JSON.stringify(msg),
      );
      localFilePathToPlay = msg.filePath;
      rn_bridge.channel.send({
        callbackId: msg.callbackId,
      });
    }
  } catch (ex) {
    console.log('ERROR in node process:', JSON.stringify(ex));
  }
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');
