const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const mapMusique = require('../MusiqueAux/stockageMusique.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("liste")
        .setDescription("Permet d\'afficher la liste des chansons")
        .setDMPermission(false),
    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const cheminImage = `https://s1.zerochan.net/Dragonmaid.600.3095621.jpg`;
        let page = 0;

        mapMusique.execute(serveurDiscord, true);

        if(autreArgs !== null){
            page = autreArgs;
        }else{
            await interaction.deferReply({ephemeral: true});


            if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status === "playing"){
                page = Math.floor(mapMusique.mapSong.get(serveurDiscord)["index"] / 5);
            }
        }

        const nbSong = mapMusique.mapSong.get(serveurDiscord)["nbSong"];
        if(nbSong > 0){
            let arraySong = [];
            const songs = mapMusique.mapSong.get(serveurDiscord)["songs"];
            // inside a command, event listener, etc.
            const newEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle(`Liste des musiques (page ${page+1})`)
                .setThumbnail(songs[mapMusique.mapSong.get(serveurDiscord)["index"]].miniature)
                //.setImage(songs[mapMusique.mapSong.get(serveurDiscord)["index"]].miniature)
                .setTimestamp();

            const previousButtonQuestions = new ButtonBuilder()
                .setCustomId("previousbtn")
                .setLabel("Previous")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("⬅️");

            const nextButtonQuestions = new ButtonBuilder()
                .setCustomId("nextbtn")
                .setLabel("Next")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("➡️");

            if(page === 0){
                previousButtonQuestions.setDisabled(true);
            }
            else{
                previousButtonQuestions.setDisabled(false);
            }
            if((page+1) * 5 < nbSong){
                nextButtonQuestions.setDisabled(false);
            }
            else{
                nextButtonQuestions.setDisabled(true);
            }

            const row = new ActionRowBuilder()
                .addComponents(previousButtonQuestions, nextButtonQuestions);

            const listEmbed = EmbedBuilder.from(newEmbed);

            for(let index = (page * 5) ; index < nbSong && index < 5 + (page * 5) ; index++){
                //listEmbed.addFields({name: "name", value: "value", inline: false});
                //console.log(`${index} VS ${mapMusique.mapSong.get(serveurDiscord)["index"]}`);
                if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status === "playing" && mapMusique.mapSong.get(serveurDiscord)["index"] === index){
                    const timeStampATM = Math.floor(Date.now() / 1000);
                    const timeStampOnPlay = mapMusique.mapSong.get(serveurDiscord)["timeStampOnPlay"];
                    const durationMusic = songs[index].duration;
                    const tempsRestant = durationMusic - (timeStampATM - timeStampOnPlay);
                    //console.log("tempsRestant = " + durationMusic +  " - (" + timeStampATM + " - " + timeStampOnPlay + ")");

                    listEmbed.addFields({name: `${index+1} - ${songs[index].title}` ,value: `(en train de jouer) [temps restant : ${secondsToHms(tempsRestant)}]`});
                }
                else{
                    listEmbed.addFields({name: `${index+1} - ${songs[index].title}` ,value: `\u200b`});
                }
            }
            const response = await interaction.editReply({ embeds: [listEmbed], components: [row]});
            try {
                const reponseBouton = await response.awaitMessageComponent({time: 30_000 });

                if (reponseBouton.customId === 'nextbtn') {
                    return await require("./liste").execute(interaction, interaction.commandName, page+1, client, Discord);
                } else if (reponseBouton.customId === 'previousbtn') {
                    return await require("./liste").execute(interaction, interaction.commandName, page-1, client, Discord);
                }
            } catch (e) {
                return await interaction.editReply({ content: 'Temps écoulé pour changer de page (30 sec)', components: [] });
            }
        }
        else{
            return interaction.editReply({content: `Il n\'y a aucune musique dans la liste :c`});
        }

        function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);

            var hDisplay = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
            return hDisplay + mDisplay + sDisplay;
        }
    }
}