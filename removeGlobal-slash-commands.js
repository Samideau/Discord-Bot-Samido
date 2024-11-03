/* Requiring all the stuff to register the Commands with. */

const { REST, Routes } = require('discord.js');
const { token, clientId } = require('./JSON/config.json');

/* Registering the commands to the API. */

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing 0 application (/) commands.');

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: [] },
		);

		console.log('Successfully reloaded 0 application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();