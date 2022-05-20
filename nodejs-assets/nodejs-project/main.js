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
        this.client.add(magnetUri, { path: location }, (torrent) => {
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
                rn_bridge.channel.send({
                    callbackId: this.callbackId,
                    name: 'torrent-progress',
                    downloaded: torrent.downloaded,
                    downloadSpeed: torrent.downloadSpeed,
                    uploadSpeed: torrent.uploadSpeed,
                    progress: torrent.progress,
                });
            }, 1000);
            torrent.on('download', (bytes) => {
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
    port;
    constructor(port) {
        this.port = port;
    }

    startServer(callback) {
        console.log('Starting local webserver on port', this.port);
        this.app = express();
        this.app.use(cors());
        this.app.listen(this.port, () => {
            console.log(`Local webserver listening on port ${this.port}`);
            callback();
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
                const file = fs.createReadStream(localFilePathToPlay, {
                    start,
                    end,
                });
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

    stopServer() {
        this.app.close();
    }
}

class VttTidier {
    callbackId;
    constructor(callbackId) {
        console.log('Creating VTT Tidier with', callbackId);
        this.callbackId = callbackId;
    }
    splitEntries(subtitles) {
        const dialogEntries = subtitles.split(/\n\n/);
        dialogEntries.shift(); // Remove the WEBTTV line.
        const keyedDialogEntries = dialogEntries
            .map((entry) => {
                return {
                    time: entry.slice(0, entry.indexOf('\n')),
                    text: entry.slice(entry.indexOf('\n') + 1),
                };
            })
            .filter((entry) => entry.text && entry.time);
        console.log(
            'Created keyed dialog entries with',
            keyedDialogEntries.length,
            'entries',
        );
        return keyedDialogEntries;
    }
    removeBackgrounds(keyedDialogEntries) {
        console.log('Removing backgrounds');
        return keyedDialogEntries.filter((keyedDialogEntry) => {
            return !keyedDialogEntry.text.match(
                /m 0 0 l 0 \d{1,3} l \d{1,3} \d{1,3} l \d{1,3} 0/gm,
            );
        });
    }

    removeDuplicateText(keyedDialogEntries) {
        const dedupedDialogs = [];
        keyedDialogEntries.forEach((keyedDialogEntry) => {
            const duplicatedItem = dedupedDialogs.find((dialog) => {
                const sameDialog = dialog.text === keyedDialogEntry.text;
                const dialogEndTime = dialog.time.split(' --> ')[1];
                const currentDialogStartTime =
                    keyedDialogEntry.time.split(' --> ')[0];
                return sameDialog && dialogEndTime === currentDialogStartTime;
            });
            if (duplicatedItem) {
                // Update display duration of duplicatedItem
                const firstInstanceStartTime =
                    duplicatedItem.time.split(' --> ')[0];
                const currentInstanceEndTime =
                    keyedDialogEntry.time.split(' --> ')[1];
                duplicatedItem.time = `${firstInstanceStartTime} --> ${currentInstanceEndTime}`;
            } else {
                dedupedDialogs.push(keyedDialogEntry);
            }
        });
        console.log(
            'Removed duplicate dialog pieces',
            keyedDialogEntries.length,
            '->',
            dedupedDialogs.length,
        );
        return dedupedDialogs;
    }

    markSignText(keyedDialogEntries) {
        keyedDialogEntries.forEach((entry) => {
            entry.text = entry.text.replace(/{=\d+}/gm, '[Sign] ');
        });
        console.log('Marked sign text');
        return keyedDialogEntries;
    }

    serializeDialogEntries(keyedDialogEntries) {
        const dialogEntries = keyedDialogEntries.map((keyedEntry) => {
            return `${keyedEntry.time}\n${keyedEntry.text}`;
        });
        let vttText = 'WEBVTT\n\n';
        dialogEntries.forEach((dialogEntry) => {
            vttText += dialogEntry;
            vttText += '\n\n';
        });
        return vttText;
    }

    tidyVttFile(path) {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to read text file', err);
                rn_bridge.channel.send({
                    callbackId: this.callbackId,
                });
                return;
            }
            console.log('Read data file with', data.length, 'lines');
            const processDialogEntries = this.markSignText(
                this.removeDuplicateText(
                    this.removeBackgrounds(this.splitEntries(data)),
                ),
            );
            console.log('Finished processing subtitles, serializing...');
            const vttText = this.serializeDialogEntries(processDialogEntries);
            console.log('Writing text length', vttText.length, 'to', path);
            fs.writeFile(path, vttText, (writeerr) => {
                if (writeerr) {
                    console.error(writeerr);
                } else {
                    console.log('Successfully processed VTT');
                }
                rn_bridge.channel.send({
                    callbackId: this.callbackId,
                });
            });
        });
    }
}

// Echo every message received from react-native.
rn_bridge.channel.on('message', (msg) => {
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
            jsonfile.writeFile(msg.fileName, JSON.parse(msg.payload), (err) => {
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
            if (localServer) {
                console.log(
                    'Already created a webserver, not creating a second one.',
                );
                rn_bridge.channel.send({
                    name: 'local-webserver-callback',
                    callbackId: msg.callbackId,
                });
                return;
            }
            localServer = new LocalWebServer(msg.port);
            localServer.startServer(() => {
                rn_bridge.channel.send({
                    name: 'local-webserver-callback',
                    callbackId: msg.callbackId,
                });
            });
        } else if (msg.name === 'stop-server') {
            console.log('Starting local webserver', JSON.stringify(msg));
            if (localServer) {
                console.log('No webserver, cant stop!');
                return;
            }
            localServer.stopServer();
        } else if (msg.name === 'register-file') {
            console.log(
                'Registering local file with local webserver',
                JSON.stringify(msg),
            );
            localFilePathToPlay = msg.filePath;
            rn_bridge.channel.send({
                callbackId: msg.callbackId,
            });
        } else if (msg.name === 'tidy-vtt') {
            const vttTider = new VttTidier(msg.callbackId);
            console.log('Going to tidy VTT file', msg.filePath);
            vttTider.tidyVttFile(msg.filePath);
        } else if (msg.name === 'base64-image') {
            fs.readFile(msg.outputFilePath, 'base64', (err, data) => {
                if (err) {
                    console.error(
                        'Error reading file to convert to B64',
                        JSON.stringify(err),
                    );
                    rn_bridge.channel.send({
                        callbackId: msg.callbackId,
                        b64String: '',
                    });
                    return;
                }
                console.log(
                    'Successfully created b64 strin, length: ',
                    data.length,
                );
                rn_bridge.channel.send({
                    callbackId: msg.callbackId,
                    b64String: 'data:image/jpeg;base64,' + data,
                });
            });
        }
    } catch (ex) {
        console.log('ERROR in node process:', JSON.stringify(ex));
    }
});

process.on('uncaughtException', (error) => {
    console.log('Uncaught error:', JSON.stringify(error));
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');
