const { SlashCommandBuilder } = require('discord.js');

const voice = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');

const mapMusique = require('../MusiqueAux/stockageMusique.js');
module.exports = {
    data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Le bot arrête complètement la musique qui est en cours de lecture')
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user.tag;

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);

        if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status === AudioPlayerStatus.Playing){
            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.isStopped = true;
            mapMusique.mapSong.set(serveurDiscord, objJs);

            mapMusique.mapSong.get(serveurDiscord)["player"].stop();

            return interaction.reply({content: `oké jme tais :c !`, ephemeral: false});
        }
        else
            return interaction.reply({content: `Je ne suis pas en train de jouer une musique !`, ephemeral: true});
    }
}