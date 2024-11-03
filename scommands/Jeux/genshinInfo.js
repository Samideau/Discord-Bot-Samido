const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const genshindb = require('genshin-db');
const wait = require('node:timers/promises').setTimeout;
const { createCanvasCharacter, createCanvasTalentCharacter } = require("../JeuxAux/GiInfoCreateCardFunctions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giinfo')
        .setDescription('Commande qui permet d\'afficher des infos sur Genshin Impact')
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Catégorie de la recherche')
                .addChoices(
                    { name: 'Infos Personnages', value: 'pj' },
                    { name: 'Aptitudes', value: 'talents' },
                    { name: 'Constellations', value: 'constellations' },
                    { name: 'Armes', value: 'armes' },
                    { name: 'Artéfacts', value: 'artefacts' },
                    { name: 'Nourritures', value: 'nourritures' },
                    { name: 'Domaines', value: 'domaines' },
                    { name: 'Ennemis', value: 'ennemis' },
                    { name: 'Planneurs', value: 'planneurs' },
                    { name: 'Animaux', value: 'animaux' },
                    { name: 'Matériels', value: 'materiels' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('recherche')
                .setDescription('la recherche a effectuer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option')
                .setDescription('permet de faire une recherche plus precise')
                .setRequired(false))
        .setDMPermission(true),

    async execute(interaction, commandName, autreArgs, client, Discord) {

        const recherche = interaction.options.getString('recherche');
        const categorie = interaction.options.getString('categorie');
        const option = interaction.options.getString('option');

        let materialMap = new Map();
        let monsterArray = [];
        let descriptionMap = new Map();
        let descriptionTotal = [];
        let textValue = "";

        const embed = new EmbedBuilder();

        switch (categorie) {
            case 'pj':
                charactersInfo(recherche, option);
                break;
            case 'talents':
                talentsInfo(recherche, option);
                break;
            case 'constellations':
                constellationsInfo(recherche, option);
                break;
            case 'armes':
                armesInfo(recherche, option);
                break;
            case 'artefacts':
                artefactesInfo(recherche, option);
                break;
            case 'nourritures':
                nourrituresInfo(recherche, option);
                break;
            case 'domaines':
                domainesInfo(recherche, option);
                break;
            case 'ennemis':
                ennemisInfo(recherche, option);
                break;
            case 'planneurs':
                planneursInfo(recherche, option);
                break;
            case 'animaux':
                animauxInfo(recherche, option);
                break;
            case 'materiels':
                materielsInfo(recherche, option);
                break;
            default:
                console.log("[GIINFO] Erreur dans le choix d'une catégorie");
                interaction.reply("Une erreur est survenue dans le choix de la catégorie");
                return;
        }

        async function charactersInfo(nom, option)
        {
            //console.log(nom);
            await interaction.deferReply();

            let info = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info){
                let infoEN = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "English"});
                let infoENStatsLvl1 = infoEN.stats(1);
                let infoENStatsLvl90 = infoEN.stats(90);
                //console.log(infoEN);
                /*console.log(infoENStatsLvl1);
                console.log(infoENStatsLvl90);*/

                embed.setTitle(`${info.name} - ${info.title}`).setDescription(info.description).setURL((info.url ? info.url.fandom : info.images.cover1)).setFooter({text: `Sorti(e) en version ${info.version}`});
                embed.addFields(
                    { name: `Type d'arme`, value: `${info.weaponText}`, inline: true},
                    { name: `Rareté`, value: `${info.rarity} étoiles`, inline: true},
                    { name: `Élément`, value: `${info.elementText}`, inline: true},
                    { name: `Anniversaire`, value: `${(info.birthday !== '' ? info.birthday : "Date inconnue")}`, inline: true},
                    { name: `Région`, value: `${(info.region !== '' ? info.region : "Inconnue")}`, inline: true},
                    { name: `Constellation`, value: `${(info.constellation !== '' ? info.constellation : "Inconnue")}`, inline: true},
                );
                embed.setColor(`${getColor(info.elementText)}`)/*.setImage((info.images.cover1 ? info.images.cover1 : info.images.mihoyo_icon))*/;

                const attachment = new AttachmentBuilder(await createCanvasCharacter(info, infoEN, infoENStatsLvl1, infoENStatsLvl90), { name: 'embedImage.png' });
                embed.setImage("attachment://embedImage.png");

                if(option){
                    let infoMaterial = info.costs;
                    //console.log(infoMaterial);
                    //console.log(Object.values(infoMaterial)[i]);
                    switch (option.toLowerCase())
                    {
                        case "20":
                            for(let j = 0; j < Object.values(infoMaterial)[0].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[0][j].name))
                                    materialMap.set(Object.values(infoMaterial)[0][j].name, materialMap.get(Object.values(infoMaterial)[0][j].name) + Object.values(infoMaterial)[0][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[0][j].name, Object.values(infoMaterial)[0][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "40":
                            for(let j = 0; j < Object.values(infoMaterial)[1].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[1][j].name))
                                    materialMap.set(Object.values(infoMaterial)[1][j].name, materialMap.get(Object.values(infoMaterial)[1][j].name) + Object.values(infoMaterial)[1][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[1][j].name, Object.values(infoMaterial)[1][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "50":
                            for(let j = 0; j < Object.values(infoMaterial)[2].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[2][j].name))
                                    materialMap.set(Object.values(infoMaterial)[2][j].name, materialMap.get(Object.values(infoMaterial)[2][j].name) + Object.values(infoMaterial)[2][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[2][j].name, Object.values(infoMaterial)[2][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "60":
                            for(let j = 0; j < Object.values(infoMaterial)[3].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[3][j].name))
                                    materialMap.set(Object.values(infoMaterial)[3][j].name, materialMap.get(Object.values(infoMaterial)[3][j].name) + Object.values(infoMaterial)[3][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[3][j].name, Object.values(infoMaterial)[3][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "70":
                            for(let j = 0; j < Object.values(infoMaterial)[4].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[4][j].name))
                                    materialMap.set(Object.values(infoMaterial)[4][j].name, materialMap.get(Object.values(infoMaterial)[4][j].name) + Object.values(infoMaterial)[4][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[4][j].name, Object.values(infoMaterial)[4][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "80":
                            for(let j = 0; j < Object.values(infoMaterial)[5].length; j++)
                            {
                                if(materialMap.has(Object.values(infoMaterial)[5][j].name))
                                    materialMap.set(Object.values(infoMaterial)[5][j].name, materialMap.get(Object.values(infoMaterial)[5][j].name) + Object.values(infoMaterial)[5][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[5][j].name, Object.values(infoMaterial)[5][j].count);
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                            break;
                        case "total":
                            for(let i = 0; i < Object.values(infoMaterial).length; i++)
                            {
                                for(let j = 0; j < Object.values(infoMaterial)[i].length; j++)
                                {
                                    if(materialMap.has(Object.values(infoMaterial)[i][j].name))
                                        materialMap.set(Object.values(infoMaterial)[i][j].name, materialMap.get(Object.values(infoMaterial)[i][j].name) + Object.values(infoMaterial)[i][j].count);
                                    else
                                        materialMap.set(Object.values(infoMaterial)[i][j].name, Object.values(infoMaterial)[i][j].count);
                                }
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: "Total de ressources pour tous les niveaux d'élévation", value: textValue});
                            break;
                        default:
                            if(option.includes("->"))
                            {
                                let levels = option.split("->");
                                if(levels.length === 2)
                                {
                                    if(isNumeric(levels[0]) && isNumeric(levels[1]))
                                    {
                                        let levelA = parseInt(levels[0], 10);
                                        let levelB = parseInt(levels[1], 10);
                                        if((levelA === 20 || levelA === 40 || levelA === 50 || levelA === 60 || levelA === 70 || levelA === 80) && (levelB === 20 || levelB === 40 || levelB === 50 || levelB === 60 || levelB === 70 || levelB === 80) && levelA <= levelB)
                                        {
                                            let start = (levelA === 20 ? 0 : (levelA === 40 ? 1 : (levelA === 50 ? 2 : (levelA === 60 ? 3 : (levelA === 70 ? 4 : 5)))));
                                            let end = (levelB === 20 ? 0 : (levelB === 40 ? 1 : (levelB === 50 ? 2 : (levelB === 60 ? 3 : (levelB === 70 ? 4 : 5)))));
                                            while(start <= end)
                                            {
                                                for(let j = 0; j < Object.values(infoMaterial)[start].length; j++)
                                                {
                                                    if(materialMap.has(Object.values(infoMaterial)[start][j].name))
                                                        materialMap.set(Object.values(infoMaterial)[start][j].name, materialMap.get(Object.values(infoMaterial)[start][j].name) + Object.values(infoMaterial)[start][j].count);
                                                    else
                                                        materialMap.set(Object.values(infoMaterial)[start][j].name, Object.values(infoMaterial)[start][j].count);
                                                }
                                                start++;
                                            }

                                            for(const [key, value] of materialMap)
                                            {
                                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                            }

                                            embed.addFields({ name: `Total de ressources du niveau ${levelA} au niveau ${levelB}`, value: textValue});
                                            return interaction.editReply({embeds: [embed], files: [attachment]});
                                        }
                                    }
                                }
                            }
                            return interaction.editReply({content: "L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                    "\"20\" = coût d'ascension du personnage pour le niveau 20\n" +
                                    "\"40\" = coût d'ascension du personnage pour le niveau 40\n" +
                                    "\"50\" = coût d'ascension du personnage pour le niveau 50\n" +
                                    "\"60\" = coût d'ascension du personnage pour le niveau 60\n" +
                                    "\"70\" = coût d'ascension du personnage pour le niveau 70\n" +
                                    "\"80\" = coût d'ascension du personnage pour le niveau 80\n" +
                                    "\"total\" = coûts total de toutes les ascensions du personnage\n" +
                                    "\"lvlA->lvlB\" = Permet d'afficher le cout total à partir du niveau A (inclus) jusqu'au niveau B (inclus) [exemple : 20->50]"}).then(async message => {
                                await wait(20_000);
                                if(interaction.guildId)
                                    message.delete();
                            });
                    }
                }

                return interaction.editReply({embeds: [embed], files: [attachment]});
            }
            else
                return interaction.editReply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c"}).then(async message => {
                    await wait(5_000);
                    if(interaction.guildId)
                        message.delete();
                });
        }
        async function talentsInfo(nom, option)
        {
            let infoCharacter = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            if(!infoCharacter)
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});

            await interaction.deferReply();
            let infoEN = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "English"});
            let info = {};
            if(option)
            {
                switch(option.toLowerCase())
                {
                    case "combat1":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).combat1;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        descriptionTotal = info.description.split("\n\n");

                        for(let i = 0; i < descriptionTotal.length; i++)
                        {
                            textValue = descriptionTotal[i].split(/\n(.*)/s);
                            embed.addFields({ name: textValue[0], value: textValue[1]});
                        }
                        break;
                    case "combat2":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).combat2;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `${info.flavorText}\nSorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        break;
                    case "combat3":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).combat3;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `${info.flavorText}\nSorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        break;
                    case "passif1":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).passive1;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        break;
                    case "passif2":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).passive2;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        break;
                    case "passif3":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).passive3;
                        embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        break;
                    case "special":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).combatsp;
                        if(info){
                            embed.setTitle(`${infoCharacter.name} - ${info.name}`).setDescription(info.description).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                            embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                            break;
                        }
                        return interaction.editReply({content: "Ce personnage ne possède pas une mécanique spéciale !"}).then(async message => {
                            await wait(5_000);
                            if(interaction.guildId)
                                message.delete();
                        });
                    case "cout":
                        info = genshindb.talents(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).costs;
                        embed.setTitle(`${infoCharacter.name} - Coûts en matériaux d'aptitude`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);
                        for(let i = 0; i < Object.values(info).length; i++)
                        {
                            textValue = "";
                            //console.log(Object.values(info)[i]);
                            for(let j = 0; j < Object.values(info)[i].length; j++)
                            {
                                if(materialMap.has(Object.values(info)[i][j].name))
                                    materialMap.set(Object.values(info)[i][j].name, materialMap.get(Object.values(info)[i][j].name) + Object.values(info)[i][j].count);
                                else
                                    materialMap.set(Object.values(info)[i][j].name, Object.values(info)[i][j].count);

                                textValue += `${Object.values(info)[i][j].name} : ${Object.values(info)[i][j].count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: `Niveau ${i+2}`, value: textValue});
                        }

                        for(const [key, value] of materialMap)
                        {
                            textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                        }

                        embed.addFields({ name: "Total", value: textValue});
                        return interaction.editReply({embeds: [embed]});
                    default:
                        return interaction.editReply({content: "L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                "\"combat1\" = Attaque normal et chargée\n" +
                                "\"combat2\" = Compétence élémentaire\n" +
                                "\"combat3\" = Déchainement élémentaire\n" +
                                "\"passif1\" = Le premier passif du personnage\n" +
                                "\"passif2\" = Le second passif du personnage\n" +
                                "\"passif3\" = Le troisième passif du personnage\n" +
                                "\"special\" = une mécanique spéciale du personnage (attention, tous les persos n'en possèdent pas une)\n" +
                                "\"cout\" = coûts de montée de niveau des aptitudes"}).then(async message => {
                            await wait(20_000);
                            if(interaction.guildId)
                                message.delete();
                        });
                }
            }
            else{
                return interaction.editReply({content: "Vous devez indiquer une option pour l'utilisation de cette commande. Voici les différentes options :\n" +
                        "\"combat1\" = Attaque normal et chargée\n" +
                        "\"combat2\" = Compétence élémentaire\n" +
                        "\"combat3\" = Déchainement élémentaire\n" +
                        "\"passif1\" = Le premier passif du personnage\n" +
                        "\"passif2\" = Le second passif du personnage\n" +
                        "\"passif3\" = Le troisième passif du personnage\n" +
                        "\"special\" = une mécanique spéciale du personnage (attention, tous les persos n'en possèdent pas une)\n" +
                        "\"cout\" = coûts de montée de niveau des aptitudes", ephemeral: true});
            }

            const attachment = new AttachmentBuilder(await createCanvasTalentCharacter(infoCharacter, infoEN, info), { name: 'embedImage.png' });
            embed.setImage("attachment://embedImage.png");

            //console.log(info);
            return interaction.editReply({embeds: [embed], files: [attachment]});
            //return interaction.editReply({embeds: [embed]});
        }
        function constellationsInfo(nom, option)
        {
            let info = {};
            let infoCharacter = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});

            if(!infoCharacter)
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});

            embed.setColor(`${getColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);

            if(option)
            {
                switch (option.toLowerCase())
                {
                    case "c1":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c1;
                        embed.setTitle(`${infoCharacter.name} - C1`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "c2":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c2;
                        embed.setTitle(`${infoCharacter.name} - C2`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "c3":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c3;
                        embed.setTitle(`${infoCharacter.name} - C3`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "c4":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c4;
                        embed.setTitle(`${infoCharacter.name} - C4`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "c5":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c5;
                        embed.setTitle(`${infoCharacter.name} - C5`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "c6":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c6;
                        embed.setTitle(`${infoCharacter.name} - C6`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    default:
                        return interaction.reply({content: "L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                "\"c1\" = La première constellation\n" +
                                "\"c2\" = La seconde constellation\n" +
                                "\"c3\" = La troisième constellation\n" +
                                "\"c4\" = La quatrième constellation\n" +
                                "\"c5\" = La cinquième constellation\n" +
                                "\"c6\" = La sixième constellation", ephemeral: true});
                }
            }
            else
            {
                info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
                embed.setTitle(`${infoCharacter.name} - Constellations`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                embed.addFields(
                    {name: "C1 -" + info.c1.name, value: info.c1.description},
                    {name: "C2 -" + info.c2.name, value: info.c2.description},
                    {name: "C3 -" + info.c3.name, value: info.c3.description},
                    {name: "C4 -" + info.c4.name, value: info.c4.description},
                    {name: "C5 -" + info.c5.name, value: info.c5.description},
                    {name: "C6 -" + info.c6.name, value: info.c6.description}
                );
                //console.log(info);
            }

            return interaction.reply({embeds: [embed]});
        }
        function armesInfo(nom, option)
        {
            let info = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info){
                let infoStatsMin = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).stats(1);
                let infoStatsMax = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).stats(90);
                //console.log(infoStatsMin);
                //console.log(infoStatsMax);
                embed.setTitle(`${info.name}`).setDescription(info.description).setURL((info.url ? info.url.fandom : info.images.mihoyo_awakenIcon)).setFooter({text: `Sorti(e) en version ${info.version}`});

                let isPercent = "";
                let maxLevel = 90;
                let subStatMin = "";
                let subStatMax = "";
                let subStatType = "Aucune Substat";
                if(infoStatsMin.specialized !== 0)
                {
                    subStatMin = infoStatsMin.specialized;
                    subStatMax = infoStatsMax.specialized;
                    subStatType = info.mainStatText;
                    if(info.mainStatType !== "FIGHT_PROP_ELEMENT_MASTERY")
                    {
                        subStatMin = Number(subStatMin * 100).toFixed(1);
                        subStatMax = Number(subStatMax * 100).toFixed(1);
                        isPercent = "%";
                    }

                    embed.addFields(
                        { name: `Type d'arme`, value: `${info.weaponText}`, inline: true},
                        { name: `Rareté`, value: `${info.rarity} étoiles`, inline: true},
                        { name: `Stat Principale`, value: `${subStatType}`, inline: true},
                        { name: `Level 1`, value: `${Number(infoStatsMin.attack).toFixed(0)} ATQ\n${subStatMin}${isPercent} ${subStatType}`, inline: true},
                        { name: `Level ${maxLevel}`, value: `${Number(infoStatsMax.attack).toFixed(0)} ATQ\n${subStatMax}${isPercent} ${subStatType}`, inline: true},
                        { name: `${info.effectName}`, value: `${info.r1.description}`},
                        { name: `Bonus Raffinement`, value: `${info.r1.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r2.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r3.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r4.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r5.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}`}
                    );
                }
                else
                {
                    maxLevel = 60;
                    infoStatsMax = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).stats(60);

                    embed.addFields(
                        { name: `Type d'arme`, value: `${info.weaponText}`, inline: true},
                        { name: `Rareté`, value: `${info.rarity} étoile(s)`, inline: true},
                        { name: '\n', value: '\n' },
                        { name: `Level 1`, value: `${Number(infoStatsMin.attack).toFixed(0)} ATQ`, inline: true},
                        { name: `Level ${maxLevel}`, value: `${Number(infoStatsMax.attack).toFixed(0)} ATQ`, inline: true}
                    );
                }

                embed.setColor(`${(info.rarity === 5 ? "#FFD700" : (info.rarity === 4 ? "#8800C7" : "#1AA7EC"))}`).setImage(info.images.mihoyo_icon);
                if(option){
                    let infoMaterial = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).costs;
                    //console.log(Object.values(infoMaterial)[0]);
                    switch (option.toLowerCase()) {
                        case "20":
                            for (let j = 0; j < Object.values(infoMaterial)[0].length; j++) {
                                if (materialMap.has(Object.values(infoMaterial)[0][j].name))
                                    materialMap.set(Object.values(infoMaterial)[0][j].name, materialMap.get(Object.values(infoMaterial)[0][j].name) + Object.values(infoMaterial)[0][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[0][j].name, Object.values(infoMaterial)[0][j].count);
                            }

                            for (const [key, value] of materialMap) {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({
                                name: `Les ressources d'élévation pour le niveau ${option}`,
                                value: textValue
                            });
                            break;
                        case "40":
                            for (let j = 0; j < Object.values(infoMaterial)[1].length; j++) {
                                if (materialMap.has(Object.values(infoMaterial)[1][j].name))
                                    materialMap.set(Object.values(infoMaterial)[1][j].name, materialMap.get(Object.values(infoMaterial)[1][j].name) + Object.values(infoMaterial)[1][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[1][j].name, Object.values(infoMaterial)[1][j].count);
                            }

                            for (const [key, value] of materialMap) {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({
                                name: `Les ressources d'élévation pour le niveau ${option}`,
                                value: textValue
                            });
                            break;
                        case "50":
                            for (let j = 0; j < Object.values(infoMaterial)[2].length; j++) {
                                if (materialMap.has(Object.values(infoMaterial)[2][j].name))
                                    materialMap.set(Object.values(infoMaterial)[2][j].name, materialMap.get(Object.values(infoMaterial)[2][j].name) + Object.values(infoMaterial)[2][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[2][j].name, Object.values(infoMaterial)[2][j].count);
                            }

                            for (const [key, value] of materialMap) {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({
                                name: `Les ressources d'élévation pour le niveau ${option}`,
                                value: textValue
                            });
                            break;
                        case "60":
                            for (let j = 0; j < Object.values(infoMaterial)[3].length; j++) {
                                if (materialMap.has(Object.values(infoMaterial)[3][j].name))
                                    materialMap.set(Object.values(infoMaterial)[3][j].name, materialMap.get(Object.values(infoMaterial)[3][j].name) + Object.values(infoMaterial)[3][j].count);
                                else
                                    materialMap.set(Object.values(infoMaterial)[3][j].name, Object.values(infoMaterial)[3][j].count);
                            }

                            for (const [key, value] of materialMap) {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({
                                name: `Les ressources d'élévation pour le niveau ${option}`,
                                value: textValue
                            });
                            break;
                        case "70":
                            if (maxLevel === 90){
                                for (let j = 0; j < Object.values(infoMaterial)[4].length; j++) {
                                    if (materialMap.has(Object.values(infoMaterial)[4][j].name))
                                        materialMap.set(Object.values(infoMaterial)[4][j].name, materialMap.get(Object.values(infoMaterial)[4][j].name) + Object.values(infoMaterial)[4][j].count);
                                    else
                                        materialMap.set(Object.values(infoMaterial)[4][j].name, Object.values(infoMaterial)[4][j].count);
                                }

                                for (const [key, value] of materialMap) {
                                    textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                }

                                embed.addFields({
                                    name: `Les ressources d'élévation pour le niveau ${option}`,
                                    value: textValue
                                });
                                break;
                            }
                            return interaction.reply({content: "Le niveau maximale de cette arme est 60, veuillez réessayer", ephemeral: true});
                        case "80":
                            if (maxLevel === 90){
                                for(let j = 0; j < Object.values(infoMaterial)[5].length; j++)
                                {
                                    if(materialMap.has(Object.values(infoMaterial)[5][j].name))
                                        materialMap.set(Object.values(infoMaterial)[5][j].name, materialMap.get(Object.values(infoMaterial)[5][j].name) + Object.values(infoMaterial)[5][j].count);
                                    else
                                        materialMap.set(Object.values(infoMaterial)[5][j].name, Object.values(infoMaterial)[5][j].count);
                                }

                                for(const [key, value] of materialMap)
                                {
                                    textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                }

                                embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                break;
                            }
                            return interaction.reply({content: "Le niveau maximale de cette arme est 60, veuillez réessayer", ephemeral: true});
                        case "total":
                            for(let i = 0; i < Object.values(infoMaterial).length; i++)
                            {
                                for(let j = 0; j < Object.values(infoMaterial)[i].length; j++)
                                {
                                    if(materialMap.has(Object.values(infoMaterial)[i][j].name))
                                        materialMap.set(Object.values(infoMaterial)[i][j].name, materialMap.get(Object.values(infoMaterial)[i][j].name) + Object.values(infoMaterial)[i][j].count);
                                    else
                                        materialMap.set(Object.values(infoMaterial)[i][j].name, Object.values(infoMaterial)[i][j].count);
                                }
                            }

                            for(const [key, value] of materialMap)
                            {
                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                            }

                            embed.addFields({ name: "Total de ressources pour tous les niveaux d'élévation", value: textValue});
                            break;
                        default:
                            if(option.includes("->"))
                            {
                                let levels = option.split("->");
                                if(levels.length === 2)
                                {
                                    if(isNumeric(levels[0]) && isNumeric(levels[1]))
                                    {
                                        let levelA = parseInt(levels[0], 10);
                                        let levelB = parseInt(levels[1], 10);

                                        if(maxLevel === 60 && (levelA > 60 || levelB > 60))
                                            return interaction.reply({content: "Le niveau maximale de cette arme est 60, veuillez réessayer", ephemeral: true});

                                        if((levelA === 20 || levelA === 40 || levelA === 50 || levelA === 60 || levelA === 70 || levelA === 80) && (levelB === 20 || levelB === 40 || levelB === 50 || levelB === 60 || levelB === 70 || levelB === 80) && levelA <= levelB)
                                        {
                                            let start = (levelA === 20 ? 0 : (levelA === 40 ? 1 : (levelA === 50 ? 2 : (levelA === 60 ? 3 : (levelA === 70 ? 4 : 5)))));
                                            let end = (levelB === 20 ? 0 : (levelB === 40 ? 1 : (levelB === 50 ? 2 : (levelB === 60 ? 3 : (levelB === 70 ? 4 : 5)))));
                                            while(start <= end)
                                            {
                                                for(let j = 0; j < Object.values(infoMaterial)[start].length; j++)
                                                {
                                                    if(materialMap.has(Object.values(infoMaterial)[start][j].name))
                                                        materialMap.set(Object.values(infoMaterial)[start][j].name, materialMap.get(Object.values(infoMaterial)[start][j].name) + Object.values(infoMaterial)[start][j].count);
                                                    else
                                                        materialMap.set(Object.values(infoMaterial)[start][j].name, Object.values(infoMaterial)[start][j].count);
                                                }
                                                start++;
                                            }

                                            for(const [key, value] of materialMap)
                                            {
                                                textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                            }

                                            embed.addFields({ name: `Total de ressources du niveau ${levelA} au niveau ${levelB}`, value: textValue});
                                            return interaction.reply({embeds: [embed]});
                                        }
                                    }
                                }
                            }
                            return interaction.reply({content: "L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                    "\"20\" = coût d'ascension de l'arme pour le niveau 20\n" +
                                    "\"40\" = coût d'ascension de l'arme pour le niveau 40\n" +
                                    "\"50\" = coût d'ascension de l'arme pour le niveau 50\n" +
                                    "\"60\" = coût d'ascension de l'arme pour le niveau 60\n" +
                                    "\"70\" = coût d'ascension de l'arme pour le niveau 70\n" +
                                    "\"80\" = coût d'ascension de l'arme pour le niveau 80\n" +
                                    "\"total\" = coûts total de toutes les ascensions de l'arme\n" +
                                    "\"lvlA->lvlB\" = Permet d'afficher le cout total à partir du niveau A (inclus) jusqu'au niveau B (inclus) [exemple : 20->50]", ephemeral: true});
                    }
                }

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function artefactesInfo(nom, option)
        {
            let info = genshindb.artifacts(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info){
                embed.setTitle(`${info.name}`).setURL((info.url ? info.url.fandom : (info.images.mihoyo_flower ? info.images.mihoyo_flower : info.images.mihoyo_circlet))).setFooter({text: `Sorti(e) en version ${info.version}`});
                if(info.effect2Pc){
                    embed.addFields(
                        { name: `Effet 2 pièces`, value: `${info.effect2Pc}`},
                        { name: `Effet 4 pièces`, value: `${info.effect4Pc}`}
                    );
                }
                else if(info.effect1Pc)
                {
                    embed.addFields(
                        { name: `Effet 1 pièce`, value: `${info.effect1Pc}`}
                    );
                }
                else
                    console.log("[giinfo] Artefact avec un effet différent d'un 1-2-4 pièces ???");

                embed.setColor(`${(info.rarityList[info.rarityList.length-1] === 5 ? "#FFD700" : (info.rarityList[info.rarityList.length-1] === 4 ? "#8800C7" : (info.rarityList[info.rarityList.length-1] === 3 ? "#1AA7EC" : "#26df3f")))}`).setImage((info.images.mihoyo_flower ? info.images.mihoyo_flower : info.images.mihoyo_circlet));

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function nourrituresInfo(nom, option)
        {
            let info = genshindb.foods(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info){
                embed.setTitle(`${info.name}`).setDescription(info.description).setURL((info.url ? info.url.fandom : info.images.mihoyo_awakenIcon)).setFooter({text: `Sorti(e) en version ${info.version}`});
                embed.addFields(
                    { name: `Type de nourriture`, value: `${info.filterText}`, inline: true},
                    { name: `Rareté`, value: `${info.rarity} étoile(s)`, inline: true}
                );

                if(info.characterName)
                    embed.addFields({ name: `Plat de base`, value: `${info.baseDishName}`, inline: true});

                embed.addFields({ name: `Effet(s) du plat`, value: `${info.effect}`});
                embed.setColor(`${(info.rarity === 5 ? "#FFD700" : (info.rarity === 4 ? "#8800C7" : (info.rarity === 3 ? "#1AA7EC" : (info.rarity === 2 ? "#26df3f" : "#999999"))))}`).setImage(info.images.mihoyo_icon);

                for(let i = 0; i < info.ingredients.length; i++)
                {
                    if(materialMap.has(info.ingredients[i].name))
                        materialMap.set(info.ingredients[i].name, materialMap.get(info.ingredients[i].name) + info.ingredients[i].count);
                    else
                        materialMap.set(info.ingredients[i].name, info.ingredients[i].count);
                }

                for(const [key, value] of materialMap)
                {
                    textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                }

                embed.addFields({ name: "Ingrédient(s)", value: textValue});

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function domainesInfo(nom, option)
        {
            if(!nom.endsWith("I") && !nom.endsWith("II") && !nom.endsWith("III") && !nom.endsWith("IV"))
                nom += " IV";

            let info = genshindb.domains(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info)
            {
                embed.setTitle(`${info.name}`).setDescription(info.description).setColor(`${(info.daysOfWeek[0] === 'Lundi' ? "#FF0000" : (info.daysOfWeek[0] === 'Mardi' ? "#0080ff" : "#ffcd00"))}`);
                embed.addFields(
                    { name: `Nom de l'entrée`, value: `${info.entranceName}`, inline: true},
                    { name: `Région`, value: `${info.regionName}`, inline: true},
                    { name: `Disponibilités`, value: `${info.daysOfWeek.join(" - ")}`, inline: true}
                );

                embed.addFields({ name: `Effet(s) du Donjon`, value: `${info.disorder.join("\n")}`});

                for(let i = 0; i < info.monsterList.length; i++)
                {
                    monsterArray.push(info.monsterList[i].name);
                }
                embed.addFields({ name: "Liste des Ennemis", value: monsterArray.join("\n")});

                for(let i = 0; i < info.rewardPreview.length; i++)
                {
                    if(materialMap.has(info.rewardPreview[i].name))
                        materialMap.set(info.rewardPreview[i].name, materialMap.get(info.rewardPreview[i].name) + info.rewardPreview[i].count);
                    else
                        materialMap.set(info.rewardPreview[i].name, (info.rewardPreview[i].count ? info.rewardPreview[i].count : "Valeurs variables"));
                }

                for(const [key, value] of materialMap)
                {
                    textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                }

                embed.addFields({ name: "Récompenses Possibles", value: textValue});

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function ennemisInfo(nom, option)
        {
            let info = genshindb.enemies(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info)
            {
                embed.setTitle(`${info.name}`).setDescription(info.description).setColor(`${(info.enemyType === 'COMMON' ? "#0077ff" : (info.enemyType === 'ELITE' ? "#c3d200" : "#FF0000"))}`);

                for(let i = 0; i < info.rewardPreview.length; i++)
                {
                    monsterArray.push(info.rewardPreview[i].name);
                }

                embed.addFields({ name: "Récompenses Possibles", value: monsterArray.join("\n")});

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function planneursInfo(nom, option)
        {
            let info = genshindb.windgliders(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info) {
                embed.setTitle(`${info.name}`).setDescription(info.description).setFooter({text: `Sorti(e) en version ${info.version}`});
                embed.addFields({name: `Moyen(s) d'obtention`, value: `${info.source.join("\n")}`});
                embed.setColor(`${(info.rarity === 5 ? "#FFD700" : (info.rarity === 4 ? "#8800C7" : "#1AA7EC"))}`);

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});

        }
        function animauxInfo(nom, option)
        {
            let info = genshindb.animals(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info) {
                embed.setTitle(`${info.name}`).setDescription(info.description).setFooter({text: `Sorti(e) en version ${info.version}`});
                embed.setColor(`${(info.categoryText === 'Animaux terrestres' ? "#d7c000" : (info.categoryText === 'Oiseaux' ? "#4aff7d" : "#1AA7EC"))}`);

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }
        function materielsInfo(nom, option)
        {
            let info = genshindb.materials(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});
            //console.log(info);
            if(info) {
                embed.setTitle(`${info.name}`).setDescription(info.description);
                embed.setColor(`${(info.dropDomainName ? "#6790E7" : "#E77D67")}`);

                embed.addFields({name: `Utilisation`, value: `${info.typeText}`});

                if(info.dropDomainName)
                {
                    embed.addFields({name: `Donjon concerné`, value: `${info.dropDomainName}`});
                    if(info.sources)
                    {
                        embed.addFields({name: `Moyen(s) d'obtention alternatif`, value: `${info.sources.join("\n")}`});
                    }
                }
                else if(info.sources)
                {
                    embed.addFields({name: `Moyen(s) d'obtention`, value: `${info.sources.join("\n")}`});
                }

                return interaction.reply({embeds: [embed]});
            }
            else
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});
        }

        //---------------------------------------------------
        function getColor(element)
        {
            switch(element.toLowerCase())
            {
                case "cryo":
                    return "#70d5fd";
                case "hydro":
                    return "#002aff";
                case "dendro":
                    return "#48ff00";
                case "anémo":
                    return "#00ff80";
                case "pyro":
                    return "#ff0000";
                case "géo":
                    return "#f7ff00";
                case "électro":
                    return "#dd00ff";
                default:
                    return "#f4ff35";
            }
        }

        function isNumeric(str) {
            const pattern = /^-?\d+(\.\d+)?$/;
            return pattern.test(str);
        }

        //---------------------------------------------------------------------


    }
}