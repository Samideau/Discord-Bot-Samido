const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addtgif")
        .setDescription("Permet de suggérer l'ajout d'un gif pour la commande /tgif")
        .addStringOption(option =>
            option.setName("catégorie")
                .setDescription("catégorie correspondant au gif que vous voulez suggérer l'ajout")
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
                    {name: 'Sexe', value: 'sexe'}
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName("liengif")
                .setDescription("URL du gif")
                .setRequired(true))
        .setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {
        const categorie = interaction.options.getString("catégorie");
        const urlGif = interaction.options.getString("liengif");
        const cheminJSON = "./FolderContainer/Gifs/suggestiongif.json";
        const cheminJSONGif = "./FolderContainer/Gifs/tgif.json";
        let replyMessage = `Le lien indiqué n'est pas un gif reconnu par le bot, veuillez réessayer`;

        //console.log(urlGif.endsWith(".gif"));

        if(!urlGif.endsWith(".gif"))
            return interaction.reply({content: replyMessage, ephemeral: true });

        //await interaction.deferReply({ephemeral: true});

        fs.readFile(cheminJSONGif, 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                const object = JSON.parse(data);
                if (object[`${categorie}`].urls.includes(urlGif)) {
                    replyMessage = `Le lien indiqué existe déjà dans la liste des gifs présent sur le bot !`;
                    return interaction.reply({content: replyMessage, ephemeral: true });
                }
                else {
                    //console.log("check");
                    fs.readFile(cheminJSON, 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            let object = JSON.parse(data);
                            //console.log(object[`${categorie}`]);

                            if(!object[`${categorie}`]){
                                object[`${categorie}`] = [{"pseudo": `${interaction.user.username} | ${interaction.user.id}`, "lienURL": urlGif}];
                            }
                            else {
                                for(const obj of object[`${categorie}`])
                                {
                                    if(obj.lienURL.includes(urlGif))
                                    {
                                        replyMessage = `Le lien indiqué existe déjà dans la liste des suggestions, veuillez patienter que le proprio l'ajoute !`;
                                        return interaction.reply({content: replyMessage, ephemeral: true });
                                    }
                                }

                                object[`${categorie}`].push({"pseudo": `${interaction.user.username} | ${interaction.user.id}`, "lienURL": urlGif});
                            }

                            fs.writeFile(cheminJSON, JSON.stringify(object), function (err, result) {
                                if (err) console.log('error', err);
                                //console.log("check2");

                                replyMessage = `Le lien a bien été enregistré, merci de votre contribution !`;
                                return interaction.reply({content: replyMessage, ephemeral: true });
                            });
                        }
                    });
                }
            }
        });
    }
}