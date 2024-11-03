const mapMusique = require('../MusiqueAux/stockageMusique.js');
const fs = require('fs');
const rimraf = require('rimraf');

const {
    createAudioResource
} = require('@discordjs/voice');

module.exports = {
    execute(command, serveurDiscord, interaction) {

        mapMusique.execute(serveurDiscord, false);

        if(command === 'AutoLeave'){
            if(mapMusique.mapSong.get(serveurDiscord)["lastTextChannel"] !== null){
                mapMusique.mapSong.get(serveurDiscord)["lastTextChannel"].send("Je suis parti, car je suis resté seul pendant trop longtemps :c");
                disconnected(false);

            }
        }
        else if(command === 'leaveAdmin'){
            if(mapMusique.mapSong.get(serveurDiscord)["lastTextChannel"] !== null){
                mapMusique.mapSong.get(serveurDiscord)["lastTextChannel"].send("Un(e) méchant(e) admin m'a déconnecté du salon !");
                disconnected(true);
            }
        }
        else if(command === 'removeLeave'){
            interaction.reply({content: "Il n'y a plus aucune chanson dans la file, donc je suis partis :o", ephemeral: false});
            disconnected(true);
        }

        function disconnected(hasToDelete){
            mapMusique.mapSong.get(serveurDiscord)["player"].stop();
            mapMusique.mapSong.get(serveurDiscord)["connection"].destroy();
            mapMusique.mapSong.delete(serveurDiscord);

            if(hasToDelete)
                deleteAllFiles(serveurDiscord);
        }

        function deleteAllFiles(serveurDiscord){
            const chemin = `./FolderContainer/Songs/${serveurDiscord}`;
            if (fs.existsSync(chemin)) {
                rimraf(chemin, (err) => {
                    if(err){
                        console.log(`Une erreur est survenue lors de la suprétion d'un dossier de chanson`);
                        return
                    }

                    console.log(`Dossier suprimé avec succès`);
                });
            }
        }
    }
}