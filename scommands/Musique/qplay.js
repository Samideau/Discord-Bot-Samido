const { SlashCommandBuilder } = require('discord.js');
const voice = require('@discordjs/voice');

const {
    joinVoiceChannel
} = require('@discordjs/voice');

const mapMusique = require('../MusiqueAux/stockageMusique.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('qplay')
		.setDescription('Permet de jouer la musique actuelle de la playlist')
        .setDMPermission(false),

    execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user.tag;

        if (!voiceChannel) return interaction.reply({content: 'Vous avez besoin d\'être dans un channel vocal pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, true);

        setTimeout(() => {
            createConnection(serveurDiscord);

            return require('./play.js').execute(interaction, 'qplay', null, client, Discord);
        }, 1000);

        function createConnection(serveurDiscord){

            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: serveurDiscord,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            objJs.lastTextChannel = interaction.channel;
            mapMusique.mapSong.set(serveurDiscord, objJs);
        }
    }
}