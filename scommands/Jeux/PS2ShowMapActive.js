const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ps2showmapactive")
        .setDescription("Permet d\'afficher la/les map(s) activent sur le serveur choisis (PlanetSide 2)")
        .addStringOption(option =>
            option.setName('serveur')
                .setDescription('Serveur où le bot doit vérifier')
                .addChoices(
                    { name: 'Miller', value: 'miller' },
                    { name: 'Cobalt', value: 'cobalt' },
                    { name: 'Emerald', value: 'emerald' },
                    { name: 'Connery', value: 'connery' },
                    { name: 'SolTech', value: 'soltech' }
                )
                .setRequired(false)),
    async execute(interaction, commandName, autreArgs, client, Discord) {
        await interaction.deferReply();

        let serveur = interaction.options.getString('serveur');
        let worldId = 10;
        switch(serveur) {
            case 'miller':
                worldId = 10;
                break;
            case 'cobalt':
                worldId = 13;
                break;
            case 'emerald':
                worldId = 17;
                break;
            case 'connery':
                worldId = 1;
                break;
            case 'soltech':
                worldId = 40;
                break;
            default:
                //console.log("[PS2ShowMapActive] Default Switch case");
                serveur = "miller";
                worldId = 10;
        }

        let activesMaps = [];
        let factionRegionCount = [];
        let firstFactionCheck = '0';
        let vanuRegionCount = 0;
        let vanuPlayerCount = 0;
        let trRegionCount = 0;
        let trPlayerCount = 0;
        let ncRegionCount = 0;
        let ncPlayerCount = 0;
        let totalPlayerCount = 0;
        let hex = {}

        await fetch(`https://census.daybreakgames.com/s:SamidoBotDiscord/get/ps2:v2/map/?world_id=${worldId}&zone_ids=2`, { //Indar
        }).then(res => res.json())
            .then(res => {
                if(res.returned === 0)
                    return;

                //console.log("Indar Start");
                hex = res.map_list[0].Regions;
                //console.log(res.map_list[0].Regions.Row[0]);
                firstFactionCheck = hex.Row[0].RowData.FactionId;
                addRegionToFaction(hex.Row[0].RowData.FactionId);

                for(let i = 1; i < hex.Row.length; i++)
                {
                    if(hex.Row[i].RowData.FactionId === '0') //Zone non-capturable
                        continue;

                    if(!activesMaps.includes("Indar") && firstFactionCheck !== hex.Row[i].RowData.FactionId)
                    {
                        activesMaps.push("Indar");
                    }
                    addRegionToFaction(hex.Row[i].RowData.FactionId);
                }

                if(activesMaps.includes("Indar"))
                {
                    factionRegionCount.push({"vanuCount": vanuRegionCount, "ncCount": ncRegionCount, "trCount": trRegionCount});
                }
                resetFactionRegionCount();
                //console.log("Indar Stop");
            });
        await fetch(`https://census.daybreakgames.com/s:SamidoBotDiscord/get/ps2:v2/map/?world_id=${worldId}&zone_ids=4`, { //Hossin
        }).then(res => res.json())
            .then(res => {
                if(res.returned === 0)
                    return;

                //console.log("Hossin Start");
                hex = res.map_list[0].Regions;
                //console.log(res.map_list[0].Regions.Row[0]);
                firstFactionCheck = hex.Row[0].RowData.FactionId;
                addRegionToFaction(hex.Row[0].RowData.FactionId);

                for(let i = 1; i < hex.Row.length; i++)
                {
                    if(hex.Row[i].RowData.FactionId === '0') //Zone non-capturable
                        continue;

                    if(!activesMaps.includes("Hossin") && firstFactionCheck !== hex.Row[i].RowData.FactionId)
                    {
                        activesMaps.push("Hossin");
                    }
                    addRegionToFaction(hex.Row[i].RowData.FactionId);
                }

                if(activesMaps.includes("Hossin"))
                {
                    factionRegionCount.push({"vanuCount": vanuRegionCount, "ncCount": ncRegionCount, "trCount": trRegionCount});
                }
                resetFactionRegionCount();
                //console.log("Hossin Stop");
            });
        await fetch(`https://census.daybreakgames.com/s:SamidoBotDiscord/get/ps2:v2/map/?world_id=${worldId}&zone_ids=6`, { //Amerish
        }).then(res => res.json())
            .then(res => {
                if(res.returned === 0)
                    return;

                //console.log("Amerish Start");
                hex = res.map_list[0].Regions;
                //console.log(res.map_list[0].Regions.Row[0]);
                firstFactionCheck = hex.Row[0].RowData.FactionId;
                addRegionToFaction(hex.Row[0].RowData.FactionId);

                for(let i = 1; i < hex.Row.length; i++)
                {
                    if(hex.Row[i].RowData.FactionId === '0') //Zone non-capturable
                        continue;

                    if(!activesMaps.includes("Amerish") && firstFactionCheck !== hex.Row[i].RowData.FactionId)
                    {
                        activesMaps.push("Amerish");
                    }
                    addRegionToFaction(hex.Row[i].RowData.FactionId);
                }

                if(activesMaps.includes("Amerish"))
                {
                    factionRegionCount.push({"vanuCount": vanuRegionCount, "ncCount": ncRegionCount, "trCount": trRegionCount});
                }
                resetFactionRegionCount();
                //console.log("Amerish Stop");
            });
        await fetch(`https://census.daybreakgames.com/s:SamidoBotDiscord/get/ps2:v2/map/?world_id=${worldId}&zone_ids=8`, { //Esamir
        }).then(res => res.json())
            .then(res => {
                if(res.returned === 0)
                    return;

                //console.log("Esamir Start");
                hex = res.map_list[0].Regions;
                //console.log(res.map_list[0].Regions.Row[0]);
                firstFactionCheck = hex.Row[0].RowData.FactionId;
                addRegionToFaction(hex.Row[0].RowData.FactionId);

                for(let i = 1; i < hex.Row.length; i++)
                {
                    if(hex.Row[i].RowData.FactionId === '0') //Zone non-capturable
                        continue;

                    if(!activesMaps.includes("Esamir") && firstFactionCheck !== hex.Row[i].RowData.FactionId)
                    {
                        activesMaps.push("Esamir");
                    }
                    addRegionToFaction(hex.Row[i].RowData.FactionId);
                }

                if(activesMaps.includes("Esamir"))
                {
                    factionRegionCount.push({"vanuCount": vanuRegionCount, "ncCount": ncRegionCount, "trCount": trRegionCount});
                }
                resetFactionRegionCount();
                //console.log("Esamir Stop");
            });
        await fetch(`https://census.daybreakgames.com/s:SamidoBotDiscord/get/ps2:v2/map/?world_id=${worldId}&zone_ids=344`, { //Oshur
        }).then(res => res.json())
            .then(res => {
                if(res.returned === 0)
                    return;

                //console.log("Oshur Start");
                hex = res.map_list[0].Regions;
                //console.log(res.map_list[0].Regions.Row[0]);
                firstFactionCheck = hex.Row[0].RowData.FactionId;
                addRegionToFaction(hex.Row[0].RowData.FactionId);

                for(let i = 1; i < hex.Row.length; i++)
                {
                    if(hex.Row[i].RowData.FactionId === '0') //Zone non-capturable
                        continue;

                    if(!activesMaps.includes("Oshur") && firstFactionCheck !== hex.Row[i].RowData.FactionId)
                    {
                        activesMaps.push("Oshur");
                    }
                    addRegionToFaction(hex.Row[i].RowData.FactionId);
                }

                if(activesMaps.includes("Oshur"))
                {
                    factionRegionCount.push({"vanuCount": vanuRegionCount, "ncCount": ncRegionCount, "trCount": trRegionCount});
                }
                resetFactionRegionCount();
                //console.log("Oshur Stop");
            });

        await fetch(`https://agg.ps2.live/population/${worldId}`, { //Population
        }).then(res => res.json())
            .then(res => {
                if(!res.average)
                    return;

                //console.log("Population Start");
                //console.log(res.average);
                totalPlayerCount = res.average;
                vanuPlayerCount = res.factions.vs;
                ncPlayerCount = res.factions.nc;
                trPlayerCount = res.factions.tr;
                //console.log("Population Stop");
            });

        if(activesMaps.length === 0 && totalPlayerCount < 1)
        {
            console.log("[PS2ShowMapActive] Aucune map active n'a été détecté !")
            return interaction.editReply({content: `Une erreur est survenue, aucune map active n'a été détecté (le serveur est peut être en maintenance)`});
        }

        let serveurDisplayName = serveur.charAt(0).toUpperCase() + serveur.slice(1);
        const embed = new EmbedBuilder()
            .setColor('#05ff00')
            .setTitle(`Serveur : ${serveurDisplayName}`)
            .setDescription(`Map(s) et Joueurs actifs sur le serveur ${serveurDisplayName}`)
            .setFooter({text: `Il y a au total environ ${totalPlayerCount} joueurs`})
            .setTimestamp();
        for(let zoneCount = 0; zoneCount < activesMaps.length; zoneCount++)
        {
            embed.addFields(
                { name: `${activesMaps[zoneCount]}`, value: `VS contrôlent ${factionRegionCount[zoneCount].vanuCount} zones\nNC contrôlent ${factionRegionCount[zoneCount].ncCount} zones\nTR contrôlent ${factionRegionCount[zoneCount].trCount} zones`},
            )
        }

        embed.addFields(
            { name: `Nombre de joueurs par faction`, value: `VS possède ${vanuPlayerCount} soldats\nNC possède ${ncPlayerCount} soldats\nTR possède ${trPlayerCount} soldats`},
        )

        return interaction.editReply({embeds: [embed]});
        //----------------------------------------------------------------------------------------------------------------------------------------
        function resetFactionRegionCount(){
            vanuRegionCount = 0;
            trRegionCount = 0;
            ncRegionCount = 0;
        }

        function addRegionToFaction(factionId) {
            switch(factionId){
                case '1':
                    vanuRegionCount++;
                    break;
                case '2':
                    ncRegionCount++;
                    break;
                case '3':
                    trRegionCount++;
                    break;
                default:
                    break;
            }
        }
    }
}

/* 	https://census.daybreakgames.com/get/ps2:v2/world/?c:limit=100
{"world_list":[
{"world_id":"10","state":"online","name":{"en":"Miller","de":"Miller","es":"Miller","fr":"Miller","it":"Miller","tr":"Miller"}},
{"world_id":"13","state":"online","name":{"en":"Cobalt","de":"Cobalt","es":"Cobalt","fr":"Cobalt","it":"Cobalt","tr":"Cobalt"}},
{"world_id":"17","state":"online","name":{"en":"Emerald","de":"Smaragd","es":"Esmeralda","fr":"Emerald","it":"Smeraldo","tr":"Emerald"}},
{"world_id":"19","state":"online","name":{"en":"Jaeger","de":"Jaeger","es":"Jaeger","fr":"Jaeger","it":"Jaeger","tr":"Jaeger"}}, <- n'est pas publique
{"world_id":"24","state":"locked","name":{"en":"Apex","de":"Apex","es":"Apex","fr":"Apex","it":"Apex","tr":"Apex"}}, <- Serveur privé/test
{"world_id":"1","state":"online","name":{"en":"Connery","de":"Connery","es":"Connery","fr":"Connery","it":"Connery","tr":"Connery"}},
{"world_id":"40","state":"online","name":{"en":"SolTech","de":"SolTech","es":"SolTech","fr":"SolTech","it":"SolTech","tr":"SolTech"}},
{"world_id":"25","state":"online","name":{"en":"Briggs","de":"Briggs","es":"Briggs","fr":"Briggs","it":"Briggs","tr":"Briggs"}, <- n'est pas publique
"description":{"en":"AUS","de":"AUS","es":"AUS","fr":"AUS","it":"AUS","tr":"AUS"}}],"returned":8}
 */

/* FACTIONS
Vanu -> 1
NC -> 2
TR -> 3
NSO -> 4
 */


/* ZONES IDs
Indar -> 2
Hossin -> 4
Amerish -> 6
Esamir -> 8
Oshur -> 344
 */

//fetch('https://census.daybreakgames.com/get/ps2:v2/character/?name.first_lower=PSEUDO MINUSCULE', {
// }).then(res => res.json()).then(res => console.log(res)); -> Info d'un perso