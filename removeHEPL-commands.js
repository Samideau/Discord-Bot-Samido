const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./JSON/config.json');

const guildId = '1302045730210451466';

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing 0 application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: [] },
		);

		console.log('Successfully reloaded 0 application (/) commands.');
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();