const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
const ffmpeg = require('fluent-ffmpeg');
const concat = require('ffmpeg-concat');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');
const { promises } = require('fs');
var videoshow = require('videoshow');
//const Jimp = require("jimp");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("favgamecharacter")
        .setDescription("Permet d'envoyer un gif")
        .addSubcommand(subcommand =>
            subcommand
                .setName('genshin')
                .setDescription('Personnages de Genshin Impact')
                .addStringOption(option =>
                    option.setName('pyro') //6:24
                        .setDescription("Liste des personnages qui ont l'élément Pyro")
                        .addChoices(
                            {name: 'Amber', value: 'amber'}, //fais
                            {name: 'Bennett', value: 'bennett'},//fais
                            {name: 'Dehya', value: 'dehya'},//fais
                            {name: 'Diluc', value: 'diluc'}, //fais
                            {name: 'Hu Tao', value: 'hutao'}, //fais
                            {name: 'Klee', value: 'klee'}, //fais
                            {name: 'Thoma', value: 'thoma'}, //fais
                            {name: 'Xiangling', value: 'xiangling'}, //fais
                            {name: 'Xinyan', value: 'xinyan'}, //fais
                            {name: 'Yanfei', value: 'yanfei'}, //fais
                            {name: 'Yoimiya', value: 'yoimiya'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('anemo') //6.25
                        .setDescription("Liste des personnages qui ont l'élément Anémo")
                        .addChoices(
                            {name: 'Faruzan', value: 'faruzan'}, //fais
                            {name: 'Jean', value: 'jean'}, //fais
                            {name: 'Kaedehara Kazuha', value: 'kazuha'}, //fais
                            {name: 'Sayu', value: 'sayu'}, //fais
                            {name: 'Shikanoin Heizou', value: 'heizou'}, //fais
                            {name: 'Sucrose', value: 'sucrose'}, //fais
                            {name: 'Venti', value: 'venti'}, //fais
                            {name: 'Wanderer', value: 'wanderer'}, //fais
                            {name: 'Xiao', value: 'xiao'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('electro') //6:23
                        .setDescription("Liste des personnages qui ont l'élément Électro")
                        .addChoices(
                            {name: 'Beidou', value: 'beidou'},// fais
                            {name: 'Cyno', value: 'cyno'}, //fais
                            {name: 'Dori', value: 'dori'}, //fais
                            {name: 'Fischl', value: 'fischl'}, //fais
                            {name: 'Keqing', value: 'keqing'}, //fais
                            {name: 'Kujou Sara', value: 'sara'}, //fais
                            {name: 'Kuki Shinobu', value: 'shinobu'}, //fais
                            {name: 'Lisa', value: 'lisa'}, //fais
                            {name: 'Raiden Shogun', value: 'raidenshogun'}, //fais
                            {name: 'Razor', value: 'razor'}, //fais
                            {name: 'Yae Miko', value: 'yaemiko'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('dendro') //6:21
                        .setDescription("Liste des personnages qui ont l'élément Dendro")
                        .addChoices(
                            {name: 'Alhaitham', value: 'alhaitham'}, //fais
                            {name: 'Baizhu', value: 'baizhu'}, //fais
                            {name: 'Collei', value: 'collei'}, //fais
                            {name: 'Kaveh', value: 'kaveh'}, //fais
                            {name: 'Kirara', value: 'kirara'},//fais
                            {name: 'Nahida', value: 'nahida'}, //fais
                            {name: 'Tighnari', value: 'tighnari'},//fais
                            {name: 'Yaoyao', value: 'yaoyao'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('cryo') //6:21
                        .setDescription("Liste des personnages qui ont l'élément Cryo")
                        .addChoices(
                            {name: 'Aloy', value: 'aloy'}, //fais
                            {name: 'Chongyun', value: 'chongyun'}, //fais
                            {name: 'Diona', value: 'diona'}, //fais
                            {name: 'Eula', value: 'eula'}, //fais
                            {name: 'Ganyu', value: 'ganyu'}, //fais
                            {name: 'Kaeya', value: 'kaeya'}, //fais
                            {name: 'Kamisato Ayaka', value: 'ayaka'}, //fais
                            {name: 'Layla', value: 'layla'}, //fais
                            {name: 'Mika', value: 'mika'}, //fais
                            {name: 'Qiqi', value: 'qiqi'}, //fais
                            {name: 'Rosaria', value: 'rosaria'}, //fais
                            {name: 'Shenhe', value: 'shenhe'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('geo') // 5:02
                        .setDescription("Liste des personnages qui ont l'élément Géo")
                        .addChoices(
                            {name: 'Albedo', value: 'albedo'}, //fais
                            {name: 'Arataki Itto', value: 'itto'}, //fais
                            {name: 'Gorou', value: 'gorou'}, //fais
                            {name: 'Ningguang', value: 'ningguang'}, //fais
                            {name: 'Noelle', value: 'noelle'}, //fais
                            {name: 'Yun Jin', value: 'yunjin'}, //fais
                            {name: 'Zhongli', value: 'zhongli'}) //fais
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('hydro') // 4:25
                        .setDescription("Liste des personnages qui ont l'élément Hydro")
                        .addChoices(
                            {name: 'Barbara', value: 'barbara'}, //fais
                            {name: 'Candace', value: 'candace'}, //fais
                            {name: 'Kamisato Ayato', value: 'ayato'}, //fais
                            {name: 'Mona', value: 'mona'}, //fais
                            {name: 'Nilou', value: 'nilou'}, //fais
                            {name: 'Sangonomiya Kokomi', value: 'kokomi'}, //fais
                            {name: 'Tartaglia', value: 'tartaglia'}, //fais
                            {name: 'Xingqiu', value: 'xingqiu'}, //fais
                            {name: 'Yelan', value: 'yelan'}) //fais
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('starrail')
                .setDescription('Honkai Star Rail Characters')
                .addStringOption(option =>
                    option.setName('feu')
                        .setDescription("Liste des personnages qui ont l'élément Feu")
                        .addChoices(
                            {name: 'Asta', value: 'asta'},
                            {name: 'Himeko', value: 'himeko'},
                            {name: 'Hook', value: 'hook'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('vent')
                        .setDescription("Liste des personnages qui ont l'élément Vent")
                        .addChoices(
                            {name: 'Bronya', value: 'bronya'},
                            {name: 'Dan Heng', value: 'danheng'},
                            {name: 'Sampo', value: 'sampo'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('eclair')
                        .setDescription("Liste des personnages qui ont l'élément Éclair")
                        .addChoices(
                            {name: 'Arlan', value: 'arlan'},
                            {name: 'Bailu', value: 'bailu'},
                            {name: 'Jing Yuan', value: 'jingyuan'},
                            {name: 'Serval', value: 'serval'},
                            {name: 'Tingyun', value: 'tingyun'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('glace')
                        .setDescription("Liste des personnages qui ont l'élément Glace")
                        .addChoices(
                            {name: 'Gepard', value: 'gepard'},
                            {name: 'Herta', value: 'herta'},
                            {name: 'March 7th', value: 'march7h'},
                            {name: 'Pela', value: 'pela'},
                            {name: 'Yanqing', value: 'yanqing'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('quantum')
                        .setDescription("Liste des personnages qui ont l'élément Quantum")
                        .addChoices(
                            {name: 'Qingque', value: 'qingque'},
                            {name: 'Seele', value: 'seele'},
                            {name: 'Silver Wolf', value: 'silverwolf'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('physique')
                        .setDescription("Liste des personnages qui ont l'élément Physique")
                        .addChoices(
                            {name: 'Clara', value: 'clara'},
                            {name: 'Natasha', value: 'natasha'},
                            {name: 'Sushang', value: 'sushang'})
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('imaginaire')
                        .setDescription("Liste des personnages qui ont l'élément Imaginaire")
                        .addChoices(
                            {name: 'Welt', value: 'welt'})
                        .setRequired(true)))
        .setDMPermission(false),

    async execute(interaction, cmdName, autreArg, client, Discord) {
        let messageId;

        interaction.reply(`Génération de la vidéo pour ${interaction.user} en cours, veuillez patienter (cela peut prendre entre 1 et 2 minutes)`).then((m) => {
            messageId = m;
        });

        /* Durée Genshin
        * Pyro : 6:24 AdobePremierePro (APP)
        * Anémo :  6:25 APP
        * Electro : 6:23 APP
        * Dendro : 6:21 APP
        * Cryo : 6:21 APP
        * Géo : 5:02 APP
        * Hydro : 4:25 APP
        */
        if (interaction.options.getSubcommand() === 'genshin') {
            console.log("genshin");
            const imageBackground = "./FolderContainer/GIAsset/GiVideo/genshinBackground.jpg";
            const videoIntro = ['./FolderContainer/GIAsset/GiVideo/introGenshin.mp4'];

            const pyro = interaction.options.getString("pyro");
            const anemo = interaction.options.getString("anemo");
            const electro = interaction.options.getString("electro");
            const dendro = interaction.options.getString("dendro");
            const cryo = interaction.options.getString("cryo");
            const geo = interaction.options.getString("geo");
            const hydro = interaction.options.getString("hydro");

            console.log(pyro);
            console.log(anemo);
            console.log(electro);
            console.log(dendro);
            console.log(cryo);
            console.log(geo);
            console.log(hydro);
            const videoArray = [`./FolderContainer/GIAsset/GiVideo/Sources/${pyro}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${anemo}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${electro}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${dendro}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${cryo}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${geo}.mp4`
               , `./FolderContainer/GIAsset/GiVideo/Sources/${hydro}.mp4`];
            createVideo(imageBackground, videoIntro, videoArray);
        }

        /* Durée HSR
        * Feu : 6:24 AdobePremierePro (APP)
        * Vent :  6:25 APP
        * Eclair : 6:23 APP
        * Glace : 6:21 APP
        * Quantum : 6:21 APP
        * Physique : 5:02 APP
        * Imaginaire : 4:25 APP
        */
        else if (interaction.options.getSubcommand() === 'starrail') {
            console.log("starrail");
            /*const imageBackground = "./FolderContainer/Gifs/Genshin/genshinBackground.jpg";
            const videoIntro = ['./FolderContainer/Gifs/Genshin/introGenshin.mp4'];

            const feu = interaction.options.getString("feu");
            const vent = interaction.options.getString("vent");
            const eclair = interaction.options.getString("eclair");
            const glace = interaction.options.getString("glace");
            const quantum = interaction.options.getString("quantum");
            const physique = interaction.options.getString("physique");
            const imaginaire = interaction.options.getString("imaginaire");

            console.log(feu);
            console.log(vent);
            console.log(eclair);
            console.log(glace);
            console.log(quantum);
            console.log(physique);
            console.log(imaginaire);
            const videoArray = [`./FolderContainer/Gifs/Genshin/Sources/${feu}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${vent}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${eclair}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${glace}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${quantum}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${physique}.mp4`
                , `./FolderContainer/Gifs/Genshin/Sources/${imaginaire}.mp4`];
            createVideo(imageBackground, videoIntro, videoArray);*/
            interaction.editReply("pas encore implem... soon !");
        }

        async function createVideo(backgroundImagePath, strArrayIntroVideo, strArrayVideos){
            //IMAGES USER CREATION
            const canvas = createCanvas(1278, 720);
            const context = canvas.getContext('2d');

            const background = await readFile(backgroundImagePath);
            const backgroundImage = new Image();
            backgroundImage.src = background;
            context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            context.strokeStyle = '#0099ff';
            context.strokeRect(0, 0, canvas.width, canvas.height);

            context.font = '50px Arial';
            context.fillStyle = '#ff0000';
            context.fillText('Les personnages préférés de :', 250, 175);

            let usernameAffichage = interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1);

            context.font = applyText(canvas, `${usernameAffichage}!`);
            context.fillStyle = '#0000ff'

            context.fillText(`${usernameAffichage} !`, 850, 275);

            context.beginPath();
            context.arc(125, canvas.height/2, 100, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            const { body } = await request(interaction.user.displayAvatarURL({ format: 'jpg' }));
            const avatar = new Image();
            avatar.src = Buffer.from(await body.arrayBuffer());
            context.drawImage(avatar, 25, canvas.height/2 - 100, 200, 200);

            const pngData = await canvas.encode('png');
            const timeNow = Math.floor(Date.now() / 1000);
            await promises.writeFile(`./FolderContainer/GIAsset/GiVideo/Users/${interaction.user.username + "_" + timeNow}.png`, pngData);
            //FIN CREATION PNG USER

            try{
                //CREATION MP4 USER IMAGE
                var secondsToShowEachImage = 4.677326;
                var finalVideoPathUser = `./FolderContainer/GIAsset/GiVideo/Users/${interaction.user.username + "_" + timeNow}.mp4`;

                // setup videoshow options
                var videoOptions = {
                    loop: secondsToShowEachImage,
                    fps: 24,
                    transition: false,
                    videoBitrate: 1024 ,
                    videoCodec: 'libx264',
                    size: '1278x720',
                    outputOptions: ['-pix_fmt yuv420p'],
                    format: 'mp4'
                };

                // array of images to make the 'videoshow' from
                var images = [`./FolderContainer/GIAsset/GiVideo/Users/${interaction.user.username + "_" + timeNow}.png`];

                videoshow(images, videoOptions)
                    .save(finalVideoPathUser)
                    .on('start', function (command) {
                        console.log('encoding ' + finalVideoPathUser + ' with command ' + command)
                    })
                    .on('error', function (err, stdout, stderr) {
                        console.error('Error:', err);
                        console.error('ffmpeg stderr:', stderr);
                    })
                    .on('end', async function (output) {

                        finalVideoPath = [finalVideoPathUser];

                        completeVideoArray = finalVideoPath.concat(strArrayIntroVideo).concat(strArrayVideos);

                        const outputFinal = `./FolderContainer/GIAsset/GiVideo/Videos/${interaction.user.username + "_" + timeNow}.mp4`

                        await concat({
                            output: outputFinal,
                            videos: completeVideoArray,
                            transition: [
                                {
                                    name: 'crosszoom',
                                    duration: 50
                                }
                            ],
                            audio: "./FolderContainer/GIAsset/GiVideo/favcharacteraudio.mp3",
                            frameFormat: "png",
                            concurrency: 9
                        }).then(async (output) => {

                            const file = new AttachmentBuilder(outputFinal, {name: `${interaction.user.username + "_" + timeNow}.mp4`});

                            await interaction.channel.send({files: [file]}).then( (m) => {

                                //L'image User
                                fs.unlink(`./FolderContainer/GIAsset/GiVideo/Users/${interaction.user.username + "_" + timeNow}.png`, (err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(`l'image user a été delete (${interaction.user.username + "_" + timeNow})`);
                                    }
                                }));

                                //La video User
                                fs.unlink(`./FolderContainer/GIAsset/GiVideo/Users/${interaction.user.username + "_" + timeNow}.mp4`, (err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(`la video user a été delete (${interaction.user.username + "_" + timeNow})`);
                                    }
                                }));

                                //La video finale
                                fs.unlink(outputFinal, (err => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(`la video finale a été delete (${interaction.user.username + "_" + timeNow})`);
                                    }
                                }));

                                messageId.delete();
                            });
                        });
                    });

            }catch (e){
                interaction.editReply("Une erreur est survenue");
                console.log(e);
            }
        }

        const applyText = (canvas, text) => {
            const context = canvas.getContext('2d');
            let fontSize = 70;

            do {
                context.font = `${fontSize -= 10}px Arial`;
            } while (context.measureText(text).width > canvas.width - 300);

            return context.font;
        };

    }
}