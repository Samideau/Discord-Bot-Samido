const { EmbedBuilder, SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("swapchannel")
        .setDescription("Permet d'échanger 2 channels de place")
        .addChannelOption(option =>
            option.setName("1erchannel")
                .setDescription("Sélectionne le 1er channel à swap")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("2èmechannel")
                .setDescription("Sélectionne le 2ème channel à swap")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        //.setDefaultMemberPermissions(0) //administrator only
        .setDMPermission(false),
    async execute(interaction, cmdName, autreArg, client, Discord) {
        if(!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)){
            return interaction.reply({content: 'Le bot n\'a pas la premisson de modifier les channels', ephemeral: true});
        }

        const firstChannel = interaction.options.getChannel('1erchannel');
        const secondChannel = interaction.options.getChannel('2èmechannel');

        const tempName = firstChannel.name;

        firstChannel.setName(secondChannel.name)
            .then(() => secondChannel.setName(tempName))
            .then(() => {
                console.log(`Opération réussie !`);
                return interaction.reply("Les noms des channels ont étés échangés !");
            })
            .catch((error) => {
                console.error(error);
                return interaction.reply("Oups, ça ne fonctionne pas ! Demande à Samido et il ne saura pas pourquoi.");
            });
    }
/**
<ref *2> VoiceChannel {
    type: 2,
    guild: <ref *1> Guild {
        id: '717700253217849394',
        name: 'BeauPère Hub',
        icon: '82559178dd84d258c4b4ad167ec4caa5',
        features: [
            'THREE_DAY_THREAD_ARCHIVE',
            'ANIMATED_ICON',
            'SOUNDBOARD',
            'INVITE_SPLASH'
        ],
            commands: GuildApplicationCommandManager {
            permissions: [ApplicationCommandPermissionsManager],
                guild: [Circular *1]
        },
        members: GuildMemberManager { guild: [Circular *1] },
        channels: GuildChannelManager { guild: [Circular *1] },
        bans: GuildBanManager { guild: [Circular *1] },
        roles: RoleManager { guild: [Circular *1] },
        presences: PresenceManager {},
        voiceStates: VoiceStateManager { guild: [Circular *1] },
        stageInstances: StageInstanceManager { guild: [Circular *1] },
        invites: GuildInviteManager { guild: [Circular *1] },
        scheduledEvents: GuildScheduledEventManager { guild: [Circular *1] },
        autoModerationRules: AutoModerationRuleManager { guild: [Circular *1] },
        available: true,
        shardId: 0,
        splash: null,
        banner: null,
        description: null,
        verificationLevel: 0,
        vanityURLCode: null,
        nsfwLevel: 0,
        premiumSubscriptionCount: 2,
        discoverySplash: null,
        memberCount: 56,
        large: true,
        premiumProgressBarEnabled: false,
        applicationId: null,
        afkTimeout: 1800,
        afkChannelId: '719596083487178762',
        systemChannelId: '717700253217849397',
        premiumTier: 1,
        widgetEnabled: null,
        widgetChannelId: null,
        explicitContentFilter: 0,
        mfaLevel: 0,
        joinedTimestamp: 1671143307280,
        defaultMessageNotifications: 0,
        systemChannelFlags: SystemChannelFlagsBitField { bitfield: 0 },
        maximumMembers: 250000,
        maximumPresences: null,
        maxVideoChannelUsers: 25,
        maxStageVideoChannelUsers: 50,
        approximateMemberCount: null,
        approximatePresenceCount: null,
        vanityURLUses: null,
        rulesChannelId: null,
        publicUpdatesChannelId: null,
        preferredLocale: 'en-US',
        ownerId: '311234664272494602',
        emojis: GuildEmojiManager { guild: [Circular *1] },
        stickers: GuildStickerManager { guild: [Circular *1] }
    },
    guildId: '717700253217849394',
    parentId: '717700253217849396',
    permissionOverwrites: PermissionOverwriteManager { channel: [Circular *2] },
    messages: MessageManager { channel: [Circular *2] },
    flags: ChannelFlagsBitField { bitfield: 0 },
    id: '949778458018459741',
    name: 'Jeux',
    rawPosition: 1,
    rtcRegion: null,
    bitrate: 64000,
    userLimit: 0,
    videoQualityMode: null,
    lastMessageId: '1056230434813509733',
    rateLimitPerUser: 0
}
*/
}