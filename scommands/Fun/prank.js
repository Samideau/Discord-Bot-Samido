const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prank")
        .setDescription("Permet de pranker avec un sound quelqu un")
        .addStringOption(option =>
            option.setName("catégorie")
                .setDescription("La catégorie de gif")
                .addChoices(
                    {name: 'A', value: 'b'},
                    {name: 'B', value: 'a'})
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {

    }
}