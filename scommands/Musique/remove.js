const { SlashCommandBuilder } = require('discord.js');
const voice = require('@discordjs/voice');
const {
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const fs = require('fs');

const mapMusique = require('../MusiqueAux/stockageMusique.js');
const playCommand = require('./play.js');
const autoLeaveCommand = require('../AutreAux/AutoLeave.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Permet de supprimer la musique indiquer dans la playlist')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Le numéro de la chanson a retirer de la liste')
                .setMinValue(1)
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const chemin = `./FolderContainer/Songs/${serveurDiscord}`;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user.tag;

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);
        let objJs = mapMusique.mapSong.get(serveurDiscord);
        const position = interaction.options.getInteger("position");

        if(position <= objJs.nbSong) {

            if (fs.existsSync(chemin)) {
                const songToDelete = position - 1;
                objJs.nbSong = objJs.nbSong - 1;
                let deletedSong = objJs.songs.splice(songToDelete, 1);
                mapMusique.mapSong.set(serveurDiscord, objJs); //set

                if (mapMusique.mapSong.get(serveurDiscord)["nbSong"] > 0) {
                    if (objJs.index > songToDelete){
                        objJs.index = objJs.index - 1;
                        mapMusique.mapSong.set(serveurDiscord, objJs); //set

                        interaction.reply({content: "Traitement de la suppression en cours", ephemeral: true});
                    }
                    else{
                        console.log(`${songToDelete} VS ${mapMusique.mapSong.get(serveurDiscord)["index"]}`);
                        if(!mapMusique.mapSong.get(serveurDiscord)["isStopped"] && songToDelete === mapMusique.mapSong.get(serveurDiscord)["index"]){

                            if(mapMusique.mapSong.get(serveurDiscord)["index"] >= mapMusique.mapSong.get(serveurDiscord)["nbSong"]){
                                objJs.index = objJs.index - 1;
                                mapMusique.mapSong.set(serveurDiscord, objJs); //set
                            }
                            mapMusique.mapSong.get(serveurDiscord)["player"].stop();
                            playCommand.execute(interaction, 'remove', null, client, Discord);
                        }
                        else{
                            interaction.reply({content: "Traitement de la suppression en cours", ephemeral: true});
                        }
                    }
                }
                else {
                    return autoLeaveCommand.execute("removeLeave", serveurDiscord, interaction);
                }

                setTimeout(() => {
                    let songToDelete = deletedSong[0]["title"];
                    let newObject = {loopingLevel: mapMusique.mapSong.get(serveurDiscord)["loopingLevel"],
                        index: mapMusique.mapSong.get(serveurDiscord)["index"],
                        nbSong: mapMusique.mapSong.get(serveurDiscord)["nbSong"],
                        songs: mapMusique.mapSong.get(serveurDiscord)["songs"]};


                    fs.writeFile(mapMusique.mapSong.get(serveurDiscord)["JSONPath"], JSON.stringify(newObject), function (err, result) {
                        if (err) console.log('error', err);
                        else
                            interaction.channel.send(`la chanson : ***${songToDelete}*** a été supprimé avec succès`);
                    });
                }, 1000);

            }
            else{
                console.log(`[remove.js] Le dossier correspondant au serveur discord : ${serveurDiscord} n\'existe pas`);
                return interaction.reply({content: "Il n'y a aucune chanson à supprimer !", ephemeral: true});
            }
        }
        else{
            return interaction.reply({content: "La valeur mise en entrée n'est pas une valeur valide", ephemeral: true});
        }
    }
}