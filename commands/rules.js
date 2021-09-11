const Discord = require('discord.js')

module.exports = {
	name: 'giveRole',
	description: '임시로 역할주는 기능',
	isSlash: false,
	async execute(client, message, args) {
		if(!client.config.bot.owners.includes(message.author.id)) return
		message.delete()
		const embed = new Discord.MessageEmbed()
			.setDescription('위 내용을 동의하셨다면 아래 인증하기 버튼을 눌러주세요!')
			.setColor('ffffff');
		const row = new Discord.MessageActionRow().addComponents(
			new Discord.MessageButton()
				.setCustomId('verify')
				.setLabel('인증하기')
				.setStyle('SUCCESS')
				.setEmoji('✅')
		);
		message.channel.send({ embeds: [embed], components: [row, button] });
	}
}