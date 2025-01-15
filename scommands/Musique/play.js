//const ytdl = require('ytdl-core');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const {
    joinVoiceChannel,
    createAudioResource,
    AudioPlayerStatus
} = require('@discordjs/voice');
const voice = require('@discordjs/voice');

//YTDL OPTIONS
//const cookie = require('../../JSON/config.json');

//const agent = ytdl.createAgent(require('../../JSON/config.json'));


const fs = require('fs');
/*const stream = require('stream');
const ffmpeg = require('fluent-ffmpeg');*/

const mapMusique = require('../MusiqueAux/stockageMusique.js');
const idlePlayer = require('../MusiqueAux/idlePlayer.js');

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Permet de jouer toutes les musiques de la file')
        .addStringOption(option =>
            option.setName('service')
                .setDescription('Choisir sur quel service le bot doit chercher la musique')
                .setRequired(true)
                .addChoices(
                    { name: 'Youtube', value: 'youtube' },
                    { name: 'Spotify', value: 'spotify' }))
        .addStringOption(option =>
            option.setName('musique')
                .setDescription('Permet de jouer une musique/playlist provenant de youtube (via son nom ou son lien)')
                .setRequired(true))
        .setDMPermission(false),

    async execute(interaction, commandName, autreArgs, client, Discord) {

        //Init serveurDiscord
        let serveurDiscord;

        let author = null;
        if(interaction !== null){
            serveurDiscord = interaction.guild.id;
            author = interaction.user;
        }
        else if(autreArgs){
            serveurDiscord = autreArgs;
        }
        else{
            return console.log("ALED J AI PAS TROUVÉ TON SERVEUR DISCORD");
        }

        //console.log(author);
        if(author.id !== '269823993899384832') return interaction.reply({content: 'Cette commande est temporairement indisponible, désolé :c', ephemeral: true});

        //Init Global Const
        const chemin = `./FolderContainer/Songs/${serveurDiscord}`;
        //const COOKIE = cookie;

        //Coin IdlePlayer
        if (commandName === "idlePlayer" && !voice.getVoiceConnection(serveurDiscord)) return console.log("IdlePlayer -> Le bot n'était pas dans un chan");
        if (commandName === "idlePlayer") return playPlaylistMusique(false);

        //init interaction Consts
        const voiceChannel = interaction.member.voice.channel;
        const serviceArg = interaction.options.getString('service');
        const musiqueArgs = interaction.options.getString('musique');

        //Checking for the voicechannel and permissions
        if (!voiceChannel) return interaction.reply({content: 'Vous avez besoin d\'être dans un channel vocal pour utiliser cette commande !', ephemeral: true});
        //const permissions = voiceChannel.permissionsFor(client.user);
        if (!voiceChannel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.Connect)) return interaction.reply({content: 'Le bot n\'a pas la premisson de rejoindre le channel où tu te trouves :c', ephemeral: true});
        if (!voiceChannel.permissionsFor(client.user).has(Discord.PermissionsBitField.Flags.Speak)) return interaction.reply({content: 'Le bot n\'a pas la premisson de parler dans le channel vocale :c', ephemeral: true});

        //Init ext file
        mapMusique.execute(serveurDiscord, true);
        idlePlayer.execute(interaction, serveurDiscord, client, Discord);

        //Coin qplay
        if (commandName === "qplay") return playPlaylistMusique(false);

        //Coin skip
        if (commandName === "skip") return playPlaylistMusique(true);

        //Coin remove
        if (commandName === "remove") return playPlaylistMusique(true);

        //Check si le bot est déja co
        if(mapMusique.mapSong.get(serveurDiscord)["connection"]){
            //Check si bot même channel vocal que utilisateur
            if (voiceChannel.id !== mapMusique.mapSong.get(serveurDiscord)["connection"].joinConfig.channelId){
                mapMusique.mapSong.get(serveurDiscord)["connection"].destroy();
                createConnection(serveurDiscord);
                //console.log("création d'une connection déjà existante");
            }
            //console.log("connection déjà existante");
        }
        else{
            //console.log("création d'une connection inexistante");
            createConnection(serveurDiscord);
        }

        if(!fs.existsSync(chemin)) {
            console.log(`Le dossier du discord \"${interaction.guild.name}\" (${serveurDiscord}) n\'existe pas, je t'en crée un tout de suite`);

            fs.mkdir(chemin, (err) => {
                if(err){
                    console.log(`Une erreur est survenue lors de la création d'un dossier de chanson`);
                    return;
                }else{
                    fs.writeFile(mapMusique.mapSong.get(serveurDiscord)["JSONPath"], JSON.stringify({loopingLevel: 0, index: 0, nbSong: 0, songs: []}), (err) => {
                        if (err) throw err;

                        console.log("Le fichier Json a été créé avec succès");
                    });
                }

                console.log(`Dossier créé avec succès`);
            });
        }

        let objJs = mapMusique.mapSong.get(serveurDiscord);
        objJs.isStopped = false;
        objJs.lastTextChannel = interaction.channel;
        mapMusique.mapSong.set(serveurDiscord, objJs);

        let songs = mapMusique.mapSong.get(serveurDiscord)["songs"];
        if(songs === null) {
            songs = [];
        }

        if(serviceArg === 'youtube'){
            const isSong = url => ytdl.validateURL(url);
            const isPlaylist = url => ytpl.validateID(url);

            if(isSong(musiqueArgs)){
                ytdl.getBasicInfo(musiqueArgs).then(item => {
                    const title = songFriendly(item.videoDetails.title);
                    addSongs(musiqueArgs, "youtube", title, item.videoDetails.lengthSeconds, item.videoDetails.thumbnails[item.videoDetails.thumbnails.length - 1].url);
                    if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status === "playing"){
                        interaction.reply({content: `:open_mouth: ${author} a ajouté : _${title}_ dans la file d'attente !`, ephemeral: false});
                        //dlMusic(musiqueArgs, title, `${chemin}/${title}.mp3`, item.videoDetails.lengthSeconds);
                    }
                    else{
                        chargerMedia(musiqueArgs, "youtube", title, parseInt(item.videoDetails.lengthSeconds), author);
                        //let objJs = mapMusique.mapSong.get(serveurDiscord);
                        //console.log(objJs.index);
                        //objJs.index = objJs.nbSong;
                        //mapMusique.mapSong.set(serveurDiscord, objJs);
                    }
                });
            }
            else if (isPlaylist(musiqueArgs)){
                ytpl(musiqueArgs, {limit: Infinity}).then(items => {
                    for (const item of items.items) {
                        let title = songFriendly(item.title);

                        //dlMusic(item.url, title, pathFile, item.durationSec);
                        addSongs(item.url, "youtube", title, item.durationSec, item.bestThumbnail.url);
                    }
                    console.log(`Mise dans la file de ${items.items.length} musiques avec la playlist : ${musiqueArgs} de ${author.tag}`);

                    interaction.reply({content:`:open_mouth: ${author} a ajouté(s) ${items.items.length} musique(s) dans la file !`, ephemeral: false});

                    setTimeout(() => {
                        playPlaylistMusique(false);
                    }, 5000);
                });
            }
            else {
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);

                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                const video = await videoFinder(musiqueArgs);

                if(video){
                    const title = songFriendly(video.title);
                    //console.log(video);
                    addSongs(video.url, "youtube", title, video.duration.seconds, video.thumbnail);
                    //console.log(mapMusique.mapSong.get(serveurDiscord)["player"].state.status);
                    if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status === "playing"){
                        interaction.reply({content: `:open_mouth: ${author} a ajouté : _${title}_ dans la file d'attente !`, ephemeral: false});
                        //dlMusic(video.url, title, `${chemin}/${title}.mp3`, video.duration.seconds);
                    }
                    else{
                        chargerMedia(video.url, "youtube", title, video.duration.seconds, author);
                        //let objJs = mapMusique.mapSong.get(serveurDiscord);
                        //console.log(objJs.index);
                        //objJs.index = objJs.nbSong;
                        //mapMusique.mapSong.set(serveurDiscord, objJs);

                    }

                } else {
                    return interaction.reply({content: 'Aucun résultat n\'a été trouvé :c', ephemeral: true});
                }
            }
        }
        else if(serviceArg === "spotify"){
            //code process pour spotify
            return interaction.reply({content: "pas encore implémenté, sorry, soon !", ephemeral: true});
        }
        else{
            return interaction.reply({content: 'Une erreur est survenue au niveau du service choisis, ' +
                'merci de contacter le propriétaire (Samido#6725) pour transmettre le plus d\'informations possible sur les circonstances qui ont menées à cette erreur', ephemeral: true});
        }

        function playPlaylistMusique(fromSkip) {
            if(mapMusique.mapSong.get(serveurDiscord)["player"].state.status !== AudioPlayerStatus.Playing || fromSkip) {
                let songs = mapMusique.mapSong.get(serveurDiscord)["songs"];
                if (songs.length > 0) {
                    let index = mapMusique.mapSong.get(serveurDiscord)["index"];
                    //console.log(songs);
                    const dureeMusique = songs[index]["duration"];
                    const titreMusique = songs[index]["title"];
                    const url = songs[index]["url"];
                    const service = songs[index]["service"];

                    updateSongs(null);

                    chargerMedia(url, service, titreMusique, dureeMusique, (author !== null ? author : null));

                } else {
                    return interaction.reply({content: 'Aucune musique n\'a été trouvée :c', ephemeral: true});
                }
            }
            else{
                console.log("Pas dispo pour next");
            }
        }

        /*function dlMusic(url, title, pathFile, duration){
            ytdl(url, {filter: 'audioonly', dlChunkSize: 0, quality: 'highestaudio', requestOptions: {
                    headers: {cookie: COOKIE}}
            }).pipe(fs.createWriteStream(pathFile));
        }*/

        function chargerMedia(url, service, title, duration, authorRequest) {
            if(author !== null){
                if(!interaction.replied)
                    interaction.reply({content: `:mechanic: Je suis en train de charger la musique : _${title}_ demandé par **${author}**, je te demande un tout petit peu de patience !`, ephemeral: false});
                else if(interaction !== null){
                    interaction.followUp({content: `:mechanic: Je suis en train de charger la musique : _${title}_ demandé par **${author}**, je te demande un tout petit peu de patience !`, ephemeral: false});
                }
            }
            //console.log(interaction);
            let streamYtdl;
            let streamSpotify;

            let promesse = new Promise((resolve, reject) => {
                switch(service){
                    case "youtube":

                        streamYtdl = ytdl(url, {filter: 'audioonly', quality: 'lowestaudio'/*,
                            requestOptions: {
                                headers: {cookie: COOKIE},
                            }*/
                        });/*.on('end', () => {
                            //fin du téléchargement
                        });*//*.pipe(fs.createWriteStream(pathFile));*/
                        resolve('resolved');
                        break;
                    case "spotify":
                        interaction.channel.send("pas encore implémenté, sorry, soon !");
                        resolve('resolved');
                        break;
                    default:
                        return interaction.reply({content: 'Une erreur est survenue au niveau du service choisis, ' +
                            'merci de contacter le propriétaire (Samido#6725) pour transmettre le plus d\'informations possible sur les circonstances qui ont menés à cette erreur', ephemeral: true});
                }
            });

            switch (service){
                case "youtube":
                    promesse.then(playMusic(title, streamYtdl, duration, authorRequest), null);
                    break;
                case "spotify":
                    //promesse.then(playMusic(title, streamSpotify, duration, authorRequest), null);
                    interaction.channel.send("pas encore implémenté, sorry, soon !");
                    break;
                default:
                    return interaction.reply({content: 'Une erreur est survenue au niveau du service choisis, ' +
                        'merci de contacter le propriétaire (Samido#6725) pour transmettre le plus d\'informations possible sur les circonstances qui ont menés à cette erreur', ephemeral: true});
            }
        }

        function playMusic(title, stream, duration, authorRequest){
            if (authorRequest !== null)
                console.log(`ytdl a lancé la musique : ${title} par ${authorRequest.tag}`);

            let indexActuel = 0;
            for(let i = 0; i < mapMusique.mapSong.get(serveurDiscord)["songs"].length; i++){
                if(title === mapMusique.mapSong.get(serveurDiscord)["songs"][i]["title"]){
                    //console.log("trouvé");
                    indexActuel = i;
                }
            }
            //console.log(indexActuel);
            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.timeStampOnPlay = Math.floor(Date.now() / 1000);
            objJs.index = indexActuel;
            objJs.isStopped = false;
            mapMusique.mapSong.set(serveurDiscord, objJs);

            const resource = createAudioResource(stream);
            mapMusique.mapSong.get(serveurDiscord)["player"].play(resource);
            mapMusique.mapSong.get(serveurDiscord)["connection"].subscribe(mapMusique.mapSong.get(serveurDiscord)["player"]);

            mapMusique.mapSong.get(serveurDiscord).lastTextChannel.send(`:musical_note: Je diffuse actuellement : ***${title}*** ${authorRequest !== null ? (authorRequest.id === "269823993899384832" ? "pour mon maître" : "") : ""}`)
                .then(m => {
                    setTimeout(() => {
                        m.delete();
                        //console.log(mapMusique.mapSong.get(serveurDiscord).idlePlayer);
                    }, duration * 1000);
                });
        }

        function addSongs(url, service, title, duration, miniature){
            let song = {url: url, service: service, title: title, duration: duration, miniature};
            updateSongs(song);
        }

        function updateSongs(song){

            if(song){
                let objJs = mapMusique.mapSong.get(serveurDiscord);
                let isDuplicate = false;
                for(let i = 0; i < objJs.songs.length; i++){
                    if(objJs.songs[i].url === song.url || objJs.songs[i].title === song.title){
                        isDuplicate = true;
                    }
                }

                if(!isDuplicate){
                    objJs.songs.push(song);
                    objJs.nbSong = ++objJs.nbSong;
                    mapMusique.mapSong.set(serveurDiscord, objJs);
                }
            }

            let newObject = {loopingLevel: mapMusique.mapSong.get(serveurDiscord)["loopingLevel"],
                index: mapMusique.mapSong.get(serveurDiscord)["index"],
                nbSong: mapMusique.mapSong.get(serveurDiscord)["nbSong"],
                songs: mapMusique.mapSong.get(serveurDiscord)["songs"]};

            fs.writeFile(mapMusique.mapSong.get(serveurDiscord)["JSONPath"], JSON.stringify(newObject), function (err, result) {
                if (err) console.log('error', err);
            });
            //console.log(mapMusique.mapSong.get(serveurDiscord)["nbSong"]);
        }

        function createConnection(serveurDiscord){

            let objJs = mapMusique.mapSong.get(serveurDiscord);
            objJs.connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: serveurDiscord,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            mapMusique.mapSong.set(serveurDiscord, objJs);
        }

        function songFriendly(str){
            return str.replaceAll('\"', ' ')
                .replaceAll('\:', ' - ')
                .replaceAll('\;', ' - ')
                //.replaceAll('\'', ' ')
                .replaceAll('\\', ' ')
                .replaceAll('\/', ' ')
                .replaceAll('\|', ' ')
                .replaceAll('\*', ' ')
                .replaceAll('\<', ' ')
                .replaceAll('\>', ' ')
                //.replaceAll('\-', ' ')
                //.replaceAll('\_', ' ')
                .replaceAll('\?', ' ');
            //.replaceAll(/[^\x00-\x7F]/g, "");
        }
    }
}
