/* Requiring all the stuff to register the Commands with. */

const { REST, Routes } = require('discord.js');
const { token, clientId } = require('./JSON/config.json');

/* Registering the commands to the API. */
const guildId = '806439021248118784';

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

		console.log(`Successfully reloaded 0 application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();