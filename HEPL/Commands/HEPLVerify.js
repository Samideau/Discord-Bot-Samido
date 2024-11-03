const { SlashCommandBuilder } = require('discord.js');

const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heplverify')
        .setDescription('Commande qui permet de valider son enregistrement')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code reçu via l\'utilisation de la commande /heplregister')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const code = interaction.options.getString('code');

        if(!interaction.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageRoles)) 
            return interaction.reply({content: "Le bot n'a pas la permission de modifier les rôles des utilisateurs", ephemeral: true});

        if(code.length !== 6)
            return interaction.reply({content: "Code invalide", ephemaral: true});

        if(fs.existsSync(`./HEPL/PendingVerification.json`)){
            const dataPV = fs.readFileSync(`./HEPL/PendingVerification.json`, 'utf8')
            const objPV = JSON.parse(dataPV);

            let userIndex = objPV.userIdArray.indexOf(interaction.user.id);

            if(userIndex === -1)
                return interaction.reply({content: "Vous n'êtes pas en cours de validation", ephemaral: true});

            if(objPV.codeArray[userIndex] !== code)
                return interaction.reply({content: "Code invalide", ephemaral: true});
            
            const dataAC = fs.readFileSync(`./HEPL/AlreadyCompleted.json`, 'utf8');
            const objAC = JSON.parse(dataAC);

            objAC.emailArray.push(objPV.emailArray.splice(userIndex, 1).join(""))
            objAC.userIdArray.push(objPV.userIdArray.splice(userIndex, 1).join(""))

            fs.writeFile(`./HEPL/AlreadyCompleted.json`, JSON.stringify(objAC), (err) => {
                if (err) throw err;
    
                console.log("[HEPL Register]Le fichier AlreadyCompleted.json a été édité avec succès");
            });

            objPV.codeArray.splice(userIndex, 1);

            fs.writeFile(`./HEPL/PendingVerification.json`, JSON.stringify(objPV), (err) => {
                if (err) throw err;
    
                console.log("[HEPL Register]Le fichier PendingVerification.json a été édité avec succès");
            });

            interaction.member.roles.add(interaction.guild.roles.cache.get("1302056767265574932"));

            interaction.reply({content: "done", ephemeral: true}).then(async message => {
                await wait(5_000);
                if(interaction.guildId)
                    message.delete();
            });
        }
        else
        {
            return interaction.reply({content: "Une erreur est survenue, merci de contacter le propriétaire du bot", ephemaral: true});
        }
    }
}