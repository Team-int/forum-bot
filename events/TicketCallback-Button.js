const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	Interaction,
	Permissions,
	PermissionOverwrites,
} = require('discord.js');
const {
	getSelectedMenuForTicket,
	removeSelectedMenuForTicket,
} = require('./TicketCallback-Selects.js');
const wait = require('util').promisify(setTimeout);

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		const { ticketCategory, translateValue } = client.config;
		if (!interaction.isButton()) return;

		if (interaction.customId === 'verify') {
			const roleID = '751400015733194753';
			const member = await interaction.guild.members.cache.find(
				(member) => member.id === interaction.user.id
			);
			if (member.roles.cache.find((r) => r.id === roleID))
				return interaction.reply({ content: '이미 인증되었습니다!', ephemeral: true });
			
			await member.roles.add(roleID)
			interaction.reply({
				content:
					'성공적으로 인증되었습니다!' +
					'\n' +
					'이용규칙 위반되지 않게 활발한 활동해 주시기 바랍니다!',
				ephemeral: true,
			});
		}
		if (interaction.customId === 'openTicket') {
			const selected = getSelectedMenuForTicket(interaction.user.id); // interaction.values[0]
			if (!selected)
				return interaction.reply({ content: `생성할 티켓을 선택해야합니다!`, ephemeral: true });
			removeSelectedMenuForTicket(interaction.user.id);
			const selected_KR = translateValue(selected);
			const { guild, user } = interaction;
			const existChannel = await guild.channels.cache.find((channels) => {
				const { name } = channels;
				const ticketInfo = name.split('-')[0];
				const ticketId = name.split('-')[1];
				return ticketId === user.id && ticketInfo === selected;
			});
			if (existChannel)
				return interaction.reply({
					content: `이미 ${selected_KR} 티켓이 생성되어있습니다`,
					ephemeral: true,
				});
			const channel = await guild.channels
				.create(`${selected}-${user.id}`, {
					type: 'text',
					permissionOverwrites: [
						{
							id: user.id,
							allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
						},
						{
							id: guild.id,
							deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
						},
					],
					parent: ticketCategory[0],
				})
				.then(async (ch) => {
					const embed = new MessageEmbed()
						.setAuthor(`${selected_KR} 티켓이 생성되었습니다.`)
						.setDescription(
							`관리자가 도착하기 전까지 시간이 걸릴 수 있으니 ${selected_KR}사항을 먼저 적어주세요!`
						);
					const buttons = new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomId('closeTicket')
							.setLabel('티켓 삭제')
							.setStyle('DANGER')
							.setEmoji('📩'),
						new MessageButton()
							.setCustomId('keepTicket')
							.setLabel('티켓 닫기')
							.setStyle('SECONDARY')
							.setEmoji('💾')
					);
					ch.send({ embeds: [embed], components: [buttons] });
					interaction.reply({
						content: `${selected_KR} 티켓이 생성되었습니다: <#${ch.id}>`,
						ephemeral: true,
					});
				});
		}

		if (interaction.customId === 'closeTicket') {
			const { guild, channel, user } = interaction;
			const member = guild.members.cache.find((member) => member.id === user.id);
			if (!member.permissions.has('MANAGE_MESSAGES'))
				return interaction.reply({
					content: '권한이 부족해 사용할 수 없습니다',
					ephemeral: true,
				});
			const buttons = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('closeTicket')
					.setLabel('티켓 삭제')
					.setStyle('DANGER')
					.setEmoji('📩')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('keepTicket')
					.setLabel('티켓 삭제 처리')
					.setStyle('SECONDARY')
					.setEmoji('💾')
					.setDisabled(true)
			);
			interaction.update({ components: [buttons] });
			channel.send('5초 뒤 채널이 삭제됩니다');
			setTimeout(() => {
				channel.delete();
			}, 5000);
		}
		if (interaction.customId === 'keepTicket') {
			const { guild, channel } = interaction;
			const buttons = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('closeTicket')
					.setLabel('티켓 삭제')
					.setStyle('DANGER')
					.setEmoji('📩'),
				new MessageButton()
					.setCustomId('keepTicket')
					.setLabel('티켓 닫힘')
					.setStyle('SECONDARY')
					.setEmoji('💾')
					.setDisabled(true)
			);
			wait(1000);
			interaction.update({ components: [buttons] });
			const userId = channel.name.split('-')[1];
			channel.setName('닫힌-' + channel.name);
			channel.permissionOverwrites.edit(userId, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: false,
			});
			channel.send('채널이 보관되었습니다');
		}
	},
};