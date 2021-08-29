const Discord = require('discord.js');

module.exports = {
	name: 'setupTicket',
	description: '티켓을 세팅합니다.',
	isSlash: false,
	async execute(client, message, args) {
		if(!client.config.bot.owners.includes(message.author.id)) return
		const embed = new Discord.MessageEmbed()
			.setDescription('생성하려는 티켓을 선택한 뒤 아래 버튼을 눌러서 생성할 수 있습니다!\n')
			.setColor('ffffff');
		const row = new Discord.MessageActionRow().addComponents(
			new Discord.MessageSelectMenu()
				.setCustomId('createTicket')
				.setPlaceholder('생성할 티켓을 선택해주세요')
				.addOptions([
					{
						label: '🚨 신고하기',
						description: '규칙을 어기는 유저를 신고하려면 이 옵션을 선택해주세요!',
						value: 'report',
					},
					{
						label: '📝 건의하기',
						description: '본 커뮤니티에 건의 사항이 있으면 이 옵션을 선택해주세요!',
						value: 'suggest',
					},
					{
						label: '📝 문의하기',
						description: '문의사항이 있으면 이 옵션을 선택해주세요!',
						value: 'support',
					},
				])
		);
		const button = new Discord.MessageActionRow().addComponents(
			new Discord.MessageButton()
				.setCustomId('openTicket')
				.setLabel('티켓 만들기')
				.setStyle('SUCCESS')
				.setEmoji('📨')
		);
		message.channel.send({ embeds: [embed], components: [row, button] });
	},
};
