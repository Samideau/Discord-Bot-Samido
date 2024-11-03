const Discord = require('discord.js');
const {token, clientId, typeStatus, messageStatus, urlStatus} = require('./JSON/config.json');
const wait = require('node:timers/promises').setTimeout;

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildPresences
    ]});

const mapMusique = require('./scommands/MusiqueAux/stockageMusique.js');

module.exports.client = client;

const fs = require('fs');

let isStreaming = false;

let mapOnceATimeCommand = new Map();

//Analyse de fichiers
client.sCommands = new Discord.Collection();
client.privateSCommands = new Discord.Collection();
client.onceCommandsFiles = new Discord.Collection();
client.adminCommandsFiles = new Discord.Collection();

analyseFichierCommand();

client.once('ready', () => {
    updateStatusBot(typeStatus, messageStatus, urlStatus);
    checkingMusicJsonFiles();

    /*(async () => { //await needs async
        const guild = await client.guilds.cache.get("806439021248118784");
        const user = await guild.members.fetch("269823993899384832");
        console.log(user.presence);
    })()*/

    require("./HEPL/HEPLMessageHandler.js").executeHEPLEvents(client, Discord, "");
    

    console.log('Bot Samido prêt à l\'action !');
});

let isButtonRoleErrorOnCD = [];
client.on(Discord.Events.InteractionCreate,  async interaction => {

    if(interaction.isButton()){
        //console.log(interaction.message.id);
        await interaction.deferUpdate();

        //console.log(interaction.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageRoles));
        const hasPermsToEditRoles = interaction.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageRoles);
        if(interaction.customId.includes("role-") && hasPermsToEditRoles)
        {
            const roleId = interaction.customId.replace("role-", "");
            if(interaction.member.roles.cache.has(roleId)){
                console.log(`[Role Buttons] ${interaction.user.tag} s'est retiré un role !`);
                interaction.member.roles.remove(interaction.guild.roles.cache.get(roleId));
            }
            else{
                console.log(`[Role Buttons] ${interaction.user.tag} s'est ajouté un role !`);
                interaction.member.roles.add(interaction.guild.roles.cache.get(roleId));
            }
        }
        else if(interaction.customId.includes("role-") && !hasPermsToEditRoles && !isButtonRoleErrorOnCD.includes(interaction.message.id)) //Cas où le bot n'a pas les droits
        {
            isButtonRoleErrorOnCD.push(interaction.message.id);
            let embedsButton = new Discord.EmbedBuilder()
                .setTitle(interaction.message.embeds[0].data.title)
                .setDescription("Je n'ai plus la permission pour donner/retirer des rôles ou le rôle sélectionner est plus haut dans la hiérarchie que mon rôle !")
                .setColor(interaction.message.embeds[0].data.color);
            
            const oldMessageDesc = interaction.message.embeds[0].data.description;
            //console.log(interaction.message.embeds[0].data);
            return interaction.editReply({embeds: [embedsButton]}).then(async () => {
                await wait(5_000);
                if(interaction)
                {
                    let embedsButtonOld = new Discord.EmbedBuilder()
                        .setTitle(interaction.message.embeds[0].data.title)
                        .setColor(interaction.message.embeds[0].data.color);

                    if(oldMessageDesc)
                        embedsButtonOld.setDescription(oldMessageDesc);
                    interaction.editReply({embeds: [embedsButtonOld]});
                    isButtonRoleErrorOnCD.splice(isButtonRoleErrorOnCD.indexOf(interaction.message.id), 1);
                }
            });
        }
    }
    else if (!interaction.isChatInputCommand()){/* If it isn't a command, return. */
        //console.log('Beep');
        return;
    }

    /* Getting all the setted client's commands that has been set in deploy-commands.js. */
    const botSCommand = interaction.client.sCommands.get(interaction.commandName);
    const privateBotSCommand = interaction.client.privateSCommands.get(interaction.commandName);
    const onceATimeCommand = interaction.client.onceCommandsFiles.get(interaction.commandName);
    const adminCommand = interaction.client.adminCommandsFiles.get(interaction.commandName);

    //console.log(botSCommand);
    /* If there are no commands, return. */
    if (!botSCommand && !privateBotSCommand && !onceATimeCommand && !adminCommand) {
        //console.log('boop');
        return;
    }
    //console.log('beep');

    /* Try executing the command. If this doesn't work, throw a error. */
    try {
        if(privateBotSCommand && interaction.user.id === "269823993899384832"){
            await privateBotSCommand.execute(interaction, interaction.commandName, null, client, Discord);
        }
        else if(privateBotSCommand){
            console.log(`[${interaction.user.tag}] a utilisé la commande : \'${interaction.commandName}\' sans succès !`);
            return await interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande', ephemeral: true });
        }
        else if(adminCommand){
            await adminCommand.execute(interaction, interaction.commandName, null, client, Discord);
        }
        else if(botSCommand){
            //await interaction.deferReply({ephemeral: true});
            await botSCommand.execute(interaction, interaction.commandName, null, client, Discord);
        }
        else if(onceATimeCommand && !mapOnceATimeCommand.has(interaction.commandName)){
            mapOnceATimeCommand.set(interaction.commandName, true);
            await onceATimeCommand.execute(interaction, interaction.commandName, null, client, Discord);
            setTimeout(() => {
                mapOnceATimeCommand.delete(interaction.commandName);
            }, 120000);

        }
        else if(mapOnceATimeCommand.has(interaction.commandName)){
            console.log(`[${interaction.user.tag}] a utilisé la commande : \'${interaction.commandName}\' sans succès !`);
            return await interaction.reply({ content: `La commande : ${interaction.commandName} a un temps de recharge de 2 minute(s), quelqu'un a déjà utilisée cette commande il y a moins longtemps que la durée indiquée.`, ephemeral: true });
        }

        console.log(`[${interaction.user.tag}] a utilisé la commande : \'${interaction.commandName}\' avec succès !`);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Une erreur s\'est produite en utilisante cette commande ! :c', ephemeral: true });
    }
});

function analyseFichierCommand()
{
    const musiqueSCommandFiles = fs.readdirSync('./scommands/Musique').filter(file => file.endsWith('.js')); //slash command Musique
    const funSCommandFiles = fs.readdirSync('./scommands/Fun').filter(file => file.endsWith('.js')); //slash command Fun
    const autreSCommandFiles = fs.readdirSync('./scommands/Autre').filter(file => file.endsWith('.js')); //slash command Autres
    const jeuxSCommandFiles = fs.readdirSync('./scommands/Jeux').filter(file => file.endsWith('.js')); //slash command Jeux

    const heplSCommandFiles = fs.readdirSync('./HEPL/Commands/').filter(file => file.endsWith('.js')); //slash command HEPL

    const privateSCommandFiles = fs.readdirSync('./scommands/PrivateCommands').filter(file => file.endsWith('.js')); //slash command Private
    const onceCommandsFiles = fs.readdirSync('./scommands/OnceCommands/').filter(file => file.endsWith('.js')); //slash command un à la fois
    const adminCommandsFiles = fs.readdirSync('./scommands/AdminCommands/').filter(file => file.endsWith('.js')); //slash command un à la fois

    //Pour les commandes slash Musique
    for(const file of musiqueSCommandFiles)
    {
        const command = require(`./scommands/Musique/${file}`);

        client.sCommands.set(command.data.name, command);
    }

    //Pour les commandes slash Fun
    for(const file of funSCommandFiles)
    {
        const command = require(`./scommands/Fun/${file}`);

        client.sCommands.set(command.data.name, command);
    }

    //Pour les commandes slash Autres
    for(const file of autreSCommandFiles)
    {
        const command = require(`./scommands/Autre/${file}`);

        client.sCommands.set(command.data.name, command);
    }

    //Pour les commandes slash Jeux
    for(const file of jeuxSCommandFiles)
    {
        const command = require(`./scommands/Jeux/${file}`);

        client.sCommands.set(command.data.name, command);
    }

    //Pour les commandes slash HEPL
    for(const file of heplSCommandFiles)
    {
        const command = require(`./HEPL/Commands/${file}`);

        client.sCommands.set(command.data.name, command);
    }

    //Pour les commandes slash Private
    for(const file of privateSCommandFiles)
    {
        const command = require(`./scommands/PrivateCommands/${file}`);

        client.privateSCommands.set(command.data.name, command);
    }

    //Pour les commandes slash OnceATime
    for(const file of onceCommandsFiles)
    {
        const command = require(`./scommands/OnceCommands/${file}`);

        client.onceCommandsFiles.set(command.data.name, command);
    }

    //Pour les commandes slash Admin
    for(const file of adminCommandsFiles)
    {
        const command = require(`./scommands/AdminCommands/${file}`);

        client.adminCommandsFiles.set(command.data.name, command);
    }
}

client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
    // User leaves a voice channel
    if (oldVoiceState.member.id === clientId && newVoiceState.member.id === clientId && newVoiceState.channel === null && oldVoiceState.channel !== null) {
        //Check si c'est normal ou non
        setTimeout(() => {
            const serveurDiscord = newVoiceState.guild.id;
            if(mapMusique.mapSong.get(serveurDiscord)){
                console.log(`Le bot a été déco par un admin/modo sur le discord : \"${newVoiceState.guild.name}\" (${serveurDiscord})!`);

                const autoLeaveFile = require('./scommands/AutreAux/AutoLeave.js');
                autoLeaveFile.execute('leaveAdmin', newVoiceState.guild.id, null);
            }
            else{
                console.log(`Le bot a été déco normalement sur le discord : \"${newVoiceState.guild.name}\" (${serveurDiscord})!`);
            }
        }, 2000);
        
    }
    if(oldVoiceState.channel !== null && newVoiceState.channel !== oldVoiceState.channel && oldVoiceState.channel.members.has(client.user.id) && oldVoiceState.channel.members.size === 1){
        //let oldVoiceStateTMP = oldVoiceState;
        setTimeout(() => {
            if(oldVoiceState && oldVoiceState.channel.members.has(client.user.id) && oldVoiceState.channel.members.size === 1){
                console.log(`le bot s'est déco après 20 sec à avoir été tout seul sur le discord : \"${oldVoiceState.guild.name}\" (${oldVoiceState.guild.id})!`);

                const autoLeaveFile = require('./scommands/AutreAux/AutoLeave.js');
                autoLeaveFile.execute('AutoLeave', oldVoiceState.guild.id, null);
            }
        }, 20000);
    }else if(newVoiceState.channel !== null && newVoiceState.channel !== oldVoiceState.channel && newVoiceState.channel.members.has(client.user.id) && newVoiceState.channel.members.size === 1){
        setTimeout(() => {
            if(newVoiceState && newVoiceState.channel.members.has(client.user.id) && newVoiceState.channel.members.size === 1){
                console.log(`le bot s'est déco après 20 sec à avoir été tout seul sur le discord : \"${oldVoiceState.guild.name}\" (${oldVoiceState.guild.id})!`);

                const autoLeaveFile = require('./scommands/AutreAux/AutoLeave.js');
                autoLeaveFile.execute('AutoLeave', oldVoiceState.guild.id, null);
            }
        }, 20000);
    }
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
    if (!newPresence.activities) return;
    if (newPresence.user.id !== "269823993899384832" || newPresence.guild.id !== "806439021248118784") return;
    //console.log(newPresence.activities.length);
    if (newPresence.activities.length === 0) {
        if(isStreaming === true){
            console.log("Fin du live Twitch, arrêt du bot");
            isStreaming = false;
            require("./scommands/PrivateCommands/stopTwitchBot.js").execute(null, "stop", "samideau", client, Discord);
            updateStatusBot(typeStatus, messageStatus, urlStatus);
        }
        return;
    }

    for(const activity of newPresence.activities){
        //console.log(activity.name);
        if (activity.name === "Twitch" && !isStreaming) {
            isStreaming = true;

            let guildChannels = newPresence.guild.channels;
            require("./scommands/PrivateCommands/startTwitchBot.js").execute(null, "start", guildChannels.cache.get('1105819422469390406'), client, Discord);
            updateStatusBot("2", "Mon maître est en train de streamer sur Twitch !", "https://www.twitch.tv/Samideau");

            console.log(`${newPresence.user.tag} is streaming at ${activity.url}.`);
        }
    }

    if(!newPresence.activities.some(activity => activity.name === "Twitch") && isStreaming === true){
        console.log("Fin du live Twitch, arrêt du bot");
        isStreaming = false;
        require("./scommands/PrivateCommands/stopTwitchBot.js").execute(null, "stop", "samideau", client, Discord);
        updateStatusBot(typeStatus, messageStatus, urlStatus);
    }
});

function updateStatusBot(typeStatus, messageStatus, urlStatus) {
    switch (typeStatus){
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

function checkingMusicJsonFiles(){
    const Guilds = client.guilds.cache.map(guild => guild.id);

    //console.log(Guilds);

    for(let i = 0; i < Guilds.length; i++){
        mapMusique.execute(`${Guilds[i]}`, false);
    }
}

client.login(token);
