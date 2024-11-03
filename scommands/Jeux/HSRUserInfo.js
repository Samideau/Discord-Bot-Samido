const { ActionRowBuilder, AttachmentBuilder, SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const createCard = require("../JeuxAux/HSRDetailedCreateCard.js");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hsruserinfo')
        .setDescription('Commande qui permet d\'afficher les infos d\'un joueur d\'Honkai Star Rail en indiquant son UID')
        .addIntegerOption(option =>
            option.setName('uid')
                .setDescription('l\'UID du joueur')
                .setRequired(true))
        .setDMPermission(true),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const uid = interaction.options.getInteger('uid');
        const embed = new EmbedBuilder();
        const select = new StringSelectMenuBuilder();

        await interaction.deferReply();

        fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=fr`, {
            method: 'GET'
        }).then(res => res.json())
            .then(async res => {
                //console.log(res);

                if(res.detail && (res.detail === 'Invalid uid' || res.detail === 'User not found')) {
                    return interaction.editReply({content: "L'UID fournis n'existe pas/n'est pas valide"}).then(async message => {
                        await wait(5_000);
                        if(interaction.guildId)
                            message.delete();
                    });
                }

                //Obtention de l'objet joueur
                const user = res.player;
                //console.log(user);
                const characters = res.characters;
                //console.log(characters);

                //Création de l'image de l'Embed
                const canvas = createCanvas(1278, 720);
                const context = canvas.getContext('2d');

                let randomBackground = Math.floor(Math.random() * 12) + 1;
                if(randomBackground < 10)
                    randomBackground = "0"+randomBackground;
                else
                    randomBackground = String(randomBackground);

                const imageBackgroundPath = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/simulated_event/RoguePicEventDLC_${randomBackground}.png`;
                const background = await loadImage(imageBackgroundPath);
                context.drawImage(background, 0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.arc(330, canvas.height/2, 100, 0, Math.PI * 2, true);
                context.closePath();
                context.clip();

                let profileImagePath = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${user.avatar.icon}`;
                context.drawImage(await loadImage(profileImagePath), 180, canvas.height/2 - 150, 300, 300);

                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'embedImage.png' });
                embed.setImage("attachment://embedImage.png");

                embed.setTitle(`${user.nickname}`).setDescription((user.signature ? user.signature : " ")).setURL(`https://enka.network/hsr/${uid}/`).setTimestamp();

                embed.addFields(
                    {name: `Niveau de Pionnier`, value: `${user.level}`, inline: true},
                    {name: `Total des succès`, value: `${user.space_info.achievement_count}`, inline: true},
                    {name: `Nombre de personnages`, value: `${user.space_info.avatar_count}`, inline: true});

                if(characters && user.is_display && characters.length > 0)
                {
                    //console.log(characters[0]);
                    embed.setColor(`${GetColor(characters[0].element.name)}`);

                    select.setCustomId('character').setPlaceholder('Afficher le détail d\'un personnage!');
                    select.addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel(`Accueil`)
                        .setValue(`accueil`));

                    let characterName = "";
                    for(let i = 0 ; i < characters.length ; i++)
                    {
                        let characterName = characters[i].name;

                        if(characterName === user.nickname)
                        {
                            if(Number(characters[i].id) % 2) //si c'est vrai, Caelus, sinon Stelle
                                characterName = "Pionnier";
                            else
                                characterName = "Pionnière";
                        }


                        embed.addFields({name: `${characterName}`, value: `${characters[i].level}`, inline: true});
                        select.addOptions(new StringSelectMenuOptionBuilder()
                            .setLabel(`${characterName}`)
                            .setValue(`${characterName.toLowerCase()}`)
                        );
                    }
                    embed.addFields({name: `\u200B`, value: `\u200B`, inline: true});

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
                        let characterName = i.values[0];
                        //console.log(i);
                        //console.log(`${i.user.username} has selected ${selection}!`);
                        if(characterName === 'accueil')
                            i.update({embeds: [embed], components: [row], files: [attachment], ephemeral: false});
                        else
                        {
                            let indexCharacter = GetCharacterIndex(characterName, characters, user.nickname);
                            //console.log(characters[indexCharacter]);
                            characterName = characters[indexCharacter].name;
                            let tlbPath = "";
                            const embedDetailedCharacter = new EmbedBuilder();

                            embedDetailedCharacter.addFields(
                                {name: `Niveau de Pionnier`, value: `${user.level}`, inline: true},
                                {name: `Total des succès`, value: `${user.space_info.achievement_count}`, inline: true},
                                {name: `Nombre de personnages`, value: `${user.space_info.avatar_count}`, inline: true});

                            if(characterName === user.nickname)
                            {
                                if(Number(characters[indexCharacter].id) % 2) //si c'est vrai, Caelus, sinon Stelle
                                    characterName = "Pionnier";
                                else
                                    characterName = "Pionnière";
                                tlbPath = characters[indexCharacter].path.name.replaceAll("L\'", "").replaceAll("La ", "");
                            }


                            embedDetailedCharacter.setTitle(`${user.nickname} - ${characterName} ${tlbPath}`).setDescription((user.signature ? user.signature : " ")).setURL(`https://enka.network/hsr/${uid}/`).setTimestamp();
                            embedDetailedCharacter.setColor(`${GetColor(characters[indexCharacter].element.name)}`);

                            const attachmentDetailed = new AttachmentBuilder(await GenerateDetailedCanvas(characters[indexCharacter]), { name: 'embedDetailedImage.png' });
                            embedDetailedCharacter.setImage("attachment://embedDetailedImage.png");

                            i.editReply({embeds: [embedDetailedCharacter], components: [row], files: [attachmentDetailed]});
                        }
                    });

                    collector.on("end", collected => {
                        //console.log(collector._endReason);
                        if(collector._endReason === "time")
                            interaction.editReply({embeds: [embed], components: [], files: [attachment]});
                        return;
                    });
                }
                else
                {
                    embed.addFields({name: `Ce joueur a masqué les infos des personnages ou n'a aucun personnage affiché`, value: `\u200B`});
                    embed.setColor(`#00ffe7`);
                    return interaction.editReply({embeds: [embed], files: [attachment]});
                }
            });

        function GetColor(element)
        {
            switch(element)
            {
                case "Glace":
                    return "#70d5fd";
                case "Quantique":
                    return "#2950ff";
                case "Physique":
                    return "#6c6c6c";
                case "Vent":
                    return "#00ff80";
                case "Feu":
                    return "#ff0000";
                case "Imaginaire":
                    return "#f7ff00";
                case "Foudre":
                    return "#dd00ff";
                default:
                    return "#000000";
            }
        }

        function GetCharacterIndex(selectorName, characterNameList, username)
        {
            if(selectorName === "pionnier" || selectorName === "pionnière")
                selectorName = username;

            for(let i = 0; i < characterNameList.length; i++)
            {
                if(selectorName.toLowerCase() === characterNameList[i].name.toLowerCase())
                    return i;
            }
        }

        async function GenerateDetailedCanvas(charaInfo)
        {
            const splash = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${charaInfo.id}.png`;

            return await createCard(charaInfo, splash);
        }
    }
}