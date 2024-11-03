const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
//const Jimp = require("jimp");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gif")
        .setDescription("Permet d'envoyer un gif")
        .addStringOption(option =>
            option.setName("catégorie")
                .setDescription("La catégorie de gif")
                .addChoices(
                    {name: 'Sourire', value: 'sourire'},
                    {name: 'Rougir', value: 'rougir'},
                    {name: 'Bouder', value: 'bouder'},
                    {name: 'Fatiguer', value: 'fatiguer'},
                    {name: 'Danser', value: 'danser'},
                    {name: 'Tousser', value: 'tousser'},
                    {name: 'Malade', value: 'malade'},
                    {name: 'Trigger', value: 'trigger'},
                    {name: 'Hausser les épaules', value: 'shrug'},
                    {name: 'Pensif', value: 'pensif'},
                    {name: 'Heureux', value: 'heureux'},
                    {name: 'Pervers', value: 'pervers'},
                    {name: 'Pleurer', value: 'pleurer'},
                    {name: 'Eh Eh', value: 'smug'},
                    {name: 'Pouce vers le haut', value: 'thumbsup'},
                    {name: 'Rigoler', value: 'rigoler'})
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {
        const categorie = interaction.options.getString("catégorie");
        const cheminJSON = "./FolderContainer/Gifs/gif.json";

        //console.log(interaction.user.displayAvatarURL());
        //console.log(utilisateur);

        specialNameChecker();

        fs.readFile(cheminJSON, 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                const object = JSON.parse(data);
                //console.log(object[`${categorie}`]);
                let imageURL = object[`${categorie}`].urls[Math.floor(Math.random()*object[`${categorie}`].urls.length)];
                if(!imageURL || imageURL === "")
                    imageURL = "https://cdn.dribbble.com/users/547471/screenshots/3063720/not_found.gif";

                const phrase = object[`${categorie}`].phrases[Math.floor(Math.random()*object[`${categorie}`].phrases.length)];

                console.log(imageURL);

                const newEmbed = new EmbedBuilder()
                    .setColor('#05ff00')
                    .setAuthor({ name: `${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)} ${phrase}`, iconURL: `${interaction.user.displayAvatarURL()}`, url: `${imageURL}` })
                    //.setTitle(`\u200b`)
                    //.setDescription(`${utilisateur}`)
                    .setImage(imageURL)
                //.setFooter({ text: `${utilisateur.username}`});
                //.setTimestamp();

                return interaction.reply({embeds: [newEmbed]});
            }
        });



        function specialNameChecker(){
            //Yami
            if(categorie === "smug" && interaction.user.id === "193086429398695936"){
                interaction.user.username = "Le maître des eheh";
            }
        }
    }
}