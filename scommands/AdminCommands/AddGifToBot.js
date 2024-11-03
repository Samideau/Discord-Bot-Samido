const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addgif")
        .setDescription("Permet de suggérer l'ajout d'un gif pour la commande /gif")
        .addStringOption(option =>
            option.setName("catégorie")
                .setDescription("catégorie correspondant au gif que vous voulez suggérer l'ajout")
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
                    {name: 'Rigoler', value: 'rigoler'}
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
        const cheminJSONGif = "./FolderContainer/Gifs/gif.json";
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