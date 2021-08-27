/* eslint-disable no-unused-vars */

// Message Command

const Discord = require('discord.js')

module.exports = {
  name: '',
  isSlash: false,
  aliases: [''],
  description: '',
  async execute(client, message, args) {
		
  }
}

// Slash Command

const Discord = require('discord.js')

module.exports = {
  name: '',
  isSlash: true,
  description: '',
  async execute(interaction, client) {
		
  }
}

// Event
module.exports = {
	name: '',
	async execute(...client) {
	}
}