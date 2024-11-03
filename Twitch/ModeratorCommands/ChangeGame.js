let {botRefreshToken, botTwitchMystere, botUserID, botTwitchID, botTwitchUsername, botTwitchPassword, channelsTwitchName} = require('./config.json');

module.exports = {
    executeTwitch(args) {
        const sides = 6;
        return Math.floor(Math.random() * sides) + 1;
    }
}