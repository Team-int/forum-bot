require('dotenv').config();
const Discord = require('discord.js');
const { Bot } = require('djs-handler');
const axios = require('axios').default;
const ops = require('./config.json');
const server = require('http').createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world');
});
server.listen(process.env.PORT);
setInterval(() => {
    axios.get('https://int-manager.herokuapp.com').then();
}, 120000);
const client = new Bot(process.env.TOKEN, {
    typing: true,
    prefix: 'i.',
    ops: require('./config.json')
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
    if (!member.user.bot) await client.channels.cache.get(ops.greetChannel).send({
        embed: embed
    });
    client.channels.cache.get(ops.counter.all).setName(`모든 유저 수: ${member.guild.memberCount}`);
    client.channels.cache.get(ops.counter.user).setName(`유저 수: ${member.guild.members.cache.filter(x => !x.user.bot).size}`);
    client.channels.cache.get(ops.counter.bot).setName(`봇 수: ${member.guild.members.cache.filter(x => x.user.bot).size}`);
});
client.on('guildMemberRemove', async member => {
    const embed = new Discord.MessageEmbed()
        .setTitle('멤버 퇴장')
        .setColor('RANDOM')
        .setDescription(`${member.user.tag}님이 ${member.guild.name}에서 나갔어요`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter(member.user.tag, member.user.displayAvatarURL())
        .setTimestamp()
    if (!member.user.bot) await client.channels.cache.get(ops.greetChannel).send({
        embed: embed
    });
    client.channels.cache.get(ops.counter.all).setName(`모든 유저 수: ${member.guild.memberCount}`);
    client.channels.cache.get(ops.counter.user).setName(`유저 수: ${member.guild.members.cache.filter(x => !x.user.bot).size}`);
    client.channels.cache.get(ops.counter.bot).setName(`봇 수: ${member.guild.members.cache.filter(x => x.user.bot).size}`);
});
client.on('messageReactionAdd', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (r.emoji.name == 'yes') {
        await r.message.guild.member(u).roles.add(ops.userRole);
    } else if (r.emoji.name == '⏰') {
        await r.message.guild.member(u).roles.add(ops.alarmRole);
    }
});
client.on('messageReactionRemove', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (r.emoji.name == 'yes') {
        await r.message.guild.member(u).roles.remove(ops.userRole);
    } else if (r.emoji.name == '⏰') {
        await r.message.guild.member(u).roles.remove(ops.alarmRole);
    }
});
client.on('message', message => {
    if (message.author.id != ops.mee6Id) return;
    if (!message.content.startsWith('GG ')) return;
    const member = client.guilds.cache.get(ops.guildId).member(message.mentions.users.first());
    const level = parseInt(message.content.split(' ')[7].replace('!', ''));
    if (level == 5) {
        member.roles.add(ops.levelRoles.m);
    } else if (level == 10) {
        member.roles.add(ops.levelRoles.u);
    } else if (level == 15) {
        member.roles.add(ops.levelRoles.s);
    } else if (level == 20) {
        member.roles.add(ops.levelRoles.k);
    }
});
client.on('message', async message => {
    if (message.author.bot) return;
    if (message.member.roles.cache.has(ops.adminRole)) return;
    if (message.content.includes('discord.gg') || message.content.includes('discord.com/invite') || message.content.includes('discordapp.com/invite')) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('messageUpdate', async (_old, message) => {
    if (message.author.bot) return;
    if (message.member.roles.cache.has(ops.adminRole)) return;
    if (message.content.includes('discord.gg') || message.content.includes('discord.com/invite') || message.content.includes('discordapp.com/invite')) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('ready', () => {
    switch(Math.floor(Math.random() * 5)) {
        case 0:
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: `int 관리`,
                    type: 'PLAYING'
                }
            });
        case 1:
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: `이 메시지는 10초마다 바뀝니다!`,
                    type: 'PLAYING'
                }
            });
        case 2:
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: `${client.guilds.cache.get(ops.guildId).members.cache.filter(x => !x.user.bot).size}명의 멤버와 함께하는 int입니다!`,
                    type: 'PLAYING'
                }
            });
        case 3:
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: `i.help를 보내 물어보세요!`,
                    type: 'PLAYING'
                }
            });
        case 4:
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: `int`,
                    type: 'STREAMING',
                    url: 'https://twitch.tv/int'
                }
            });
    }
});