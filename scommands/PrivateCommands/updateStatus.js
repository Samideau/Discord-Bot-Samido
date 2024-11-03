const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updatestatus")
        .setDescription("Update le status du bot")
        .addStringOption(option =>
            option.setName("typestatus")
                .setDescription("La difficulté de la question")
                .addChoices(
                    { name: 'Playing', value: '1' },
                    { name: 'Streaming', value: '2' },
                    { name: 'Watching', value: '3' },
                    { name: 'Listening', value: '4' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName("messagestatus")
                .setDescription("Le message qui doit être affiché")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("urlstatus")
                .setDescription("L\'url lors d\'un status \"Streaming\"")
                .setRequired(false))
        .setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArgs, client, Discord) {
        const cheminJson = `./JSON/config.json`;

        const typeStatusIn = interaction.options.getString('typestatus');
        const urlStatusIn = interaction.options.getString('urlstatus');
        const messageStatusIn = interaction.options.getString('messagestatus');

        fs.readFile(cheminJson, 'utf8', async function readFileCallback(err, data){
            if (err){
                console.log(err);
            }
            else{
                let obj = JSON.parse(data);
                obj.typeStatus = typeStatusIn;
                if(messageStatusIn)
                    obj.messageStatus = messageStatusIn;
                if(urlStatusIn)
                    obj.urlStatus = urlStatusIn;

                fs.writeFile(cheminJson, JSON.stringify(obj), function(err) {
                    if(err) console.log('error', err);
                    else {
                        updateStatusBot(obj.messageStatus, obj.urlStatus);
                        return interaction.reply({content: `Commande effectuée avec succès`, ephemeral: true});
                    }
                });
            }
        });

        function updateStatusBot(messageStatus, urlStatus) {
            switch (typeStatusIn){
                case "1":
                    client.user.setActivity(messageStatus, { type: Discord.ActivityType.Playing});
                    break;
                case "2":
                    client.user.setActivity(messageStatus, { type: Discord.ActivityType.Streaming, url: urlStatus});
                    break;
                case "3":
                    client.user.setActivity(messageStatus, { type: Discord.ActivityType.Watching});
                    break;
                case "4":
                    client.user.setActivity(messageStatus, { type: Discord.ActivityType.Listening});
                    break;
                default:
                    client.user.setActivity(messageStatus, { type: Discord.ActivityType.Playing});
                    break;
            }
        }
    }
}