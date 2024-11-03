const {EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    async execute(channel, rolesMap, title, desc, client, Discord) {
        const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x00FFFF);

        if(desc)
            embed.setDescription(desc);
        
        const row = new ActionRowBuilder()

        for(const [k, v] of rolesMap)
        {
            row.addComponents(new ButtonBuilder()
            .setCustomId("role-"+ k)
            .setLabel(v.name)
            .setStyle(ButtonStyle.Secondary));
        }

        try {
            const webhooks = await channel.fetchWebhooks();
            const webhook = webhooks.find(wh => wh.token);
            
            let clientAvatar = null;
            //console.log(client.user.avatar);
            if(client.user.avatar)
                clientAvatar = `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`;

            //console.log(clientAvatar);
            //console.log(client.user);
            if (!webhook) {
                console.log('[SendReactionButtons.js] Pas de webhook détecté, j\'en crée un!');
                channel.createWebhook({
                    name: "Selection Role",
                    avatar: clientAvatar,
                })
                .then(webhook => 
                    {
                        //console.log(webhook.id);
                        webhook.send({
                            name: client.user.username,
                            avatarURL: clientAvatar,
                            //content: 'Webhook test',
                            embeds: [embed],
                            components: [row]
                        })
                        .then(msg => {
                            //console.log(msg.id);
                        });
                    })
                .catch(console.error);
            }
            else{
                webhook.send({
                    name: client.user.username,
                    avatarURL: clientAvatar,
                    //content: 'Webhook test',
                    embeds: [embed],
                    components: [row]
                })
                .then(msg => {
                    //console.log(msg.id);
                });
            }
        } catch (error) {
            console.error('[InitHepl.js] Error trying to send a message: ', error);
        }
    }
}