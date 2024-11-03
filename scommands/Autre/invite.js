const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Permet de générer un lien d'invitation pour le bot"),
    async execute(interaction, commandName, autreArgs, client, Discord) {

        let lienMessage = `Pour m'ajouter à votre serveur, cliquer sur mon profile, ajouter l'application, ajouter au serveur puis sélectionner le vôtre. Il n'y a rien de plus simple !`;

        const embed = new EmbedBuilder()
            .setColor('#05ff00')
            .setImage("https://media.discordapp.net/attachments/1105819422469390406/1237006632991330417/image.png?ex=663a13b3&is=6638c233&hm=4c34205fe29b2515f163b30412404e7b403dc65d30c85c680d4b8126871752cb&=&format=webp&quality=lossless")
            .setTimestamp();

        return interaction.reply({content: lienMessage, embeds: [embed], ephemeral: true});
    }
}