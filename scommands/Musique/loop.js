const { SlashCommandBuilder } = require('discord.js');
const mapMusique = require('../MusiqueAux/stockageMusique.js');
const voice = require('@discordjs/voice');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('fais boucler la chanson actuelle')
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("Le mode de loop désiré")
                .addChoices(
                    {name: 'Désactiver', value: '0'},
                    {name: 'Playlist', value: '1'},
                    {name: 'Musique Actuelle', value: '2'})
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const serveurDiscord = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;
        const author = interaction.user;

        const mode = interaction.options.getString("mode");

        /*console.log(voiceChannel.id);
        console.log("VS");
        console.log(voice.getVoiceConnection(serveurDiscord).joinConfig.channelId);*/
        if (!voice.getVoiceConnection(serveurDiscord) || voiceChannel.id !== voice.getVoiceConnection(serveurDiscord).joinConfig.channelId)
            return interaction.reply({content: 'Vous avez besoin d\'être dans le même channel vocal que le bot pour utiliser cette commande !', ephemeral: true});

        mapMusique.execute(serveurDiscord, false);

        let objJs = mapMusique.mapSong.get(serveurDiscord);

        const looping = parseInt(mode, 10);

        if(objJs.loopingLevel === looping){
            return interaction.reply({content: 'Le mode sélectioné ne peut pas être le même que celui qui est actif', ephemeral: true});
        }

        objJs.loopingLevel = looping;

        updateJSON(objJs.loopingLevel);

        //console.log("après : " + objJs.loopingLevel);
        mapMusique.mapSong.set(serveurDiscord, objJs);
        switch (objJs.loopingLevel) {
            case 0:
                interaction.reply({content: `:eyes: ${author} a mis la lecture en boucle sur : ***désactivée***`, ephemeral: false});
                break;
            case 1:
                interaction.reply({content: `:eyes: ${author} a mis la lecture en boucle de la ***playlist***`, ephemeral: false});
                break;
            case 2:
                interaction.reply({content: `:eyes: ${author} a mis la lecture en boucle de la ***musique actuelle***`, ephemeral: false});
                break;
            default:
                return interaction.reply({content:`Une erreur est survenue, merci de contacter le propriétaire en disant que ce message s'est affiché (Error Looping Value)`, ephemeral: true});
        }

        function updateJSON(loopingLevel){
            fs.readFile(mapMusique.mapSong.get(serveurDiscord)["JSONPath"], 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    const oldObject = JSON.parse(data);
                    let newObject = {loopingLevel: loopingLevel,
                        index: oldObject.index,
                        nbSong: oldObject.nbSong,
                        songs: oldObject.songs};

                    fs.writeFile(mapMusique.mapSong.get(serveurDiscord)["JSONPath"], JSON.stringify(newObject), function (err, result) {
                        if (err) console.log('error', err);
                    });
                }
            });
        }
    }
}