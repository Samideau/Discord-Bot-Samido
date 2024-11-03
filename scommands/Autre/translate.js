const { SlashCommandBuilder } = require('discord.js');
const translate = require('google-translate-api-x');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Commande qui permet de traduire un texte d\'une langue vers une autre')
        .addStringOption(option =>
            option.setName('vers')
                .setDescription('langue du texte traduit')
                .addChoices(
                    { name: 'Français', value: 'fr' },
                    { name: 'Anglais', value: 'en' },
                    { name: 'Japonais', value: 'ja' },
                    { name: 'Chinois', value: 'zh' },
                    { name: 'Néerlandais', value: 'nl' },
                    { name: 'Allemand', value: 'de' },
                    { name: 'Espagnol', value: 'es' },
                    { name: 'Italien', value: 'it' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('le texte à traduire')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('de')
                .setDescription('langue du texte à traduire')
                .addChoices(
                    { name: 'Français', value: 'fr' },
                    { name: 'Anglais', value: 'en' },
                    { name: 'Japonais', value: 'ja' },
                    { name: 'Chinois', value: 'zh' },
                    { name: 'Néerlandais', value: 'nl' },
                    { name: 'Allemand', value: 'de' },
                    { name: 'Espagnol', value: 'es' },
                    { name: 'Italien', value: 'it' })
                .setRequired(false))
        .setDMPermission(true),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        await interaction.deferReply({ephemeral: true});

        const texte = interaction.options.getString('texte');
        const de = interaction.options.getString('de');
        const vers = interaction.options.getString('vers');

        let res = "";

        if(de)
            res = await translate(texte, {to: vers, from: de, forceTo: true, autoCorrect: true});
        else
            res = await translate(texte, {to: vers, forceTo: true, autoCorrect: true});
        console.log(res);
        interaction.editReply({content: "(Attention, ceci est le résultat de google traduction, cela est approximatif)\n" + res.text});
    }
}