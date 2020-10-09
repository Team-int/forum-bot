require('dotenv').config();
const Discord = require('discord.js');
const ops = require('./config.json');
const ascii = require('ascii-table');
const fs = require('fs');
const table = new ascii();
const client = new Discord.Client({
    partials: ['MESSAGE', 'REACTION']
});
client.verifyQueue = new Discord.Collection();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
table.setHeading('Command', 'Load Status');
fs.readdir('./commands/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./commands/${file}`);
            if (pull.name && pull.run && pull.aliases) {
                table.addRow(file, '✅');
                for (let alias of pull.aliases) {
                    client.aliases.set(alias, pull.name);
                }
                client.commands.set(pull.name, pull);
            } else {
                table.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) { 
            table.addRow(file, `❌ -> ${e}`); 
            continue;
        }
    }
    console.log(table.toString());
});
function tokenGen(client) {
    let chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '']
    let token = [];
    for (var i = 0; i < 100; i++) {
        token.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    while (true) {
        if (!client.verifyQueue.find(x => x.token == token.join(''))) break;
        token = [];
        for (var i = 0; i < 100; i++) {
            token.push(chars[Math.floor(Math.random() * chars.length)]);
        }
    }
    return token.join('');
}
client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type != 'text' && message.channel.type != 'news') return;
    if (!message.content.startsWith(ops.prefix)) return;
    message.channel.startTyping(1);
    let args = message.content.substr(ops.prefix.length).trim().split(' ');
    if (client.commands.get(args[0])) {
        client.commands.get(args[0]).run(client, message, args, ops);
    } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args, ops);
    }
    message.channel.stopTyping(true);
});
client.on('guildMemberAdd', async member => {
    const embed = new Discord.MessageEmbed()
        .setTitle('환영합니다!')
        .setColor('RANDOM')
        .setDescription(`${member.user}님, ${member.guild.name}에 오신 것을 환영합니다!\n먼저 ${client.channels.cache.get(ops.ruleChannel)}에서 규칙을 읽고 인증해주세요!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter(member.user.tag, member.user.displayAvatarURL())
        .setTimestamp()
    if (!member.user.bot) await client.channels.cache.get(ops.greetChannel).send({
        embed: embed
    });
    if (member.user.bot) await member.roles.add('751403263030722621');
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
    if (u.id == client.user.id) return;
    if (u.bot) return r.users.remove(u.id);
    if (r.emoji.name == 'yes') {
        if (r.message.id != ops.verifyMessage) return;
        if (u.id == client.user.id) return;
        r.users.remove(u.id);
        if (r.message.guild.member(u).roles.cache.has(ops.userRole)) return;
        let tkn = tokenGen(client);
        client.verifyQueue.set(tkn, u);
        u.send(`아래 링크를 눌러 인증해주세요.\nhttps://int-manager.azurewebsites.net/verify?token=${tkn}`)
    } else if (r.emoji.name == '⏰') {
        if (r.message.id != ops.roleMessage) return;
        await r.message.guild.member(u).roles.add(ops.alarmRole);
    } else if (r.emoji.name == '💻') {
        if (r.message.id != ops.roleMessage) return;
        await r.message.guild.member(u).roles.add(ops.teamAlarmRole);
    } else if (r.emoji.name == '🎫') {
        if (r.message.id != ops.ticketMessage) return;
        r.users.remove(u.id);
        client.guilds.cache.get(ops.guildId).channels.create(`티켓-${u.id}-${Math.floor(Math.random() * 10000000)}`, {
            permissionOverwrites: [
                {
                    id: client.guilds.cache.get(ops.guildId).roles.everyone.id,
                    deny: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'CREATE_INSTANT_INVITE',
                        'EMBED_LINKS',
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_WEBHOOKS',
                        'MANAGE_ROLES',
                        'MENTION_EVERYONE',
                        'READ_MESSAGE_HISTORY',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'VIEW_CHANNEL'
                    ]
                },
                {
                    id: ops.guildAdminRole,
                    allow: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'CREATE_INSTANT_INVITE',
                        'EMBED_LINKS',
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_WEBHOOKS',
                        'MANAGE_ROLES',
                        'MENTION_EVERYONE',
                        'READ_MESSAGE_HISTORY',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'VIEW_CHANNEL'
                    ]
                },
                {
                    id: u.id,
                    allow: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'CREATE_INSTANT_INVITE',
                        'EMBED_LINKS',
                        'READ_MESSAGE_HISTORY',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'VIEW_CHANNEL'
                    ],
                    deny: [
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_ROLES',
                        'MANAGE_WEBHOOKS',
                        'MENTION_EVERYONE'
                    ]
                }
            ]
        }).then(async tktCh => {
            const embed = new Discord.MessageEmbed()
                .setTitle('환영합니다!')
                .setDescription('관리자가 곧 올 거에요. 조금만 기다려 주세요.')
                .setColor('RANDOM')
                .setFooter(u.tag, u.displayAvatarURL())
                .setTimestamp()
            let m = await tktCh.send(u.toString(), {
                embed: embed
            });
            const embed2 = new Discord.MessageEmbed()
                .setTitle('티켓이 열렸어요! 빨리 와주세요!')
                .addField('티켓 채널', tktCh.toString())
                .setColor('RANDOM')
                .setFooter(u.tag, u.displayAvatarURL())
                .setTimestamp()
            await client.channels.cache.get(ops.confRoomChannel).send(client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole).toString(), {
                embed: embed2
            });
            await m.react('🔒');
        });
    } else if (r.emoji.name == '🔒') {
        if (!r.message.channel.name.startsWith('티켓-')) return;
        r.users.remove(u.id);
        const embed = new Discord.MessageEmbed()
            .setTitle('티켓이 닫혔어요')
            .setDescription('아래 반응을 클릭해서 티켓을 다시 열거나 완전히 지울 수 있어요.')
            .setColor('RANDOM')
            .setFooter(u.tag, u.displayAvatarURL())
            .setTimestamp()
        let m = await r.message.channel.send(`${u} ${client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole)}`, {
            embed: embed
        });
        await r.message.channel.setName(`닫힌-${r.message.channel.name}`);
        console.log(r.message.channel.name)
        await r.message.channel.overwritePermissions([
            {
                id: client.guilds.cache.get(ops.guildId).roles.everyone.id,
                deny: [
                    'ADD_REACTIONS',
                    'ATTACH_FILES',
                    'CREATE_INSTANT_INVITE',
                    'EMBED_LINKS',
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_WEBHOOKS',
                    'MANAGE_ROLES',
                    'MENTION_EVERYONE',
                    'READ_MESSAGE_HISTORY',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS',
                    'VIEW_CHANNEL'
                ]
            },
            {
                id: ops.guildAdminRole,
                allow: [
                    'ADD_REACTIONS',
                    'ATTACH_FILES',
                    'CREATE_INSTANT_INVITE',
                    'EMBED_LINKS',
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_WEBHOOKS',
                    'MANAGE_ROLES',
                    'MENTION_EVERYONE',
                    'READ_MESSAGE_HISTORY',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS',
                    'VIEW_CHANNEL'
                ]
            },
            {
                id: r.message.channel.name.replace('닫힌-티켓-', '').replace('티켓-', '').split('-')[0],
                allow: [
                    'ADD_REACTIONS',
                    'CREATE_INSTANT_INVITE',
                    'READ_MESSAGE_HISTORY',
                    'VIEW_CHANNEL'
                ],
                deny: [
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_ROLES',
                    'MANAGE_WEBHOOKS',
                    'MENTION_EVERYONE',
                    'ATTACH_FILES',
                    'EMBED_LINKS',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS'
                ]
            }
        ]);
        await m.react('🔓');
        await m.react('🗑');
    } else if (r.emoji.name == '🔓') {
        if (!r.message.channel.name.startsWith('닫힌-티켓-')) return;
        r.users.remove(u.id);
        const embed = new Discord.MessageEmbed()
            .setTitle('티켓이 열렸어요')
            .setDescription('아래 반응을 클릭해서 티켓을 닫을 수 있어요.')
            .setColor('RANDOM')
            .setFooter(u.tag, u.displayAvatarURL())
            .setTimestamp()
        let m = await r.message.channel.send(`${u} ${client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole)}`, {
            embed: embed
        });
        await r.message.channel.setName(r.message.channel.name.substr(3));
        await r.message.channel.overwritePermissions([
            {
                id: client.guilds.cache.get(ops.guildId).roles.everyone.id,
                deny: [
                    'ADD_REACTIONS',
                    'ATTACH_FILES',
                    'CREATE_INSTANT_INVITE',
                    'EMBED_LINKS',
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_WEBHOOKS',
                    'MANAGE_ROLES',
                    'MENTION_EVERYONE',
                    'READ_MESSAGE_HISTORY',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS',
                    'VIEW_CHANNEL'
                ]
            },
            {
                id: ops.guildAdminRole,
                allow: [
                    'ADD_REACTIONS',
                    'ATTACH_FILES',
                    'CREATE_INSTANT_INVITE',
                    'EMBED_LINKS',
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_WEBHOOKS',
                    'MANAGE_ROLES',
                    'MENTION_EVERYONE',
                    'READ_MESSAGE_HISTORY',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS',
                    'VIEW_CHANNEL'
                ]
            },
            {
                id: r.message.channel.name.replace('닫힌-티켓-', '').replace('티켓-', '').split('-')[0],
                allow: [
                    'ADD_REACTIONS',
                    'ATTACH_FILES',
                    'CREATE_INSTANT_INVITE',
                    'EMBED_LINKS',
                    'READ_MESSAGE_HISTORY',
                    'SEND_MESSAGES',
                    'SEND_TTS_MESSAGES',
                    'USE_EXTERNAL_EMOJIS',
                    'VIEW_CHANNEL'
                ],
                deny: [
                    'MANAGE_CHANNELS',
                    'MANAGE_MESSAGES',
                    'MANAGE_ROLES',
                    'MANAGE_WEBHOOKS',
                    'MENTION_EVERYONE'
                ]
            }
        ]);
        await m.react('🔒')
    } else if (r.emoji.name == '🗑') {
        if (!r.message.channel.name.startsWith('닫힌-티켓-')) return;
        r.users.remove(u.id);
        if (!r.message.guild.member(u).roles.cache.has(ops.guildAdminRole)) return r.message.channel.send('티켓 채널 삭제는 관리자만 할 수 있어요.');
        const embed = new Discord.MessageEmbed()
        .setTitle('티켓을 완전히 지울까요?')
        .setDescription('한번 지우면 다시 복구할 수 없어요.')
        .setColor('RANDOM')
        .setFooter(u.tag, u.displayAvatarURL())
        .setTimestamp()
        let m = await r.message.channel.send({
            embed: embed
        });
        await m.react('✅');
        await m.react('❌');
        const filter = (rct, usr) => usr.id == u.id && (rct.emoji.name == '✅' || rct.emoji.name == '❌');
        const collector = m.createReactionCollector(filter, {
            max: 1
        });
        collector.on('end', collected => {
            if (collected.first().emoji.name == '✅') {
                r.message.channel.delete();
            } else {
                embed.setTitle('티켓 삭제가 취소되었어요.')
                .setDescription('위에 있는 삭제 이모지를 클릭해서 티켓을 언제든지 삭제할 수 있어요.')
                .setColor('RANDOM')
                .setTimestamp()
                m.edit({
                    embed: embed
                });
            }
        });
    }
});
client.on('messageReactionRemove', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (r.message.id != ops.roleMessage) return;
    if (r.emoji.name == '⏰') {
        await r.message.guild.member(u).roles.remove(ops.alarmRole);
    } else if (r.emoji.name == '💻') {
        await r.message.guild.member(u).roles.remove(ops.teamAlarmRole);
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
    if (ops.invites.some(x => message.content.includes(x)) && !ops.inviteWLChannels.includes(message.channel.id)) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('messageUpdate', async (_old, message) => {
    if (message.author.bot) return;
    if (message.member.roles.cache.has(ops.adminRole)) return;
    if (ops.invites.some(x => message.content.includes(x)) && !ops.inviteWLChannels.includes(message.channel.id)) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('rateLimit', data => {
    client.channels.cache.get('758554125759152210').send(`ratelimit\ntimeout: ${data.timeout}ms\nlimit: ${data.limit}`)
})
client.on('ready', () => {
    require('./web.js').start(client, ops);
    setInterval(() => {

        switch (Math.floor(Math.random() * 5)) {
            case 0:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `int 관리`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 1:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `이 메시지는 10초마다 바뀝니다!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 2:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `${client.guilds.cache.get(ops.guildId).members.cache.filter(x => !x.user.bot).size}명의 멤버와 함께하는 int입니다!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 3:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `i.help를 보내 물어보세요!`,
                        type: 'PLAYING'
                    }
                });
                break;
            case 4:
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `int`,
                        type: 'STREAMING',
                        url: 'https://twitch.tv/int'
                    }
                });
                break;
        }
    }, 10000);
});
client.login(process.env.TOKEN);