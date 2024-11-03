const { SlashCommandBuilder } = require('discord.js');
const voice = require('@discordjs/voice');

const mapMusique = require('../MusiqueAux/stockageMusique.js');
module.exports = {
    data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Permet de reprendre là où s\'était arrêtée la musique actuelle')
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user.tag;

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);

        mapMusique.mapSong.get(serveurDiscord)["player"].unpause();
        return interaction.reply({content: `https://tenor.com/view/jdg-here-we-go-again-ah-shit-here-we-go-again-ah-zut-cest-reparti-mon-kiki-gif-17343563`, ephemeral: false});
    }
}