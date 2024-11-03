const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const url = require("url");
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hsrinfo')
        .setDescription('Commande qui permet d\'afficher des infos sur Honkai Star Rail')
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Catégorie de la recherche')
                .addChoices(
                    { name: 'Infos Personnages', value: 'pj' },
                    { name: 'Compétences', value: 'skills' },
                    { name: 'Eidolons', value: 'eidolons' },
                    { name: 'Cônes de Lumière', value: 'cones' },
                    { name: 'Reliques', value: 'reliques' },
                    { name: 'Objets', value: 'objets' },
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
        const urlStart = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";

        let materialMap = new Map();
        let monsterArray = [];
        let descriptionMap = new Map();
        let descriptionTotal = [];
        let textValue = "";

        /*const characterInfo = require("https://github.com/Mar-7th/StarRailRes/blob/master/index_new/fr/characters.json");
        console.log(characterInfo);*/

        await interaction.deferReply();

        const embed = new EmbedBuilder();

        switch (categorie) {
            case 'pj':
                charactersInfo(recherche, option);
                break;
            case 'skills':
                skillsInfo(recherche, option);
                break;
            case 'eidolons':
                //eidolonsInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'cones':
                //conesInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'reliques':
                //reliquesInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'objets':
                //objetsInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'domaines':
                //domainesInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'ennemis':
                //ennemisInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'planneurs':
                //planneursInfo(recherche, option);
                ErrorFound("Not Yet");
                break;
            case 'animaux':
                //animauxInfo(recherche, option);
                ErrorFound("Une erreur est survenue dans le choix de la catégorie");
                break;
            case 'materiels':
                //materielsInfo(recherche, option);
                ErrorFound("Une erreur est survenue dans le choix de la catégorie");
                break;
            default:
                ErrorFound("Une erreur est survenue dans le choix de la catégorie");
                return;
        }

        function charactersInfo(nom, option)
        {
            //console.log(nom);
            fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/characters.json`, {
            method: 'GET'
            }).then(res => res.json())
                .then(async res => {

                    //console.log(info);
                    let info = DetectorMC(res, nom);
                    if(info === "MC DETECTED")
                    {
                        return ErrorFound("Un MC a été détecté dans votre requête mais avec des informations insuffisantes, merci de spécifier dans la recherche le genre et/ou la voie\n" +
                            "(ex : \"pionnier physique\", \"pionnière physique\", \"pionnier feu\", \"pionnière feu\")", 15_000);
                    } else if (!info) {
                        for(let characterId in res)
                        {
                            //console.log(characterId);
                            if(res[characterId].name.toLowerCase().includes(nom.toLowerCase()))
                            {
                                info = res[characterId];
                                break;
                            }
                        }
                    }

                    //console.log(info);
                    if(info){
                        let descriptionsRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/descriptions.json`);
                        let decriptionsObj = await descriptionsRaw.json();
                        //console.log(decriptionsObj);
                        let description = "Pas encore de description pour ce personnage";
                        for(let descId in decriptionsObj)
                        {
                            //console.log(descId);
                            if(decriptionsObj[descId].title === info.name)
                            {
                                description = decriptionsObj[descId].desc;
                                break;
                            }
                        }

                        if(info.name === "{NICKNAME}")
                        {
                            if(info.id % 2) //si c'est vrai, Caelus, sinon Stelle
                                description = description.replaceAll(/^\{F#.*\}/g,"Un jeune garçon monté").replaceAll("{F#Elle}{M#Il}","Il");
                            else
                                description = description.replaceAll(/^\{F#.*\}/g,"Une jeune fille montée").replaceAll("{F#Elle}{M#Il}","Elle");

                            switch(info.id)
                            {
                                case "8001":
                                    info.name = "Pionnier Destruction";
                                    break;
                                case "8002":
                                    info.name = "Pionnière Destruction";
                                    break;
                                case "8003":
                                    info.name = "Pionnier Préservation";
                                    break;
                                case "8004":
                                    info.name = "Pionnière Préservation";
                                    break;
                                case "8005":
                                    info.name = "Pionnier Harmonie";
                                    break;
                                case "8006":
                                    info.name = "Pionnière Harmonie";
                                    break;
                                default:
                                    info.name = "Pionnier/ère";
                            }
                        }

                        embed.setTitle(`${info.name}`).setDescription(description).setURL(urlStart + info.preview);
                        embed.addFields(
                            { name: `Voie`, value: `${GetPath(info.path)}`, inline: true},
                            { name: `Rareté`, value: `${info.rarity} étoiles`, inline: true},
                            { name: `Élément`, value: `${GetElement(info.element)}`, inline: true}
                        );
                        embed.setColor(`${GetColor(info.element)}`).setImage(urlStart + info.portrait);
                        if(option){
                            let costsRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/character_promotions.json`);
                            let costsObj = await costsRaw.json();
                            let costs = null;

                            let itemsRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/items.json`);
                            let itemsObj = await itemsRaw.json();

                            for(let costId in costsObj)
                            {
                                //console.log(characterId);
                                if(costId === info.id)
                                {
                                    costs = costsObj[costId];
                                    break;
                                }
                            }

                            if(!costs)
                                ErrorFound("Une erreur est survenue, je n'ai pas trouvé les coûts d'amélioration du personnage (ceci est une erreur qui est censée jamais arriver)");

                            let infoMaterial = {};
                            switch (option.toLowerCase())
                            {
                                case "20":
                                    for(let j = 0; j < costs.materials[0].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[0][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[0][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[0][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "30":
                                    for(let j = 0; j < costs.materials[1].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[1][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[1][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[1][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "40":
                                    for(let j = 0; j < costs.materials[2].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[2][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[2][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[2][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "50":
                                    for(let j = 0; j < costs.materials[3].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[3][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[3][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[3][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "60":
                                    for(let j = 0; j < costs.materials[4].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[4][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[4][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[4][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "70":
                                    for(let j = 0; j < costs.materials[5].length; j++)
                                    {
                                        infoMaterial = FindById(costs.materials[5][j].id, itemsObj);
                                        if(materialMap.has(infoMaterial.name))
                                            materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[5][j].num);
                                        else
                                            materialMap.set(infoMaterial.name, costs.materials[5][j].num);
                                    }

                                    for(const [key, value] of materialMap)
                                    {
                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                    }

                                    embed.addFields({ name: `Les ressources d'élévation pour le niveau ${option}`, value: textValue});
                                    break;
                                case "total":
                                    for(let i = 0; i < costs.materials.length; i++)
                                    {
                                        for(let j = 0; j < costs.materials[i].length; j++)
                                        {
                                            infoMaterial = FindById(costs.materials[i][j].id, itemsObj);
                                            if(materialMap.has(infoMaterial.name))
                                                materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[i][j].num);
                                            else
                                                materialMap.set(infoMaterial.name, costs.materials[i][j].num);
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
                                            if(IsNumeric(levels[0]) && IsNumeric(levels[1]))
                                            {
                                                let levelA = parseInt(levels[0], 10);
                                                let levelB = parseInt(levels[1], 10);
                                                if((levelA === 20 || levelA === 30 || levelA === 40 || levelA === 50 || levelA === 60 || levelA === 70) && (levelB === 20 || levelB === 30 || levelB === 40 || levelB === 50 || levelB === 60 || levelB === 70) && levelA <= levelB)
                                                {
                                                    let start = (levelA === 20 ? 0 : (levelA === 30 ? 1 : (levelA === 40 ? 2 : (levelA === 50 ? 3 : (levelA === 60 ? 4 : 5)))));
                                                    let end = (levelB === 20 ? 0 : (levelB === 30 ? 1 : (levelB === 40 ? 2 : (levelB === 50 ? 3 : (levelB === 60 ? 4 : 5)))));
                                                    while(start <= end)
                                                    {
                                                        for(let j = 0; j < costs.materials[start].length; j++)
                                                        {
                                                            infoMaterial = FindItemById(costs.materials[start][j].id, itemsObj);
                                                            if(materialMap.has(infoMaterial.name))
                                                                materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + costs.materials[start][j].num);
                                                            else
                                                                materialMap.set(infoMaterial.name, costs.materials[start][j].num);
                                                        }
                                                        start++;
                                                    }

                                                    for(const [key, value] of materialMap)
                                                    {
                                                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                                                    }

                                                    embed.addFields({ name: `Total de ressources du niveau ${levelA} au niveau ${levelB}`, value: textValue});
                                                    return interaction.editReply({embeds: [embed]});
                                                }
                                            }
                                        }
                                    }
                                    return ErrorFound("L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                            "\"20\" = coût d'ascension du personnage pour le niveau 20\n" +
                                            "\"30\" = coût d'ascension du personnage pour le niveau 30\n" +
                                            "\"40\" = coût d'ascension du personnage pour le niveau 40\n" +
                                            "\"50\" = coût d'ascension du personnage pour le niveau 50\n" +
                                            "\"60\" = coût d'ascension du personnage pour le niveau 60\n" +
                                            "\"70\" = coût d'ascension du personnage pour le niveau 70\n" +
                                            "\"total\" = coûts total de toutes les ascensions du personnage\n" +
                                            "\"lvlA->lvlB\" = Permet d'afficher le cout total à partir du niveau A (inclus) jusqu'au niveau B (inclus) [exemple : 20->50]", 25_000);
                            }
                        }

                        return interaction.editReply({embeds: [embed]});
                    }
                    else
                        return ErrorFound("Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c");
            });
        }
        async function skillsInfo(nom, option)
        {
            if(!option)
            {
                return ErrorFound("Pour cette commande, merci de préciser dans \"option\" quelle talent du personnage vous rechercher\n" +
                        "\"basique\" = Attaque normal du personnage\n" +
                        "\"comp\" = la compétence du personnage\n" +
                        "\"ultime\" = l'ultime du personnage\n" +
                        "\"talent\" = Le passif du personnage\n" +
                        "\"technique\" = La technique du personnage\n" +
                        "\"cout\" = coûts de montée de niveau des aptitudes", 20_000);
            }

            let charactersRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/characters.json`);
            let charactersObj = await charactersRaw.json();
            let infoCharacter = null;

            infoCharacter = DetectorMC(charactersObj, nom);
            if(infoCharacter === "MC DETECTED")
            {
                return ErrorFound("Un MC a été détecté dans votre requête mais avec des informations insuffisantes, merci de spécifier dans la recherche le genre et/ou la voie\n" +
                    "(ex : \"pionnier physique\", \"pionnière physique\", \"pionnier feu\", \"pionnière feu\")", 15_000);
            } else if (!infoCharacter) {
                for(let characterId in charactersObj)
                {
                    //console.log(characterId);
                    if(charactersObj[characterId].name.toLowerCase().includes(nom.toLowerCase()))
                    {
                        infoCharacter = charactersObj[characterId];
                        break;
                    }
                }
            }

            if(!infoCharacter)
                return ErrorFound("Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c");

            let skillsRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/character_skills.json`);
            let skillsObj = await skillsRaw.json();

            let skillInfo = null;
            let nbChangingValues = 0;
            let regexReplace;
            let description = "";
            switch(option.toLowerCase())
            {
                case "basique":
                    skillInfo = FindById(infoCharacter.skills[0], skillsObj);
                    if(!skillInfo)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé la compétence du personnage que tu recherches (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - ${skillInfo.name}`).setDescription("Les valeurs affichées sont basées sur le niveau 1 et le niveau max (sans Eidolon) de la trace").setURL(urlStart + skillInfo.icon);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);

                    nbChangingValues = skillInfo.params[0].length;
                    description = skillInfo.desc;
                    for(let i = 0; i < nbChangingValues; i++)
                    {
                        regexReplace = new RegExp(`#${i+1}\\[[if]\\d?\\]%`);
                        if(regexReplace.test(description))
                        {
                            description = description.replace(regexReplace, (skillInfo.params[0][i] * 100).toFixed(1) + "% -> " + (skillInfo.params[5][i] * 100).toFixed(1) + "%");
                        }
                        else
                        {
                            description = description.replace(new RegExp(`#${i+1}\\[[if]\\d?\\]`), skillInfo.params[0][i] + " -> " + skillInfo.params[5][i]);
                        }
                    }

                    embed.addFields({ name: "Description", value: description});
                    break;
                case "comp":
                    skillInfo = FindById(infoCharacter.skills[1], skillsObj);
                    if(!skillInfo)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé la compétence du personnage que tu recherches (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - ${skillInfo.name}`).setDescription("Les valeurs affichées sont basées sur le niveau 1 et le niveau max (sans Eidolon) de la trace").setURL(urlStart + skillInfo.icon);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);

                    nbChangingValues = skillInfo.params[0].length;
                    description = skillInfo.desc;
                    for(let i = 0; i < nbChangingValues; i++)
                    {
                        regexReplace = new RegExp(`#${i+1}\\[[if]\\d?\\]%`);
                        if(regexReplace.test(description))
                        {
                            description = description.replace(regexReplace, (skillInfo.params[0][i] * 100).toFixed(1) + "% -> " + (skillInfo.params[9][i] * 100).toFixed(1) + "%");
                        }
                        else
                        {
                            description = description.replace(new RegExp(`#${i+1}\\[[if]\\d?\\]`), skillInfo.params[0][i] + " -> " + skillInfo.params[9][i]);
                        }
                    }

                    embed.addFields({ name: "Description", value: description});
                    break;
                case "ultime":
                    skillInfo = FindById(infoCharacter.skills[2], skillsObj);
                    if(!skillInfo)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé la compétence du personnage que tu recherches (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - ${skillInfo.name}`).setDescription("Les valeurs affichées sont basées sur le niveau 1 et le niveau max (sans Eidolon) de la trace").setURL(urlStart + skillInfo.icon);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);

                    nbChangingValues = skillInfo.params[0].length;
                    description = skillInfo.desc;
                    for(let i = 0; i < nbChangingValues; i++)
                    {
                        regexReplace = new RegExp(`#${i+1}\\[[if]\\d?\\]%`);
                        if(regexReplace.test(description))
                        {
                            description = description.replace(regexReplace, (skillInfo.params[0][i] * 100).toFixed(1) + "% -> " + (skillInfo.params[9][i] * 100).toFixed(1) + "%");
                        }
                        else
                        {
                            description = description.replace(new RegExp(`#${i+1}\\[[if]\\d?\\]`), skillInfo.params[0][i] + " -> " + skillInfo.params[9][i]);
                        }
                    }

                    embed.addFields({ name: "Description", value: description});
                    break;
                case "talent":
                    skillInfo = FindById(infoCharacter.skills[3], skillsObj);
                    if(!skillInfo)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé la compétence du personnage que tu recherches (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - ${skillInfo.name}`).setDescription("Les valeurs affichées sont basées sur le niveau 1 et le niveau max (sans Eidolon) de la trace").setURL(urlStart + skillInfo.icon);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);

                    nbChangingValues = skillInfo.params[0].length;
                    description = skillInfo.desc;
                    for(let i = 0; i < nbChangingValues; i++)
                    {
                        regexReplace = new RegExp(`#${i+1}\\[[if]\\d?\\]%`);
                        if(regexReplace.test(description))
                        {
                            description = description.replace(regexReplace, (skillInfo.params[0][i] * 100).toFixed(1) + "% -> " + (skillInfo.params[9][i] * 100).toFixed(1) + "%");
                        }
                        else
                        {
                            description = description.replace(new RegExp(`#${i+1}\\[[if]\\d?\\]`), skillInfo.params[0][i] + " -> " + skillInfo.params[9][i]);
                        }
                    }

                    embed.addFields({ name: "Description", value: description});
                    break;
                case "technique":
                    skillInfo = FindById(infoCharacter.skills[5], skillsObj);
                    if(!skillInfo)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé la compétence du personnage que tu recherches (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - ${skillInfo.name}`).setDescription("Les valeurs affichées sont basées sur le niveau 1 et le niveau max (sans Eidolon) de la trace").setURL(urlStart + skillInfo.icon);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);

                    nbChangingValues = skillInfo.params[0].length;
                    description = skillInfo.desc;
                    for(let i = 0; i < nbChangingValues; i++)
                    {
                        regexReplace = new RegExp(`#${i+1}\\[[if]\\d?\\]%`);
                        if(regexReplace.test(description))
                        {
                            description = description.replace(regexReplace, (skillInfo.params[0][i] * 100).toFixed(1) + "% -> " + (skillInfo.params[0][i] * 100).toFixed(1) + "%");
                        }
                        else
                        {
                            description = description.replace(new RegExp(`#${i+1}\\[[if]\\d?\\]`), skillInfo.params[0][i] + " -> " + skillInfo.params[0][i]);
                        }
                    }

                    embed.addFields({ name: "Description", value: description});
                    break;
                case "cout":
                    const skillsTreeRaw = await fetch("https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/character_skill_trees.json");
                    const skillsTreeObj = await skillsTreeRaw.json();

                    let itemsRaw = await fetch(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_new/fr/items.json`);
                    let itemsObj = await itemsRaw.json();

                    skillBasicInfo = FindById(infoCharacter.skill_trees[0], skillsTreeObj);
                    skillOtherInfo = FindById(infoCharacter.skill_trees[1], skillsTreeObj);

                    let costTraceMap = new Map();
                    for(let i = 5; i < infoCharacter.skill_trees.length; i++){
                        costTraceMap.set(infoCharacter.skill_trees[i], FindById(infoCharacter.skill_trees[i], skillsTreeObj));
                    }

                    if(!skillBasicInfo || !skillOtherInfo || !itemsObj)
                        ErrorFound("Une erreur est survenue, je n'ai pas trouvé les coûts d'amélioration des traces du personnage (ceci est une erreur qui est censée jamais arriver)");

                    embed.setTitle(`${infoCharacter.name} - Coût en matériaux de traces`).setDescription("Coût total de toutes les traces mineure, majeure et compétences").setURL(urlStart + infoCharacter.preview);
                    embed.setColor(`${GetColor(infoCharacter.element)}`).setImage(urlStart + infoCharacter.portrait);
                    for(let i = 1; i < skillBasicInfo.levels.length; i++)
                    {
                        for(let j = 0; j < skillBasicInfo.levels[i].materials.length; j++)
                        {
                            let infoMaterial = FindById(skillBasicInfo.levels[i].materials[j].id, itemsObj);
                            if(materialMap.has(infoMaterial.name))
                                materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + skillBasicInfo.levels[i].materials[j].num);
                            else
                                materialMap.set(infoMaterial.name, skillBasicInfo.levels[i].materials[j].num);
                        }
                    }

                    for(let i = 1; i < skillOtherInfo.levels.length; i++)
                    {
                        for(let j = 0; j < skillOtherInfo.levels[i].materials.length; j++)
                        {
                            let infoMaterial = FindById(skillOtherInfo.levels[i].materials[j].id, itemsObj);
                            if(materialMap.has(infoMaterial.name))
                                materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + (skillOtherInfo.levels[i].materials[j].num * 3));
                            else
                                materialMap.set(infoMaterial.name, (skillOtherInfo.levels[i].materials[j].num * 3));
                        }
                    }

                    for(const [key, value] of costTraceMap)
                    {
                        for(let i = 0; i < value.levels.length; i++)
                        {
                            for(let j = 0; j < value.levels[i].materials.length; j++)
                            {
                                let infoMaterial = FindById(value.levels[i].materials[j].id, itemsObj);
                                if(materialMap.has(infoMaterial.name))
                                    materialMap.set(infoMaterial.name, materialMap.get(infoMaterial.name) + value.levels[i].materials[j].num);
                                else
                                    materialMap.set(infoMaterial.name, value.levels[i].materials[j].num);
                            }

                        }
                    }

                    for(const [key, value] of materialMap)
                    {
                        textValue += `${key} : ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}\n`;
                    }

                    embed.addFields({ name: "Total", value: textValue});
                    break;
                default:
                    return ErrorFound("L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                            "\"basique\" = Attaque normal du personnage\n" +
                            "\"comp\" = la compétence du personnage\n" +
                            "\"ultime\" = l'ultime du personnage\n" +
                            "\"talent\" = Le passif du personnage\n" +
                            "\"technique\" = La technique du personnage\n" +
                            "\"cout\" = coûts de montée de niveau des aptitudes", 20_000);
            }

            return interaction.editReply({embeds: [embed]});
        }
        /*function eidolonsInfo(nom, option)
        {
            let info = {};
            let infoCharacter = genshindb.characters(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"});

            if(!infoCharacter)
                return interaction.reply({content: "Je n'ai rien trouvé sur ce que vous m'avez demandé, je suis désolé :c", ephemeral: true});

            embed.setColor(`${GetColor(infoCharacter.elementText)}`).setImage(infoCharacter.images.cover1);

            if(option)
            {
                switch (option.toLowerCase())
                {
                    case "e1":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c1;
                        embed.setTitle(`${infoCharacter.name} - E1`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "e2":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c2;
                        embed.setTitle(`${infoCharacter.name} - E2`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "e3":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c3;
                        embed.setTitle(`${infoCharacter.name} - E3`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "e4":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c4;
                        embed.setTitle(`${infoCharacter.name} - E4`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "e5":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c5;
                        embed.setTitle(`${infoCharacter.name} - E5`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    case "e6":
                        info = genshindb.constellations(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).c6;
                        embed.setTitle(`${infoCharacter.name} - E6`).setURL((infoCharacter.url ? infoCharacter.url.fandom : infoCharacter.images.cover1)).setFooter({text: `Sorti(e) en version ${infoCharacter.version}`});
                        embed.addFields({name: info.name, value: info.description});
                        break;
                    default:
                        return interaction.reply({content: "L'option que vous m'avez donné n'existe pas, veuillez réessayer avec une option qui existe.\n" +
                                "\"e1\" = Le premier Eidolon\n" +
                                "\"e2\" = Le second Eidolon\n" +
                                "\"e3\" = Le troisième Eidolon\n" +
                                "\"e4\" = Le quatrième Eidolon\n" +
                                "\"e5\" = Le cinquième Eidolon\n" +
                                "\"e6\" = Le sixième Eidolon", ephemeral: true});
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
        function conesInfo(nom, option)
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
                let isRoundingEM = 0;
                let subStatMin = infoStatsMin.specialized;
                let subStatMax = infoStatsMax.specialized;
                if(info.mainStatType !== "FIGHT_PROP_ELEMENT_MASTERY")
                {
                    subStatMin *= 100;
                    subStatMax *= 100;
                    isPercent = "%";
                    isRoundingEM = 1;
                }

                embed.addFields(
                    { name: `Type d'arme`, value: `${info.weaponText}`, inline: true},
                    { name: `Rareté`, value: `${info.rarity} étoiles`, inline: true},
                    { name: `Stat Principale`, value: `${info.mainStatText}`, inline: true},
                    { name: `Level 1`, value: `${Number(infoStatsMin.attack).toFixed(0)} ATQ\n${Number(subStatMin).toFixed(isRoundingEM)}${isPercent} ${info.mainStatText}`, inline: true},
                    { name: `Level 90`, value: `${Number(infoStatsMax.attack).toFixed(0)} ATQ\n${Number(subStatMax).toFixed(isRoundingEM)}${isPercent} ${info.mainStatText}`, inline: true},
                    { name: `${info.effectName}`, value: `${info.r1.description}`},
                    { name: `Bonus Raffinement`, value: `${info.r1.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r2.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r3.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r4.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}\n${info.r5.values.join(" - ").replaceAll("{NON_BREAK_SPACE}", "")}`}

                );
                embed.setColor(`${(info.rarity === 5 ? "#FFD700" : (info.rarity === 4 ? "#8800C7" : "#1AA7EC"))}`).setImage(info.images.mihoyo_icon);
                if(option){
                    let infoMaterial = genshindb.weapons(nom, {queryLanguages: ["French", "English"], resultLanguage: "French"}).costs;
                    //console.log(Object.values(infoMaterial)[0]);
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
        function reliques(nom, option)
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
        function objetsInfo(nom, option)
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
        }*/

        //---------------------------------------------------
        function GetColor(element)
        {
            switch(element)
            {
                case "Ice":
                    return "#70d5fd";
                case "Quantum":
                    return "#2950ff";
                case "Physical":
                    return "#6c6c6c";
                case "Wind":
                    return "#00ff80";
                case "Fire":
                    return "#ff0000";
                case "Imaginary":
                    return "#f7ff00";
                case "Thunder":
                    return "#dd00ff";
                default:
                    return "#000000";
            }
        }

        function GetElement(element)
        {
            switch(element)
            {
                case "Ice":
                    return "Glace";
                case "Quantum":
                    return "Quantique";
                case "Physical":
                    return "Physique";
                case "Wind":
                    return "Vent";
                case "Fire":
                    return "Feu";
                case "Imaginary":
                    return "Imaginaire";
                case "Thunder":
                    return "Foudre";
                default:
                    return "#000000";
            }
        }

        function IsNumeric(str) {
            const pattern = /^-?\d+(\.\d+)?$/;
            return pattern.test(str);
        }

        function GetPath(path){
            switch(path)
            {
                case "Warrior":
                    return "La Destruction";
                case "Rogue":
                    return "La Chasse";
                case "Mage":
                    return "L'Érudition";
                case "Shaman":
                    return "L'Harmonie";
                case "Warlock":
                    return "La Nihilité";
                case "Knight":
                    return "La Préservation";
                case "Priest":
                    return "L'Abondance";
                default:
                    return "Inconnu";
            }
        }

        function DetectorMC(characters, nom)
        {
            if("caelus".includes(nom.toLowerCase()) || "stelle".includes(nom.toLowerCase()) || "mc".includes(nom.toLowerCase()) || "trailblaze".includes(nom.toLowerCase()) || "pionnier".includes(nom.toLowerCase()) || "pionnière".includes(nom.toLowerCase()) || "tlb".includes(nom.toLowerCase())){
                //console.log("MC DETECTED");
                return "MC DETECTED";
            } else if("pionnier physique".includes(nom.toLowerCase()) || "physical male trailblazer".includes(nom.toLowerCase()) || "phys male tlb".includes(nom.toLowerCase()) || "phys caelus".includes(nom.toLowerCase()) || "caelus physique".includes(nom.toLowerCase()) || "destru male tlb".includes(nom.toLowerCase()) || "mc homme physique".includes(nom.toLowerCase()) || "physical male mc".includes(nom.toLowerCase()) || "mc homme destruction".includes(nom.toLowerCase()) || "caelus destruction".includes(nom.toLowerCase()) || "destruction caelus".includes(nom.toLowerCase())) {
                //console.log("MC Homme PHYSIQUE");
                return characters["8001"];
            } else if("pionnière physique".includes(nom.toLowerCase()) || "physical female trailblazer".includes(nom.toLowerCase()) || "phys female tlb".includes(nom.toLowerCase()) || "phys stelle".includes(nom.toLowerCase()) || "stelle physique".includes(nom.toLowerCase()) || "destruc female tlb".includes(nom.toLowerCase()) || "mc femme physique".includes(nom.toLowerCase()) || "physical female mc".includes(nom.toLowerCase()) || "mc femme destruction".includes(nom.toLowerCase()) || "stelle destruction".includes(nom.toLowerCase()) || "destruction stelle".includes(nom.toLowerCase())) {
                //console.log("MC Femme PHYSIQUE");
                return characters["8002"];
            } else if("pionnier feu".includes(nom.toLowerCase()) || "fire male trailblazer".includes(nom.toLowerCase()) || "fire male tlb".includes(nom.toLowerCase()) || "fire caelus".includes(nom.toLowerCase()) || "caelus feu".includes(nom.toLowerCase()) || "preserv male tlb".includes(nom.toLowerCase()) || "mc homme feu".includes(nom.toLowerCase()) || "fire male mc".includes(nom.toLowerCase()) || "mc homme preservation".includes(nom.toLowerCase()) || "caelus préservation".includes(nom.toLowerCase()) || "preservation caelus".includes(nom.toLowerCase())) {
                //console.log("MC Homme FEU");
                return characters["8003"];
            } else if("pionnière feu".includes(nom.toLowerCase()) || "fire female trailblazer".includes(nom.toLowerCase()) || "fire female tlb".includes(nom.toLowerCase()) || "fire stelle".includes(nom.toLowerCase()) || "stelle feu".includes(nom.toLowerCase()) || "preserv female tlb".includes(nom.toLowerCase()) || "mc femme feu".includes(nom.toLowerCase()) || "fire female mc".includes(nom.toLowerCase()) || "mc femme preservation".includes(nom.toLowerCase()) || "stelle préservation".includes(nom.toLowerCase()) || "preservation stelle".includes(nom.toLowerCase())) {
                //console.log("MC Femme FEU");
                return characters["8004"];
            } else if("pionnier imaginaire".includes(nom.toLowerCase()) || "imaginary male trailblazer".includes(nom.toLowerCase()) || "img male tlb".includes(nom.toLowerCase()) || "img caelus".includes(nom.toLowerCase()) || "caelus img".includes(nom.toLowerCase()) || "harm male tlb".includes(nom.toLowerCase()) || "mc homme img".includes(nom.toLowerCase()) || "img male mc".includes(nom.toLowerCase()) || "mc homme harm".includes(nom.toLowerCase()) || "caelus harm".includes(nom.toLowerCase()) || "harmonie caelus".includes(nom.toLowerCase())) {
                //console.log("MC Homme Imag");
                return characters["8005"];
            } else if("pionnière imaginaire".includes(nom.toLowerCase()) || "imaginary female trailblazer".includes(nom.toLowerCase()) || "img female tlb".includes(nom.toLowerCase()) || "img stelle".includes(nom.toLowerCase()) || "stelle img".includes(nom.toLowerCase()) || "harm female tlb".includes(nom.toLowerCase()) || "mc femme img".includes(nom.toLowerCase()) || "img female mc".includes(nom.toLowerCase()) || "mc femme harm".includes(nom.toLowerCase()) || "stelle harm".includes(nom.toLowerCase()) || "harmonie stelle".includes(nom.toLowerCase())) {
                //console.log("MC Femme Imag");
                return characters["8006"];
            } else
                return null;
        }

        function FindById(id, list) {
            for(let objId in list)
            {
                if(id === objId)
                {
                    return list[objId];
                }
            }

            return null;
        }

        function ErrorFound(error, time = 5_000){
            //console.log(interaction);
            return interaction.editReply({content: error}).then(async message => {
                        await wait(time);
                        if(interaction.guildId)
                            message.delete();
                    });
        }
    }
}