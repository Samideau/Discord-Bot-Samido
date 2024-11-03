const { ActionRowBuilder, SlashCommandBuilder, EmbedBuilder, RoleSelectMenuBuilder, ChannelType , ComponentType, PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createreactionbutton")
        .setDescription("Permet de créer un message qui attribue un role lorsqu'on clique sur un bouton")
        .addIntegerOption(option =>
            option.setName("nombreboutons")
                .setDescription("Nombre de boutons (roles) qu'il y aura en dessous du message (max 5 par message)")
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel dans lequel le bot doit envoyer le/les messages")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option => 
            option.setName("title")
                .setDescription("Titre du message pour le choix des roles")
                .setRequired(false))
        .addStringOption(option => 
            option.setName("description")
                .setDescription("Description du message pour le choix des roles")
                .setRequired(false))
        .setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {
        const nbButtons = interaction.options.getInteger('nombreboutons');
        const titleEmbed = interaction.options.getString('title') ?? "Choisis ton/tes roles !";
        const descEmbed = interaction.options.getString('description');
        const channel = interaction.options.getChannel("channel");

        if(!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) return interaction.reply({content: "Le bot n'a pas la permission pour écrire dans le channel cible", ephemeral: true});
        if(!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content: "Le bot n'a pas la permission pour ajouter/retirer des rôles", ephemeral: true});
        if(!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.ManageWebhooks)) return interaction.reply({content: "Le bot n'a pas la permission pour gérer les webhooks", ephemeral: true});
        await interaction.deferReply({ephemeral: true});

        const embed = new EmbedBuilder();
        const select = new RoleSelectMenuBuilder();

        embed.setTitle("Selectionne le/les roles que tu veux donner");

        select.setCustomId('RolePicker').setPlaceholder('Selectionner les roles à picks').setMinValues(nbButtons).setMaxValues(nbButtons);

        const row = new ActionRowBuilder().addComponents(select);

        const response = await interaction.editReply({embeds: [embed], components: [row]});

        const collector = await response.createMessageComponentCollector({ componentType: ComponentType.RoleSelect, time: 600_000, errors: ['time']});

        collector.on('collect', async i => {
            //console.log(i.roles);
            if(!CheckBotCanGiveAllRole(i.roles))
            {
                embed.setDescription("1 ou plusieurs roles sélectionnés ne peuvent pas être donné/retiré par le bot, merci de resélectionner des roles valides ou de modifier la hiérarchie des roles");
                i.update({embeds: [embed], components: [row]})
            }
            else
            {
                interaction.deleteReply();
                return require("../AdminCommandsAux/SendReactionButtons.js").execute(channel, i.roles, titleEmbed, descEmbed, client, Discord);
            }
        });

        collector.on("end", collected => {
            //console.log(collector._endReason);
            if(collector._endReason === "time" && interaction)
                interaction.deleteReply();
            return;
        });

        function CheckBotCanGiveAllRole(roleMap)
        {
            for(const [k,v] of roleMap)
            {
                if(!v.editable)
                    return false;
            }
            return true;
        }
    }
}