const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hoyocodes')
        .setDescription('Commande qui permet de générer des liens pour entrer le(s) code(s) sur les jeux Hoyoverses')
        .addStringOption(option =>
            option.setName('jeu')
                .setDescription('le jeu d\'Hoyoverse concerné par ce code')
                .setRequired(true)
                .addChoices(
                    { name: 'Genshin Impact', value: 'gi' },
                    { name: 'Honkai Star Rail', value: 'hsr' },
                    { name: 'Zenless Zone Zero', value: 'zzz' }))
        .addStringOption(option =>
            option.setName('codes')
                .setDescription('le(s) code(s) (si plusieurs, séparé par une virgule (\',\'))')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {

        const jeu = interaction.options.getString('jeu');
        const codes = interaction.options.getString('codes');

        let tabCodes = codes.split(",");
        let strFinal = "";
        console.log(tabCodes);

        if(jeu === "gi"){
            for(let i = 0; i < tabCodes.length; i++){
                strFinal += "https://genshin.hoyoverse.com/fr/gift?code=" + tabCodes[i].trim() + "\n";
            }
        }else if(jeu === "hsr"){
            for(let i = 0; i < tabCodes.length; i++){
                strFinal += "https://hsr.hoyoverse.com/gift?code=" + tabCodes[i].trim() + "\n";
            }
        }else if(jeu === "zzz"){
            for(let i = 0; i < tabCodes.length; i++){
                strFinal += "https://zenless.hoyoverse.com/redemption?code=" + tabCodes[i].trim() + "\n";
            }
        }else{
            return interaction.reply("Une erreur est survenue lors de l'utilisation de cette commande (jeu inconnu)");
        }

        let strJeu = "ERROR GAME NOT FOUND";

        switch (jeu)
        {
            case "gi":
                strJeu = "Genshin Impact";
                break;
            case "hsr":
                strJeu = "Honkai Star Rail";
                break;
            case "zzz":
                strJeu = "Zenless Zone Zero";
                break;
            default:
                return interaction.reply("Une erreur est survenue lors de l'utilisation de cette commande (jeu inconnu [switch??])");
        }

        interaction.reply(`Voici le(s) lien(s) pour le(s) code(s) de ${strJeu}\n` + strFinal);
    }
}