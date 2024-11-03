const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('J\'ai besoin d\'aide D:')
        .addStringOption(option =>
            option.setName('catégorie')
                .setDescription('catégorie d\'aide')
                .setRequired(false)
                .addChoices(
                    { name: 'Musique', value: 'musique' },
                    { name: 'Fun', value: 'fun' },
                    { name: 'Jeux', value: 'jeu' },
                    { name: 'Autre', value: 'autre' }
                )),

    async execute(interaction, commandName, autreArgs, client, Discord) {
        const categorie = interaction.options.getString('catégorie');

        if(categorie === 'musique'){
            afficherHelpMusique();
        }
        else if(categorie === 'fun'){
            afficherHelpFun();
        }
        else if(categorie === 'jeu'){
            afficherHeplJeux();
        }
        else if(categorie === 'autre'){
            afficherHelpAutre();
        }
        else{
            afficherHelpGeneral();
        }
        /* ------------------------------------------------------------------------------------------------- */
        function afficherHelpMusique(){
            // Indique les commandes lié à la musique.
            const musiqueEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle('Fonctionnalités du Bot - Musique')
                //.setURL('https://discord.js.org/')
                //.setAuthor('Samido', /*client.users.cache.find(u => u.tag === 'Samido#6725').avatarURL, 'https://discord.js.org'*/)
                .setDescription('Liste des commandes liées à la musique disponibles')
                //.setThumbnail(client.user.avatarURL)
                .addFields(
                    { name: '/play {service} {url/mots_clés}', value: 'Permet de jouer une musique provenant du service indiqué (via son nom ou son lien)'},
                    { name: '/qplay', value: 'Permet de jouer la musique actuelle de la playlist'},
                    { name: '/skip {N° de la musique}(optionnel)', value: 'Permet de jouer la musique suivante dans la file ou la musique indiquée'},
                    { name: '/remove {N° de la musique}', value: 'Permet de retirer de la liste la musique indiquée'},
                    { name: '/stop', value: 'Le bot arrête complètement la musique qui est en cours de lecture'},
                    { name: '/loop {mode}', value: 'Permet de sélectionner le mode de lecture du bot'},
                    { name: '/liste', value: 'Permet d\'afficher toutes les musiques dans la file'},
                    //{ name: '\u200B', value: '\u200B' }, -> permet de faire un espace
                    { name: '/pause', value: 'Permet de mettre la pause sur la musique actuelle'},
                    { name: '/unpause', value: 'Permet de reprendre là où s\'était arrêtée la musique actuelle'},
                    { name: '/leave', value: 'Le bot vous dis au revoir avant de partir'},
                    { name: '/help {musique}', value: 'Permet d\'afficher cette aide'},
                )
                //.addField('Inline field title', 'Some value here', true)
                //.setImage('https://static.zerochan.net/Dragonmaid.full.3102494.png')
                .setTimestamp();
            //.setFooter('', 'https://i.imgur.com/AfFp7pu.png');

            return interaction.reply({ embeds: [musiqueEmbed], ephemeral: true});
        }

        function afficherHelpFun(){
            // Indique les commandes lié au fun.
            const funEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle('Fonctionnalités du Bot - Fun')
                //.setURL('https://discord.js.org/')
                //.setAuthor('Samido', /*client.users.cache.find(u => u.tag === 'Samido#6725').avatarURL, 'https://discord.js.org'*/)
                .setDescription('Liste des commandes liées au fun disponibles')
                //.setThumbnail(client.user.avatarURL)
                .addFields(
                    { name: '/tgif {utilisateur} {categorie}', value: 'Permet d\'envoyer un gif qui effectue un action sur un utilisateur'},
                    { name: '/gif {categorie}', value: 'Permet d\'envoyer un gif d\'humeur'},
                    { name: '/help fun', value: 'Permet d\'afficher cette aide'},
                )
                //.addField('Inline field title', 'Some value here', true)
                //.setImage('https://ms.yugipedia.com/8/86/DragonmaidHospitality-LOD2-JP-VG-artwork.png')
                .setTimestamp();
            //.setFooter('', 'https://i.imgur.com/AfFp7pu.png');

            return interaction.reply({ embeds: [funEmbed], ephemeral: true});
        }

        function afficherHeplJeux(){
            // Indique les catégories.
            const jeuxEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle('Fonctionnalités du Bot - Jeux')
                //.setURL('https://discord.js.org/')
                //.setAuthor('Samido', /*client.users.cache.find(u => u.tag === 'Samido#6725').avatarURL, 'https://discord.js.org'*/)
                .setDescription('Listes des commandes liées à des jeux')
                //.setThumbnail(client.user.avatarURL)
                .addFields(
                    { name: '/giinfo {type} {recherche} {option}(optionnel)', value: 'Permet d\'effectuer une recherche dans la base de donnée de Genshin Impact'},
                    { name: '/giuserinfo {uid}', value: 'Permet d\'afficher le profil Genshin Impact de l\'uid indiqué'},
                    { name: '/hsrinfo {type} {recherche} {option}(optionnel)', value: 'Permet d\'effectuer une recherche dans la base de donnée d\'Honkai Star Rail (BIENTOT DISPONIBLE)'},
                    { name: '/hsruserinfo {uid}', value: 'Permet d\'afficher le profil Honkai Star Rail de l\'uid indiqué'},
                    { name: '/hoyocodes {jeu} {code(s)}', value: 'Permet d\'envoyer dans le channel où la commande a été posté, les liens permettant de valider le(s) code(s) sur le jeu indiqué'},
                    { name: '/favgamecharacter {jeu} {catégorie}...', value: 'Permet de générer une vidéo avec les choix fait via la commande (1 min 30 de cd)'},
                    { name: '/ps2showmapactive {serveur}(optionnel)', value: 'Permet d\'afficher le(s) map(s) active(s) sur le serveur choisis (par défaut, c\'est le serveur Miller qui est sélectionné'},
                    { name: '/help jeux', value: 'Permet d\'afficher cette aide'}
                )
                //.addField('Inline field title', 'Some value here', true)
                //.setImage('https://external-preview.redd.it/EcLVDkOfGKLjPF3nE4qqbHWwubRMZdbD8u9-dq8M0Mc.jpg?auto=webp&s=1f4f4bc210d01e9933fbf61ff54750b855317bfc')
                .setTimestamp();
            //.setFooter('', 'https://i.imgur.com/AfFp7pu.png');

            return interaction.reply({ embeds: [jeuxEmbed], ephemeral: true});
        }

        function afficherHelpGeneral(){
            // Indique les catégories.
            const generalEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle('Fonctionnalités du Bot - Générale')
                //.setURL('https://discord.js.org/')
                //.setAuthor('Samido', /*client.users.cache.find(u => u.tag === 'Samido#6725').avatarURL, 'https://discord.js.org'*/)
                .setDescription('Liste des catégories d\'aides disponibles')
                //.setThumbnail(client.user.avatarURL)
                .addFields(
                    { name: '/help musique', value: 'Permet d\'afficher les commandes lié à la musique'},
                    { name: '/help fun', value: 'Permet d\'afficher les commandes lié au fun'},
                    { name: '/help jeux', value: 'Permet d\'afficher les commandes lié aux jeux'},
                    { name: '/help autre', value: 'Permet d\'afficher les commandes qui ne possèdent aucune catégorie'},
                )
                //.addField('Inline field title', 'Some value here', true)
                //.setImage('https://i.ibb.co/4mm1Gg5/welcome.jpg')
                .setTimestamp();
            //.setFooter('', 'https://i.imgur.com/AfFp7pu.png');

            return interaction.reply({ embeds: [generalEmbed], ephemeral: true});
        }

        function afficherHelpAutre(){
            // Indique les catégories.
            const autreEmbed = new EmbedBuilder()
                .setColor('#05ff00')
                .setTitle('Fonctionnalités du Bot - Autre')
                //.setURL('https://discord.js.org/')
                //.setAuthor('Samido', /*client.users.cache.find(u => u.tag === 'Samido#6725').avatarURL, 'https://discord.js.org'*/)
                .setDescription('Listes des commandes qui ne possèdent aucune catégorie')
                //.setThumbnail(client.user.avatarURL)
                .addFields(
                    { name: '/invite', value: 'Permet de recevoir le lien d\'invitation du bot en message privé'},
                    { name: '/bugreport {texte}', value: 'Permet de m\'envoyer un texte indiquant une erreur que vous auriez rencontrer en utilisant ce bot'},
                    { name: '/translate {vers} {texte} {de}(optionnel)', value: 'Permet de traduire le texte indiqué vers la langue choisie (par défaut, cela détecte automatique la langue du texte d\'origine)'},
                    { name: '/help autre', value: 'Permet d\'afficher cette aide'}
                )
                //.addField('Inline field title', 'Some value here', true)
                //.setImage('https://external-preview.redd.it/EcLVDkOfGKLjPF3nE4qqbHWwubRMZdbD8u9-dq8M0Mc.jpg?auto=webp&s=1f4f4bc210d01e9933fbf61ff54750b855317bfc')
                .setTimestamp();
            //.setFooter('', 'https://i.imgur.com/AfFp7pu.png');

            return interaction.reply({ embeds: [autreEmbed], ephemeral: true});
        }
    }
}