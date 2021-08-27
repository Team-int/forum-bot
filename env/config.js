module.exports = {
	app: {
		config: {
			intents: [32767],
			allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: false },
		},
	},
	bot: {
		token: 'NzYxMzk3MTg1MjQ5NTQyMTQ0.X3aAYw.CHcXdFnGI0E35FiueNTzcltKUsU',
		prefix: '',
		owners: ['694131960125325374', '552103947662524416', '710784554780196925'],
		dev: true,
	},
	utils: {
		logChannel: '826102468705255424'
	},
	ticketCategory: ['814144722074468373','849485300622557204'],
	translateValue: (value) => {
		if (value === 'report') return '신고';
		if (value === 'suggest') return '건의';
		if (value === 'support') return '문의';
	},
};