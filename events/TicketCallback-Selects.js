const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, Interaction } = require('discord.js')
const wait = require('util').promisify(setTimeout);
const SelectedMenuForTicket = {}

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		const { ticketCategory, translateValue } = client.config
		
		if (!interaction.isSelectMenu()) return;
		if (interaction.customId === 'createTicket') {
			SelectedMenuForTicket[interaction.user.id] = interaction.values[0];
			await interaction.deferUpdate();
		}
	},
};

module.exports.getSelectedMenuForTicket = (userId) => {
  if (SelectedMenuForTicket[userId]) {
    return SelectedMenuForTicket[userId]
  }
  return
}

module.exports.removeSelectedMenuForTicket = (userId) => {
  return delete SelectedMenuForTicket[userId]
}