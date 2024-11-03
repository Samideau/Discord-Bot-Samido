const { SlashCommandBuilder } = require('discord.js');
const mapMusique = require('../MusiqueAux/stockageMusique.js');
const voice = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Permet de mettre la pause sur la musique actuelle')
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;

        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);

        mapMusique.mapSong.get(serveurDiscord)["player"].pause();
        return interaction.reply({content: `:eyes: j'ai mis la musique en pause comme vous le souhaitiez`, ephemeral: false});
    }
}