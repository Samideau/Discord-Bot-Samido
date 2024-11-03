const WebSocket = require('ws');
let {botRefreshToken, botTwitchMystere, botUserID, botTwitchID, botTwitchUsername, botTwitchPassword, channelsTwitchName} = require('./config.json');
const badwords = require("./badwordsTwitch.json");
const fetch = require("node-fetch");
const fs = require("fs");

let twitchCommandFiles = fs.readdirSync('./Twitch/Commands').filter(file => file.endsWith('.js'));

let twitchModeratorCommandFiles = fs.readdirSync('./Twitch/ModeratorCommands').filter(file => file.endsWith('.js'));


const broadcasterID = new Map();
let socket;

module.exports = {
    async executeTwitch(command, args) {
        /*console.log("TCF : " + twitchCommandFiles);
        console.log("TMCF : " + twitchModeratorCommandFiles);*/
        if(command === "start"){
            initConnection();
        }
        else if(command === "stop"){
            try{
                if(args !== null){
                    for(const channelName of args)
                        socket.send(`PART #${channelName}`);
                }
                else{
                    for(const channelName of channelsTwitchName)
                        socket.send(`PART #${channelName}`);
                }

                socket.close();
                return true;
            }catch (e) {
                console.log("[Twitch STOP BOT] Une erreur est survenue : " + e);
                return false;
            }
        }

        function refreshToken(){
            fs.readFile(`./Twitch/config.json`, 'utf8', function readFileCallback(err, dataOrigin) {
                if(err) return console.log(err);

                fetch('https://id.twitch.tv/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `grant_type=refresh_token&refresh_token=${botRefreshToken}&client_id=${botTwitchID}&client_secret=${botTwitchMystere}`
                }).then(res => {
                    console.log("[Twitch Refresh Token] Code : " + res.status); //Resfresh Token
                    if(res.status === 200)
                        return res.json();
                    else {
                        console.log(res);
                        return null;
                    }

                }).then(data => {
                    if(data){
                        botRefreshToken = data.refresh_token;
                        botTwitchPassword = data.access_token;

                        let newObj = {
                            botRefreshToken : botRefreshToken,
                            botTwitchMystere : botTwitchMystere,
                            botUserID : botUserID,
                            botTwitchID : botTwitchID,
                            botTwitchUsername : botTwitchUsername,
                            botTwitchPassword : botTwitchPassword,
                            channelsTwitchName : channelsTwitchName
                        };

                        fs.writeFile("./Twitch/config.json", JSON.stringify(newObj), function (err, result) {
                            if (err) console.log('error', err);
                            else{
                                console.log("Changement de Token fait avec succès !");
                                initConnection();
                            }

                        });
                    }
                    else
                        console.log("[Twitch Refresh Token] Une erreur est survenue\n");

                });
            });

        }

        function initConnection(){
            fetch('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': `OAuth ${botTwitchPassword}`
                }
            }).then(res => {
                console.log("[Twitch OPEN] code : " + res.status); // 200 = ok ; 401 = invalide
                if(res.status === 401){
                    //console.log(res);
                    refreshToken();
                }else if(res.status === 200){
                    socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
                    socket.addEventListener('open', () => {
                        socket.send(`PASS oauth:${botTwitchPassword}`);
                        socket.send(`NICK ${botTwitchUsername}`);
                        socket.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
                        for(const channelName of channelsTwitchName)
                            socket.send(`JOIN #${channelName}`);

                        eventMessage(socket);
                        if(args !== null)
                            GetStreamInfo(args);
                    });
                }else{
                    console.log(res);
                    console.log("[Twitch OPEN] Erreur inconnue : " + res.status);
                }
            });
        }

        function eventMessage(socket){
            for(const channelName of channelsTwitchName)
                socket.send(`PRIVMSG #${channelName} : Bot connecté et prêt à l'emplois !`);
            socket.addEventListener('message', event => {
                console.log(event.data);
                if(event.data.includes("PING") && !event.data.includes("PRIVMSG")) return socket.send("PONG"); //Vérification de twitch que le bot est toujours en vie

                let messageGlobale = event.data;
                if(event.data.includes("ROOMSTATE") && !event.data.includes("PRIVMSG")){
                    let channel = messageGlobale.split("#");
                    let channelName = channel[channel.length - 1].replaceAll("\r\n", "");

                    let idTmp = messageGlobale.split("room-id=");
                    let brID = idTmp[1].substring(0, idTmp[1].indexOf(";"));

                    return broadcasterID.set(channelName, brID);
                }

                if(event.data.includes("PRIVMSG")){ //Le bot reçoit un message

                    let messagetmp = messageGlobale.split("@");
                    let messageChannel = messageGlobale.split("PRIVMSG #");
                    let messageIdTmp = messageGlobale.split("id=");
                    let messageIsMod = messageGlobale.split("user-type=");

                    let user = messagetmp[2].substring(0, messagetmp[2].indexOf(".tmi.twitch.tv")); //Obtenir le User
                    let tmp = messagetmp[2].substring(messagetmp[2].indexOf(":")+1, messagetmp[2].length);
                    let messageChat = tmp.replaceAll("\r\n", "");//Obtenir le Message envoyé
                    let channel = messageChannel[1].substring(0, messageChannel[1].indexOf(":")-1);//Obtenir la chaine Twitch
                    let messageID = messageIdTmp[1].substring(0, messageIdTmp[1].indexOf(";"));//Obtenir l'id du message
                    let isUserMod = messageIsMod[1].substring(0, messageIsMod[1].indexOf(":")-1) === "mod" ? true : false; //Check si c'est un modérateur

                    if(user === "samidana") return;
                    console.log(channel);
                    console.log(messageChat);
                    console.log(user);
                    console.log(messageID);
                    console.log(isUserMod);

                    let resultCmd = twitchCommandFiles.find((cmd) => messageChat.toLowerCase().includes("!" + cmd.substring(0, cmd.indexOf(".")).toLowerCase()));
                    if(resultCmd){
                        console.log(user + " a utilisé la commande : " + resultCmd);
                        socket.send(`PRIVMSG #${channel} :${require(`./Commands/${resultCmd}`).executeTwitch(messageChat)}`);
                    }

                    resultCmd = twitchModeratorCommandFiles.find((cmd) => messageChat.toLowerCase().includes("!" + cmd.substring(0, cmd.indexOf(".")).toLowerCase()));
                    //console.log("TMCF FINDER : " + resultCmd);
                    if((isUserMod || channel === user) && resultCmd){
                        console.log(user + " a utilisé la commande (modo) : " + resultCmd);
                        socket.send(`PRIVMSG #${channel} :${require(`./Commands/${resultCmd}`).executeTwitch(messageChat)}`);
                    }

                    if(messageChat.toLowerCase() === "salut le bot"){
                        socket.send(`PRIVMSG #${channel} :@${user} Salut à toi l'ami(e) !`);
                    }

                    if(!isUserMod && channel !== user){ //On ne vérifie pas le message si c'est un modérateur ou le streamer
                        checkTwitchChat(channel, messageChat, messageID, user, socket);
                    }
                }
            });
        }

        function checkTwitchChat(channel, msg, message_id, user, socket){
            let message = msg.toLowerCase();

            let shouldntSendMessage = false;
            let isTwitchClipLink = false;
            shouldntSendMessage = badwords.some(badwords => message.includes(badwords.toLowerCase()));
            isTwitchClipLink = message.includes("https://clips.twitch.tv/");
            if(shouldntSendMessage && !isTwitchClipLink) {
                fetch(`https://api.twitch.tv/helix/moderation/chat`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${botTwitchPassword}`,
                        'Client-Id': `${botTwitchID}`
                    },
                    body: `broadcaster_id=${broadcasterID.get(channel)}&moderator_id=${botUserID}&message_id=${message_id}`
                }).then(res => {
                    console.log("[Twitch/ChatMessages] code : " + res.status);
                    if(res.status === 204){
                        console.log(`[Twitch/ChatMessages] Mauvais mot détecté par ${user}, il/elle a dit "${msg}"`);
                        socket.send(`PRIVMSG #${channel} :@${user} j'ai supprimé ton message car il contenait un vilain mot !`);
                    }
                    else{
                        console.log(`[Twitch/ChatMessages] Une erreur est survenue"`);
                    }

                });
            }
        }

        function GetStreamInfo(channel){
            setTimeout(() => {
                let streamerURL = "";

                fetch(`https://api.twitch.tv/helix/users?login=samideau`, {
                    headers: {
                        'Authorization': `Bearer ${botTwitchPassword}`,
                        'Client-Id': `${botTwitchID}`
                    }
                }).then(resultat => resultat.json()).then(resultat => {
                    //console.log(resultat);
                    streamerURL = resultat.data[0].profile_image_url;
                    fetch(`https://api.twitch.tv/helix/streams?user_login=samideau`, {
                        headers: {
                            'Authorization': `Bearer ${botTwitchPassword}`,
                            'Client-Id': `${botTwitchID}`
                        }
                    }).then(res => res.json()).then(res => {
                        if(res.data){
                            //console.log(res.data[0]);
                            let thumbnail_url = res.data[0].thumbnail_url + Date.now();
                            require("../scommands/AutreAux/TwitchStreamMessage.js").execute(channel, res.data[0].title, res.data[0].game_name, res.data[0].user_name, streamerURL, thumbnail_url); //Channel big-welcome

                        }
                        else{
                            console.log("[Twitch Get Stream Info] Une erreur est survenue\n" + res);
                        }
                    });
                });
            }, 5000);
        }
    }
}