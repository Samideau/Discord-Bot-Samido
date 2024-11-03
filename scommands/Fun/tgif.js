const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
//const Jimp = require("jimp");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tgif")
        .setDescription("Permet d'envoyer un gif")
        .addUserOption(option =>
            option.setName("utilisateur")
                .setDescription("Sélectionne un membre du discord")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("catégorie")
                .setDescription("La catégorie de gif")
                .addChoices(
                    {name: 'Câlin', value: 'calin'},
                    {name: 'Bisous', value: 'bisous'},
                    {name: 'Rouler une pelle', value: 'hardbisous'},
                    {name: 'Coucou', value: 'coucou'},
                    {name: 'Mordille', value: 'mordille'},
                    {name: 'Mordre', value: 'mordre'},
                    {name: 'Pat Pat', value: 'pat'},
                    {name: 'Taper dans la main', value: 'check'},
                    {name: 'Frapper', value: 'frapper'},
                    {name: 'Gifler', value: 'gifler'},
                    {name: 'Boop', value: 'boop'},
                    {name: 'Tuer', value: 'tuer'},
                    {name: 'Maudire', value: 'maudire'},
                    {name: 'Se blottir contre', value: 'senlacer'},
                    {name: 'Sexe', value: 'sexe'})
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {

        const utilisateur = interaction.options.getUser('utilisateur');
        const categorie = interaction.options.getString("catégorie");
        const cheminJSON = "./FolderContainer/Gifs/tgif.json";

        if(utilisateur === interaction.user)
            interaction.user = client.user;

        //console.log(interaction.user.displayAvatarURL());
        //console.log(utilisateur);

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
                const afterphrase = object[`${categorie}`].afterphrases[Math.floor(Math.random()*object[`${categorie}`].afterphrases.length)];

                console.log(imageURL);

                const newEmbed = new EmbedBuilder()
                    .setColor('#05ff00')
                    .setAuthor({ name: `${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)} ${phrase} ${utilisateur.username.charAt(0).toUpperCase() + utilisateur.username.slice(1)} ${afterphrase}`, iconURL: `${interaction.user.displayAvatarURL({dynamic: true})}`, url: `${imageURL}` })
                    //.setTitle(`\u200b`)
                    //.setDescription(`${utilisateur}`)
                    .setImage(imageURL)
                    //.setFooter({ text: `${utilisateur.username}`});
                //.setTimestamp();


                return interaction.reply({content: `${utilisateur}`, embeds: [newEmbed] });
            }
        });
    }
}