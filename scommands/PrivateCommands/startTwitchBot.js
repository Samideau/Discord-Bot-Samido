const { SlashCommandBuilder } = require('discord.js');
const twitchBot = require('../../Twitch/main.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("starttwitchbot")
        .setDescription("Démarre le bot Twitch")
        .setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArgs, client, Discord) {
        twitchBot.executeTwitch("start", autreArgs);
        if(interaction)
            return interaction.reply("Démarage du bot Twitch !");
        return console.log("Démarage du bot Twitch !");
    }
}