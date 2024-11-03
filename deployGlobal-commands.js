const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./JSON/config.json');
const fs = require('node:fs');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandMusicFiles = fs.readdirSync('./scommands/Musique/').filter(file => file.endsWith('.js'));
const commandAutreFiles = fs.readdirSync('./scommands/Autre/').filter(file => file.endsWith('.js'));
const commandFunFiles = fs.readdirSync('./scommands/Fun/').filter(file => file.endsWith('.js'));
const commandJeuxFiles = fs.readdirSync('./scommands/Jeux/').filter(file => file.endsWith('.js'));
const commandOnceCommandsFiles = fs.readdirSync('./scommands/OnceCommands/').filter(file => file.endsWith('.js'));
const adminCommandsFiles = fs.readdirSync('./scommands/AdminCommands/').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandMusicFiles) {
	const command = require(`./scommands/Musique/${file}`);
	//console.log(command);
	commands.push(command.data.toJSON());
}
for (const file of commandAutreFiles) {
	const command = require(`./scommands/Autre/${file}`);
	commands.push(command.data.toJSON());
}
for (const file of commandFunFiles) {
	const command = require(`./scommands/Fun/${file}`);
	commands.push(command.data.toJSON());
}

for (const file of commandJeuxFiles) {
	const command = require(`./scommands/Jeux/${file}`);
	commands.push(command.data.toJSON());
}

for (const file of commandOnceCommandsFiles) {
	const command = require(`./scommands/OnceCommands/${file}`);
	commands.push(command.data.toJSON());
}

for (const file of adminCommandsFiles) {
	const command = require(`./scommands/AdminCommands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();