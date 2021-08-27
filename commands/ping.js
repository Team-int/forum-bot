const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: '봇의 반응속도를 테스트합니다.',
	isSlash: true,
	async execute(interaction, client) {
		let embed = new Discord.MessageEmbed()
			.setTitle('측정완료')
			.setColor('GREEN')
			.setDescription('메세지 응답속도는 (/) 명령어로 확인할수가 없어요.\n!ping 으로 응답속도 측정해보세요.')
			.setTimestamp()
			.addField('API 반응속도', `${client.ws.ping}ms`, true)
			.setFooter(interaction.user.username, interaction.user.displayAvatarURL())
		interaction.reply({ embeds: [embed] });
	},
};