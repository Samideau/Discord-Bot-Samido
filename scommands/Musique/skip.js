const { SlashCommandBuilder } = require('discord.js');
const voice = require('@discordjs/voice');

const mapMusique = require('../MusiqueAux/stockageMusique.js');
const playCommand = require('./play.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Permet de jouer la musique suivante dans la file')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Le numéro de la chanson a aller directement dans la playliste')
                .setMinValue(1)
                .setRequired(false))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user.tag;

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);
        const position = interaction.options.getInteger("position");

        if(mapMusique.mapSong.get(serveurDiscord)["nbSong"] > 0){
            let index = 0;
            if(position && position <= mapMusique.mapSong.get(serveurDiscord)["nbSong"]){
                index = position - 1;
            }else if(!position){
                index = mapMusique.mapSong.get(serveurDiscord)["index"] + 1;
                if (index >= mapMusique.mapSong.get(serveurDiscord)["nbSong"])
                    index = 0;
            }else{
                return interaction.reply({content: "La valeur mise en entrée n'est pas une valeur valide", ephemeral: true});
            }

            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.index = index;
            mapMusique.mapSong.set(serveurDiscord, objJs);

            return playCommand.execute(interaction, 'skip', null, client, Discord);
        }
        else{
            interaction.reply({content: `Il n'y a aucune musique à jouer pour l'instant`, ephemeral: true});
        }
    }
}