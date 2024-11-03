const { SlashCommandBuilder } = require('discord.js');

const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heplregister')
        .setDescription('Commande qui permet de s\'enregistrer sur le serveur')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Adresse email HEPL')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('groupe')
                .setDescription('Groupe dans lequel vous êtes')
                .setMinValue(101)
                .setMaxValue(212)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prenom')
                .setDescription('Si vous possédez un prénon composé, veuillez écrire votre prénom correctement ici')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Si vous possédez un nom de famille composé, veuillez écrire votre nom de famille correctement ici')
                .setRequired(false))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const email = interaction.options.getString('email');
        const groupe = interaction.options.getInteger('groupe');
        let prenom = interaction.options.getString('prenom');
        let nom = interaction.options.getString('nom');

        if(!interaction.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageNicknames)) 
            return interaction.reply({content: "Le bot n'a pas la permission de modifier les pseudos des utilisateurs", ephemeral: true});

        if(groupe > 124 && groupe < 201)
            return interaction.reply({content: "Numéro du groupe invalide", ephemeral: true});
        
        if(new RegExp('^[a-z]+\.[a-z]+@hepl\.be$').test(email) || new RegExp('^[a-z]+\.[a-z]+@heaj\.be$').test(email))
            return interaction.reply({content: "Adresse email de professeur détectée, pour avoir les accès, veuillez contacter <@269823993899384832>", ephemeral: true});

        if(!new RegExp('^[a-z]+\.[a-z]+@student\.hepl\.be$').test(email))
            return interaction.reply({content: "Adresse email non-valide", ephemeral: true});
        
        let acEmails = [];
        let acUserIds = [];
        if(fs.existsSync(`./HEPL/AlreadyCompleted.json`)){
            const data = fs.readFileSync(`./HEPL/AlreadyCompleted.json`, 'utf8');
            const obj = JSON.parse(data);
            acEmails = obj.emailArray;
            acUserIds = obj.userIdArray;
        }
        else
        {
            console.log("[HEPL Register] AlreadyCompleted.json n'existe pas");
        }

        if(acEmails.includes(email))
            return interaction.reply({content: "Adresse email déjà utilisé", ephemeral: true});

        if(acUserIds.includes(interaction.user.id))
            return interaction.reply({content: "Utilisateur déjà vérifié", ephemeral: true});

        let pvEmails = [];
        let pvUserIds = [];
        let pvCodes = [];
        if(fs.existsSync(`./HEPL/PendingVerification.json`)){
            const data = fs.readFileSync(`./HEPL/PendingVerification.json`, 'utf8')
            const obj = JSON.parse(data);
            
            //console.log(obj.emailArray);
        }
        else
        {
            console.log("[HEPL Register] PendingVerification.json n'existe pas");
        }

        //console.log(pvEmails);
        if(pvEmails.includes(email) || pvUserIds.includes(interaction.user.id))
            return interaction.reply({content: "En cours de validation, merci de bien vouloir vérifier votre identité (/HEPLVerify)", ephemeral: true});


        let arrayStringEmail = email.split("@");
        arrayStringEmail = arrayStringEmail[0].split(".");
        if(prenom)
        {
            //console.log(prenom.replaceAll(/[- ]+/g, "").replaceAll(/[éèê]+/g, "e").toLowerCase());
            if(prenom.replaceAll(/[- ]+/g, "").replaceAll(/[éèê]+/g, "e").toLowerCase() !== arrayStringEmail[0])
                return interaction.reply({content: "Votre prénom ne correspond pas à celui de l'adresse email encodé", ephemeral: true});
        }
        else
            prenom = arrayStringEmail[0].charAt(0).toUpperCase() + arrayStringEmail[0].slice(1);

        if(nom)
        {
            if(nom.replaceAll(/[- ]+/g, "").replaceAll(/[éèê]+/g, "e").toLowerCase() !== arrayStringEmail[1])
                return interaction.reply({content: "Votre nom de famille ne correspond pas à celui de l'adresse email encodé", ephemeral: true});
        }
        else
            nom = arrayStringEmail[1].charAt(0).toUpperCase() + arrayStringEmail[1].slice(1);

        
        //A partir d'ici, tout est en ordre
        console.log(`${prenom} ${nom} [${groupe}]`);
        const userInfoFromInteraction = await interaction.guild.members.cache.get(interaction.user.id);
        //console.log(userInfoFromInteraction);
        userInfoFromInteraction.setNickname(`${prenom} ${nom} [${groupe}]`);
        
        pvEmails.push(email);
        pvUserIds.push(interaction.user.id);
        let currentCode = GenerateCode(6);
        pvCodes.push(currentCode);

        fs.writeFile(`./HEPL/PendingVerification.json`, JSON.stringify({emailArray: pvEmails, userIdArray: pvUserIds, codeArray: pvCodes}), (err) => {
            if (err) throw err;

            console.log("[HEPL Register] Le fichier PendingVerification.json a été édité avec succès");
        });

        return interaction.reply({content: `Votre code est : ${currentCode}`, ephemeral: true});

        function GenerateCode(length)
        {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
            }
            return result;
        }
    }
}