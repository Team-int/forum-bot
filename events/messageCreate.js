const Discord = require('discord.js');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		function cacheCommand(command) {
			client.commands.forEach(async (x) => {
				if (x.aliases == command) return x.name;
				else return undefined;
			});
		}
		const Dokdo = require('dokdo');
		let DokdoHandler = new Dokdo(client, {
			aliases: ['dokdo', 'dok'],
			prefix: client.config.bot.prefix,
			owners: client.config.bot.owners,
		});

		await DokdoHandler.run(message);

		if (message.author.bot) return;
		if (!message.content.startsWith(client.prefix)) return;
		let args = message.content.substr(client.prefix.length).trim().split(' ');

		if (client.status == '정상 운영중...') {
			if (client.commands.get(args[0]) && client.commands.get(args[0]).isSlash === false) {
				try {
					await client.commands.get(args[0]).execute(client, message, args);
				} catch (error) {
					message.reply(
						'저런... 개발자들이 이상한짓을 했는지 명령어가 실행도중에 충돌이 이러났어요...'
					);
					let embed = new Discord.MessageEmbed()
						.setTitle('Error!')
						.setDescription('알수 없는 오류가 나타났어요...')
						.setColor('RED')
						.addField('오류 위치', args[0])
						.addField('오류 내용', `\`${error}\``);
					client.channels.cache.get(client.config.utils.logChannel).send({ embeds: [embed] });
				}
			} else if (
				client.commands.get(cacheCommand(args[0])) &&
				client.commands.get(cacheCommand(args[0])).isSlash === false
			) {
				try {
					await client.commands.get(cacheCommand(args[0])).execute(client, message, args);
				} catch (error) {
					message.reply(
						'저런... 개발자들이 이상한짓을 했는지 명령어가 실행도중에 충돌이 이러났어요...'
					);
					let embed = new Discord.MessageEmbed()
						.setTitle('Error!')
						.setColor('RED')
						.setDescription('알수 없는 오류가 나타났어요...')
						.addField('오류 위치', args[0])
						.addField('오류 내용', `\`${error}\``);
					client.channels.cache.get(client.config.utils.logChannel).send({ embeds: [embed] });
				}
			}
		} else if (client.status.includes('점검중')) {
			if (message.content.startsWith(prefix + 'dok')) return;
			if (client.commands.get(args[0])) {
				return message.reply(
					`현재 ${client.user.username}이 점검중이며 일부 기능을 이용할수 없습니다.`
				);
			} else if (client.aliases.get(args[0])) {
				return message.reply(
					`현재 ${client.user.username}이 점검중이며 일부 기능을 이용할수 없습니다.`
				);
			}
		} else if (client.status.includes('부팅중')) {
			return message.reply(`현재 ${client.user.username} 재시작중이며 잠시만 기다려주세요...`);
		}
	},
};