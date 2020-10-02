require('dotenv').config();
const Discord = require('discord.js');
const { Bot } = require('djs-handler');
const client = new Bot(process.env.TOKEN, {
    typing: true,
    prefix: 'i.'
}, {
    partials: ['REACTION', 'MESSAGE']
});
client.config('./commands/');
client.on('guildMemberAdd', async member => {
    const embed = new Discord.MessageEmbed()
        .setTitle('환영합니다!')
        .setColor('RANDOM')
        .setDescription(`${member.user}님, ${member.guild.name}에 오신 것을 환영합니다!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter(member.user.tag, member.user.displayAvatarURL())
        .setTimestamp()
    if (!member.user.bot) await client.channels.cache.get('758562685070737441').send({
        embed: embed
    });
    client.channels.cache.get('761438415975350272').setName(`모든 유저 수: ${member.guild.memberCount}`);
    client.channels.cache.get('761433490817679381').setName(`유저 수: ${member.guild.members.cache.filter(x => !x.user.bot).size}`);
    client.channels.cache.get('761433509931253791').setName(`봇 수: ${member.guild.members.cache.filter(x => x.user.bot).size}`);
});
client.on('guildMemberRemove', async member => {
    const embed = new Discord.MessageEmbed()
        .setTitle('멤버 퇴장')
        .setColor('RANDOM')
        .setDescription(`${member.user.tag}님이 ${member.guild.name}에서 나갔어요`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter(member.user.tag, member.user.displayAvatarURL())
        .setTimestamp()
    if (!member.user.bot) await client.channels.cache.get('758562685070737441').send({
        embed: embed
    });
    client.channels.cache.get('761438415975350272').setName(`모든 유저 수: ${member.guild.memberCount}`);
    client.channels.cache.get('761433490817679381').setName(`유저 수: ${member.guild.members.cache.filter(x => !x.user.bot).size}`);
    client.channels.cache.get('761433509931253791').setName(`봇 수: ${member.guild.members.cache.filter(x => x.user.bot).size}`);
});
client.on('messageReactionAdd', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (r.emoji.name == '✅') {
        await r.message.guild.member(u).roles.add('761431372454821908');
    } else if (r.emoji.name == '🔔') {
        await r.message.guild.member(u).roles.add('761453114074202173');
    }
});
client.on('messageReactionRemove', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (r.emoji.name == '✅') {
        await r.message.guild.member(u).roles.remove('761431372454821908');
    } else if (r.emoji.name == '🔔') {
        await r.message.guild.member(u).roles.remove('761453114074202173');
    }
});
client.on('message', message => {
    if (message.author.id != '761437696039845939') return;
    if (!message.content.startsWith('GG ')) return;
    const member = client.guilds.cache.get('758562685070737438').member(message.mentions.users.first());
    const level = parseInt(message.content.split(' ')[7].replace('!', ''));
    if (level == 5) {
        member.roles.add('761475035156185089');
    } else if (level == 10) {
        member.roles.add('761475019850121237');
    } else if (level == 15) {
        member.roles.add('761475004239708180');
    } else if (level == 20) {
        member.roles.add('761474978381955072');
    }
})