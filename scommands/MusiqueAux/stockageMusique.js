const {
    createAudioPlayer,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const fs = require("fs");

module.exports = {
    mapSong: new Map(),

    execute(serveurDiscord, create) {
        let that = this;

        if(!this.mapSong.has(serveurDiscord)){
            if(fs.existsSync(`./FolderContainer/Songs/${serveurDiscord}/musicList.json`)){
                fs.readFile(`./FolderContainer/Songs/${serveurDiscord}/musicList.json`, 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        const obj = JSON.parse(data);
                        /*console.log(obj.loopingLevel);
                        console.log(obj.index);
                        console.log(obj.nbSong);
                        console.log(obj.songs);*/

                        let musicObj = {
                            loopingLevel: obj.loopingLevel,
                            //isLoading: false,
                            isStopped: true,
                            index: obj.index,
                            nbSong: obj.nbSong,
                            songs: obj.songs,
                            player: createAudioPlayer({
                                behaviors: {
                                    noSubscriber: NoSubscriberBehavior.Pause,
                                    //maxMissedFrames: 500,
                                }
                            }),
                            timeStampOnPlay: 0,
                            connection: null,
                            lastTextChannel: null,
                            idlePlayer: false,
                            JSONPath: `./FolderContainer/Songs/${serveurDiscord}/musicList.json`
                        }

                        createMap(musicObj);
                    }
                });

                console.log(`Récupération d'un fichier JSON de stockage : ${serveurDiscord}`);
            }
            else if(create){
                let musicObj = {
                    loopingLevel: 0,
                    //isLoading: false,
                    isStopped: true,
                    index: 0,
                    nbSong: 0,
                    songs: [],
                    player: createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Pause,
                            //maxMissedFrames: 500,
                        }
                    }),
                    timeStampOnPlay: 0,
                    connection: null,
                    lastTextChannel: null,
                    idlePlayer: false,
                    JSONPath: `./FolderContainer/Songs/${serveurDiscord}/musicList.json`
                };
                createMap(musicObj);
                console.log(`création d\'un serveur discord dans la map (stockageMusique) : ${serveurDiscord}`);
            }
        }

        function createMap(obj){
            that.mapSong.set(serveurDiscord, obj);
        }
    }
}