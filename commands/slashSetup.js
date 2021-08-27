const Discord = require('discord.js');

module.exports = {
	name: '세팅',
	isSlash: false,
	aliases: ['slash', 'setup', 'tpxld'],
	description: 'Slash Command 세팅합니다.',
	async execute(client, message, args) {
		let row = new Discord.MessageActionRow().addComponents(
			new Discord.MessageButton()
				.setCustomId('accept')
				.setLabel('동의합니다.')
				.setStyle('SUCCESS')
				.setEmoji('✅')
		);
		let embed = new Discord.MessageEmbed()
			.setTitle('잠시만요!')
			.setColor('YELLOW')
			.setDescription(
				`Slash Command를 사용할려면 봇 초대할떄 \`applications.commands\` 스코프를 사용하지 않았을경우 해당기능을 이용할수 없습니다. 만약 \`applications.commands\` 스코프를 안할경우 [여기를](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands) 클릭하여 허용해주시기 바랍니다.`
			)
			.setFooter(message.author.tag, message.author.displayAvatarURL());

		let m = await message.channel.send({ embeds: [embed], components: [row] });

		const collector = m.createMessageComponentCollector({ time: 5000 });

		collector.on('collect', async (i) => {
			if (i.user.id === message.author.id) {
				let str = '\u200b';
				embed
					.setTitle('')
					.setDescription('Slash Command 로딩중...')
					.setColor('ORANGE')
					.addField('로딩된 명령어들', str, true)
					.setAuthor(
						'로딩중...',
						'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1'
					);
				await i.update({ embeds: [embed], components: [] });

				setTimeout(async () => {
					for (let command of client.commands) {
						let array = [];
						if (command[1].isSlash === true) {
							array.push({
								name: command[1].name,
								description: command[1].description,
								options: command[1].options || [],
							});

							message.guild.commands.set(array).then(async (x) => {
								console.log(x);
							});

							await m.edit({ embeds: [embed] });
						}
					}
				}, 1000);
			} else {
				i.reply({
					content: `명령어 요청한 **${message.author.username}**만 사용할수 있어요.`,
					ephemeral: true,
				});
			}
		});
		collector.on('end', (collected) => {
			if (Math.random() * 1000 <= 300) {
				message.channel.sendTyping();
				m.reply('?');
				message.channel.sendTyping();
				setTimeout(async () => {
					message.channel.send('왜 클릭안해요?');
				}, 1000);
			}
		});
	},
};