const {
    AudioPlayerStatus,
    VoiceConnectionStatus
} = require('@discordjs/voice');

const mapMusique = require('./stockageMusique.js');
//const playCommand = require('./play.js');

module.exports = {
    execute(interaction, serveurDiscord, client, Discord) {

        mapMusique.execute(serveurDiscord);
        if(!mapMusique.mapSong.get(serveurDiscord)["idlePlayer"]){ //Ne peut être activer qu'1x par discord

            mapMusique.mapSong.get(serveurDiscord)["player"].on(AudioPlayerStatus.Idle, () => {
                //console.log("here idle");

                setTimeout(() => {
                    /*console.log(mapMusique.mapSong.get(serveurDiscord)["player"].state.status);
                    console.log(mapMusique.mapSong.get(serveurDiscord)["nbSong"]);
                    console.log(mapMusique.mapSong.get(serveurDiscord)["isStopped"]);
                    console.log(mapMusique.mapSong.get(serveurDiscord)["loopingLevel"]);*/

                    if(mapMusique.mapSong.has(serveurDiscord) &&
                        mapMusique.mapSong.get(serveurDiscord)["player"].state.status === "idle" &&
                        mapMusique.mapSong.get(serveurDiscord)["nbSong"] > 0 &&
                        !mapMusique.mapSong.get(serveurDiscord)["isStopped"] &&
                        mapMusique.mapSong.get(serveurDiscord)["loopingLevel"] > 0){

                        let index = mapMusique.mapSong.get(serveurDiscord)["index"];
                        //console.log("Still idle");

                        if(mapMusique.mapSong.get(serveurDiscord)["loopingLevel"] === 1){
                            index++;
                            if (index >= mapMusique.mapSong.get(serveurDiscord)["nbSong"])
                                index = 0;
                        }

                        let objJs = mapMusique.mapSong.get(serveurDiscord);
                        objJs.index = index;
                        mapMusique.mapSong.set(serveurDiscord, objJs);

                        require('../Musique/play.js').execute(null, 'idlePlayer', interaction.guild.id, client, Discord);
                    }
                }, 3000);
            });

            // if(mapMusique.mapSong.get(serveurDiscord)["connection"]){
            //     mapMusique.mapSong.get(serveurDiscord)["connection"].on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            //         try {
            //             await Promise.race([
            //                 entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            //                 entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            //             ]);
            //             // Seems to be reconnecting to a new channel - ignore disconnect
            //         } catch (error) {
            //             // Seems to be a real disconnect which SHOULDN'T be recovered from
            //             connection.destroy();
            //         }
            //     });
            // }

            /*mapMusique.mapSong.get(serveurDiscord)["player"].on(AudioPlayerStatus.Buffering, () => {
                console.log("here Buffer");
            });

            mapMusique.mapSong.get(serveurDiscord)["player"].on(AudioPlayerStatus.Playing, () => {
                console.log("here Playing");
            });*/

            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.idlePlayer = true;
            mapMusique.mapSong.set(serveurDiscord, objJs);
        }
    }
}