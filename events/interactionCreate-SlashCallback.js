module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (!interaction.isCommand()) return;

		if (
			!client.commands.has(interaction.commandName) &&
			client.commands.get(interaction.commandName).isSlash === false
		)
			return;

		try {
			await client.commands.get(interaction.commandName).execute(interaction, client);
		} catch (error) {
			await interaction.reply({
				content:
					'이런 명령어를 실행 도중에 오류나서 확인할수가 없어요 개발자들한테 말할테니 조금만 기다리세요.',
				ephemeral: true,
			});
			console.log(error)
		}
	},
};