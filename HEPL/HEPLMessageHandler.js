const badwords = require("./badwordsHEPL.json");
const goodwords = require("./goodwordsHEPL.json");

module.exports = {
    async executeHEPLEvents(client, Discord, args) {

        client.on('messageCreate', async (message) =>
        {
            //console.log(message.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.SendMessages));            
            if(message.guildId !== "1302045730210451466" || message.author.id === "269823993899384832") return;

            if(message.author.bot || !message.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.SendMessages) || !message.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageMessages) || !message.channel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.ManageWebhooks)) return;
            
            if(message.channel.id === "1302046416796913704") return message.delete();
            
            let messageBadWords = badwords.some(badword => message.content.toLowerCase().includes(badword));
            if(messageBadWords){
                //console.log(message.guild.members.cache.get(message.author.id));
                let userInfoFromMessage = await message.guild.members.cache.get(message.author.id);
                //console.log(user.nickname)

                let nouveauMessageArray = message.content.split(" ");
                let nouveauMessage = "";
                nouveauMessageArray.forEach(word => //FAUDRA OPTI
                    {
                        if(badwords.includes(word.toLowerCase()))
                            nouveauMessage += " " + goodwords[Math.floor(Math.random()*goodwords.length)];
                        else
                            nouveauMessage += " " + word;
                    });
                
                //console.log(nouveauMessage);
                //console.log(message.author.displayAvatarURL({dynamic: true}));
                message.channel.createWebhook({name: userInfoFromMessage.nickname ?? message.author.displayName, avatar: message.author.displayAvatarURL({dynamic: true})})
                    //.then(webhook => webhook.edit({channel: message.channel}))
                        .then(webhook => {
                            return webhook.send(nouveauMessage).then(message => webhook); // returns the webhook, rather than the message to the next .then call
                        })
                        .then(webhook => webhook.delete()).catch(console.error);

                message.delete();
            }
        });
    }
}