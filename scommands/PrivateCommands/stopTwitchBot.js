const { SlashCommandBuilder } = require('discord.js');
const twitchBot = require('../../Twitch/main.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stoptwitchbot")
        .setDescription("Arrête le bot Twitch")
        .setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArgs, client, Discord) {
        if(interaction)
            return interaction.reply(await twitchBot.executeTwitch("stop", autreArgs) ? "Mise à l'arrêt du bot Twitch !" : "Une erreur est survenue pour arrêter le bot");
        return console.log(await twitchBot.executeTwitch("stop", autreArgs) ? "Mise à l'arrêt du bot Twitch !" : "Une erreur est survenue pour arrêter le bot");
    }
}