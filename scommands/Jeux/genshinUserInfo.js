const { ActionRowBuilder, AttachmentBuilder, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType} = require('discord.js');
const { EnkaNetwork } = require("enkanetwork");
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const genshindb = require('genshin-db');
const createCard = require("../JeuxAux/GiDetailedCreateCard.js");
const { fetchSplashData } = require("../JeuxAux/GiDetailedCardFunction.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giuserinfo')
        .setDescription('Commande qui permet d\'afficher les infos d\'un joueur de genshin impact en indiquant son UID')
        .addIntegerOption(option =>
            option.setName('uid')
                .setDescription('l\'UID du joueur')
                .setRequired(true))
        .setDMPermission(true),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const enka = new EnkaNetwork({ language: "FR"});
        const uid = interaction.options.getInteger('uid');
        const embed = new EmbedBuilder();
        const select = new StringSelectMenuBuilder();

        await interaction.deferReply();

        enka.setLanguage("FR").fetchUser(uid).catch(e => {
            console.log("[genshinUserInfo]" + e);
        }).then(async user => {
            if(!user){
                return interaction.editReply({content: "L'UID fournis n'existe pas/n'est pas valide"}).then(async message => {
                    await wait(10_000);
                    if(interaction.guildId)
                        message.delete();
                });
            }

            //Obtention des différentes variables
            const userInfo = user.player;
            //console.log(userInfo);
            const charaInfo = user.characters;
            //console.log(charaInfo);

            //Création de l'image de l'Embed
            const canvas = createCanvas(1278, 720);
            const context = canvas.getContext('2d');

            const imageBackgroundPath = userInfo.nameCard.banner;
            const background = await loadImage(imageBackgroundPath);
            context.drawImage(background, 0, 0, canvas.width, canvas.height);

            context.beginPath();
            context.arc(330, canvas.height/2, 100, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            let profileImagePath = "";
            if(userInfo.profilePicture)
            {
                profileImagePath = userInfo.profilePicture.icon;
                context.drawImage(await loadImage(profileImagePath), 180, canvas.height/2 - 150, 300, 300);
            }
            else
            {
                profileImagePath = userInfo.charactersPreview[0].icon;
                context.drawImage(await loadImage(profileImagePath), 180, canvas.height/2 - 150, 300, 300);
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'embedImage.png' });
            embed.setImage("attachment://embedImage.png");

            embed.setTitle(`${userInfo.nickname}`).setDescription((userInfo.signature ? userInfo.signature : " ")).setURL(`https://enka.network/u/${uid}/`).setTimestamp()
                .setAuthor({ name: `${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)}`, iconURL: `${interaction.user.displayAvatarURL()}`, url: `https://akasha.cv/profile/${uid}` });

            embed.addFields(
                {name: `Niveau d'Aventure`, value: `${userInfo.level}`, inline: true},
                {name: `Total des succès`, value: `${userInfo.achievements}`, inline: true});
            if(userInfo.abyssFloor && userInfo.abyssLevel)
                embed.addFields({name: `Profondeurs spiralées`, value: `${userInfo.abyssFloor}-${userInfo.abyssLevel}`, inline: true});

            if(userInfo.charactersPreview.length > 0)
            {
                let infoCharacter = genshindb.characters(userInfo.charactersPreview[0].name, {queryLanguages: ["French", "English"], resultLanguage: "English"});
                if(infoCharacter)
                    embed.setColor(`${GetColor(infoCharacter.elementText)}`);
                else
                    embed.setColor(`#ffa400`);

                select.setCustomId('character').setPlaceholder('Afficher le détail d\'un personnage!');
                select.addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel(`Accueil`)
                    .setValue(`accueil`));
                for(let i = 0 ; i < userInfo.charactersPreview.length ; i++)
                {
                    embed.addFields({name: `${userInfo.charactersPreview[i].name}`, value: `${userInfo.charactersPreview[i].level}`, inline: true});
                    select.addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel(`${userInfo.charactersPreview[i].name}`)
                        .setValue(`${userInfo.charactersPreview[i].name.toLowerCase()}`)
                    );
                }
                embed.addFields({name: `\u200B`, value: `\u200B`, inline: true});

                if(Array.isArray(charaInfo) && charaInfo.length)
                {
                    const row = new ActionRowBuilder().addComponents(select);

                    const response = await interaction.editReply({embeds: [embed], components: [row], files: [attachment]});

                    //Uniquement celui qui a tapé la commande peut changer la chose
                    const collectorFilter = i => {
                        if(i.values[0] !== "accueil")
                            i.deferUpdate();
                        return i.user.id === interaction.user.id;
                    };

                    const collector = await response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: collectorFilter, time: 600_000, errors: ['time']});

                    collector.on('collect', async i => {
                        const characterName = i.values[0];
                        //console.log(i);
                        //console.log(`${i.user.username} has selected ${selection}!`);
                        if(characterName === 'accueil')
                            i.update({content: "\u200B", embeds: [embed], components: [row], files: [attachment], ephemeral: false});
                        else
                        {
                            let indexCharacter = GetCharacterIndex(characterName, charaInfo)
                            let travelerElem = "";
                            const embedDetailedCharacter = new EmbedBuilder();

                            embedDetailedCharacter.addFields(
                                {name: `Niveau d'Aventure`, value: `${userInfo.level}`, inline: true},
                                {name: `Total des succès`, value: `${userInfo.achievements}`, inline: true});
                            if(userInfo.abyssFloor && userInfo.abyssLevel)
                                embedDetailedCharacter.addFields({name: `Profondeurs spiralées`, value: `${userInfo.abyssFloor}-${userInfo.abyssLevel}`, inline: true});

                            if(charaInfo[indexCharacter].name === "Voyageur")
                                travelerElem = charaInfo[indexCharacter].element;

                            embedDetailedCharacter.setTitle(`${userInfo.nickname} - ${charaInfo[indexCharacter].name} ${travelerElem}`).setDescription((userInfo.signature ? userInfo.signature : " ")).setURL(`https://enka.network/u/${uid}/`).setTimestamp();
                            embedDetailedCharacter.setColor(`${GetColor(charaInfo[indexCharacter].element)}`).setAuthor({ name: `${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)}`, iconURL: `${interaction.user.displayAvatarURL()}`, url: `https://akasha.cv/profile/${uid}` });

                            let generatedCanvas = await GenerateDetailedCanvas(indexCharacter, charaInfo);

                            if(generatedCanvas) {
                                const attachmentDetailed = new AttachmentBuilder(generatedCanvas, { name: 'embedDetailedImage.png' });
                                embedDetailedCharacter.setImage("attachment://embedDetailedImage.png");

                                i.editReply({content: "\u200B", embeds: [embedDetailedCharacter], components: [row], files: [attachmentDetailed]});
                            }
                            else{
                                await wait(1_000);
                                i.editReply({content: "Le personnage que vous essayez d'afficher n'est pas encore disponible, veuillez réessayer plus tard", embeds: [embed], components: [row], files: [attachment], ephemeral: false});
                            }
                        }
                    });

                    collector.on("end", collected => {
                        //console.log(collector._endReason);
                        if(collector._endReason === "time")
                            interaction.editReply({content: "\u200B", embeds: [embed], components: [], files: [attachment]});
                        return;
                    });
                }
                else
                {
                    embed.addFields({name: `Ce joueur a masqué les infos de ses personnages`, value: `\u200B`});
                    return interaction.editReply({embeds: [embed], files: [attachment]});
                }
            }
            else{
                embed.addFields({name: `Ce joueur n'a affiché aucun de ses personnages`, value: `\u200B`});
                return interaction.editReply({embeds: [embed], files: [attachment]});
            }


        });

        function GetColor(element)
        {
            switch(element)
            {
                case "Cryo":
                    return "#70d5fd";
                case "Hydro":
                    return "#002aff";
                case "Dendro":
                    return "#48ff00";
                case "Anemo":
                    return "#00ff80";
                case "Pyro":
                    return "#ff0000";
                case "Geo":
                    return "#f7ff00";
                case "Electro":
                    return "#dd00ff";
                default:
                    return "#000000";
            }
        }

        function GetCharacterIndex(selectorName, enkaNameList)
        {
            for(let i = 0; i < enkaNameList.length; i++)
            {
                if(selectorName.toLowerCase() === enkaNameList[i].name.toLowerCase())
                    return i;
            }
        }

        async function GenerateDetailedCanvas(characterIndex, charaInfo)
        {
            const getSplash = await fetchSplashData();
            //console.log(charaInfo[characterIndex].id);

            if(getSplash[charaInfo[characterIndex].id]) {
                const splash =
                    getSplash[charaInfo[characterIndex].id].gachaIcon;
                let gacha = `https://enka.network/ui/${splash}.png`;

                if (this.splash) {
                    gacha = this.splash;
                } else {
                    gacha = `https://enka.network/ui/${splash}.png`;
                }

                return await createCard(charaInfo[characterIndex], gacha);
            }
            else{
                return null;
            }
        }
    }
}