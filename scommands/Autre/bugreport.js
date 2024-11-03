const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bugreport")
        .setDescription("Permet d\'envoyer un raport de bug au propriétaire du bot")
        .addStringOption(option =>
                option.setName('message')
                    .setDescription('Message contenant une explication du bug')
                    .setRequired(true)),
    async execute(interaction, commandName, autreArgs, client, Discord) {

        const cheminJson = `./FolderContainer/BugReport/${interaction.guild.name}(${interaction.guild.id}).json`;
        if (!fs.existsSync(cheminJson)){
            fs.writeFile(cheminJson, JSON.stringify({bugs: []}), function(err) {
                if(err) console.log('error', err);
            });
        }


        fs.readFile(cheminJson, 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            }

            const obj = JSON.parse(data);
            const messageBug = interaction.options.getString('message');

            obj.bugs.push({nom: interaction.user.tag, id: interaction.user.id, bug: messageBug});
            fs.writeFile(cheminJson, JSON.stringify(obj), function(err) {
                if(err) console.log('error', err);
            });
        });

        return interaction.reply({content: `Votre rapport à été envoyé avec succès, merci de votre contribution ! :3`, ephemeral: true});
    }
}