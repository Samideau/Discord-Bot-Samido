const voice = require('@discordjs/voice');
const {
    createAudioResource,
    getVoiceConnection
} = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const rimraf = require('rimraf');

const mapMusique = require('../MusiqueAux/stockageMusique.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Le bot vous dis au revoir avant de partir')
        .addBooleanOption(option =>
            option.setName('conservation')
                .setDescription('Est-ce que je dois garder en mémoire la playlist?')
                .setRequired(true))
        .setDMPermission(false),

    execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user;
        const conservation = interaction.options.getBoolean('conservation');

        mapMusique.execute(serveurDiscord, false);

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.mapSong.get(serveurDiscord)["player"].stop();
        mapMusique.mapSong.get(serveurDiscord)["connection"].destroy();

        interaction.reply({content: `Ok ça va _${author}_, je pars, pas besoin d\'être violent :c :cry:`, ephemeral: false});

        mapMusique.mapSong.delete(serveurDiscord);
        if(!conservation)
            deleteAllFiles(serveurDiscord);

        function deleteAllFiles(serveurDiscord){
            const chemin = `./FolderContainer/Songs/${serveurDiscord}`;
            /*if (fs.existsSync(chemin)) {
                const songs = fs.readdirSync(`${chemin}`).filter(file => file.endsWith('.mp3'));
                for(const file of songs){
                    const strFile = `${chemin}/${file}`;
                    fs.unlink(strFile, (err => {
                        if (err) console.log(err);
                        else {
                            console.log(`La chanson : ${file} a été supprimée`);
                        }
                    }));
                }
                console.log('Toutes les chansons ont été supprimées (si y en avait)');
            }*/

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