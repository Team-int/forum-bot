module.exports = {
    app: {
        config: {
            intents: [32767],
            allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: false },
        }
    },
    bot: {
        token: '',
        prefix: '',
        owners: [],
        dev: true
    },
	ticketCategory: ['880361791262179369'],
	translateValue: (value) => {
		if (value === 'report') return '신고';
		if (value === 'suggest') return '건의';
		if (value === 'support') return '문의';
	},
}