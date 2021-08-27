// Boot up
require('dotenv').config();

// Bot setup
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./env/config.js')
const client = new Discord.Client(config.app.config);


// Var

client.prefix = config.bot.prefix || 'i.';
client.status = '오프라인';
client.commands = new Discord.Collection();
client.status = '정상 운영중...';
client.config = config

// Handlers (Command & Event)

const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (let file of eventFiles) {
	let event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

for (let file of commandFiles) {
	let command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.login(config.bot.token);