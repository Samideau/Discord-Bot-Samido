const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(channel, titreStream, jeuStream, nameStreamer, userAvatar, imgStream) {
        //console.log("avant imgStream : " + imgStream);
        let newImageString = imgStream.replaceAll("{width}x{height}", "400x225");
        console.log("imgStream : " + newImageString);

        const watchStreamButton = new ButtonBuilder()
            .setLabel("Regarder Stream")
            .setURL(`https://www.twitch.tv/${nameStreamer}`)
            .setStyle(ButtonStyle.Link);
            //.setEmoji("⬅️");

        const row = new ActionRowBuilder()
            .addComponents(watchStreamButton);

        const embedMessage = new EmbedBuilder()
            .setColor('#05ff00')
            .setTitle(titreStream)
            .setURL(`https://www.twitch.tv/${nameStreamer}`)
            .setAuthor({ name:`${nameStreamer} est en train de streamer sur Twitch !`, iconURL: userAvatar, url: `https://www.twitch.tv/${nameStreamer}`})
            //.setDescription('Liste des commandes liées à la musique disponibles')
            //.setThumbnail(client.user.avatarURL)
            .addFields(
                { name: 'Game', value: jeuStream},
                //{ name: '???', value: '???', true},
            )
            //.addField('Inline field title', 'Some value here', true)
            .setImage(`${newImageString}`)
            .setTimestamp()
            .setFooter({text: 'Bot Samido'});

        return channel.send({content: "@here Je pars en stream, moi jdis ça, jdis rien... :eyes:", embeds: [embedMessage], components: [row]});
    }
}