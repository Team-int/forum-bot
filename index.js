require('dotenv').config();
const Discord = require('discord.js');
const ops = require('./config.json');
const ascii = require('ascii-table');
const fs = require('fs');
const axios = require('axios').default;
const table1 = new ascii();
const table2 = new ascii();
const client = new Discord.Client({
    partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER', 'USER']
});
client.verifyQueue = new Discord.Collection();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.paths = new Discord.Collection();
client.callQueue = new Discord.Collection();

table1.setHeading('Command', 'Load Status');
fs.readdir('./commands/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./commands/${file}`);
            if (pull.name && pull.run && pull.aliases) {
                table1.addRow(file, '✅');
                for (let alias of pull.aliases) {
                    client.aliases.set(alias, pull.name);
                }
                client.commands.set(pull.name, pull);
            } else {
                table1.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) {
            table1.addRow(file, `❌ -> ${e}`);
            continue;
        }
    }
    console.log(table1.toString());
});
table2.setHeading('Path', 'Load Status');
fs.readdir('./web/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./web/${file}`);
            if (pull.pathname && pull.run && pull.method) {
                table2.addRow(file, '✅');
                client.paths.set(pull.pathname, pull);
            } else {
                table2.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) {
            table2.addRow(file, `❌ -> ${e}`);
            continue;
        }
    }
    console.log(table2.toString());
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
setInterval(() => {
    let date = new Date();
    if (date.getDay() == 0 && date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() <= 3) {
        let workStat = require('data/work.json');
        workStat.anal = {};
        fs.writeFileSync('data/work.json', JSON.stringify(workStat));
    }
}, 2000);
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
    } else {
        let s = 0;
        let sname = undefined;
        let typed = args[0];
        let valids = [];
        for (let x of client.commands.array()) {
            for (let y of x.aliases) {
                valids.push(y);
            }
            valids.push(x.name);
        }
        for (let curr of valids) {
            let cnt = 0;
            let i = 0;
            for (let curlet of curr.split('')) {
                if (curlet[i] && typed.split('')[i] && curlet[i] == typed.split('')[i]) {
                    cnt++;
                }
                i++;
            }
            if (cnt > s) {
                s = cnt;
                sname = curr;
            }
        }
        if (sname) {
            let msgClone = message;
            let argsClone = args;
            argsClone[0] = `${ops.prefix}${sname}`;
            msgClone.content = message.content.replace(typed, sname);
            let m = await message.channel.send({
                embed: new Discord.MessageEmbed()
                    .setTitle('명령어 자동 수정')
                    .setColor('GREEN')
                    .setDescription('입력한 명령어는 존재하지 않아요.\n대신 아래 명령어를 대신 실행하까요?')
                    .addField('실행할 명령어', msgClone.content)
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp()
            });
            await m.react('✅');
            await m.react('❌');
            const filter = (r, u) => (r.emoji.name == '✅' || r.emoji.name == '❌') && u.id == message.author.id;
            const collector = m.createReactionCollector(filter, {
                max: 1
            });
            collector.on('end', collected => {
                m.delete();
                if (collected.first().emoji.name == '✅') {
                    (client.commands.get(sname) || client.commands.get(client.aliases.get(sname))).run(client, msgClone, argsClone, ops);
                }
            });
        }
    }
    message.channel.stopTyping(true);
});

client.on('messageReactionAdd', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (u.id == client.user.id) return;
    if (r.emoji.name == 'yes') {
        if (r.message.id != ops.verifyMessage) {
            if (r.message.id == ops.roleMessage) {
                await r.message.guild.member(u).roles.add(ops.animeRole);
            }
            return;
        }
        if (u.id == client.user.id) return;
        if (u.bot) return r.users.remove(u.id);
        r.users.remove(u.id);
        if (r.message.guild.member(u).roles.cache.has(ops.userRole)) return;
        let tkn = tokenGen(client);
        client.verifyQueue.set(tkn, u);
        u.send(`아래 링크를 눌러 인증해주세요.\nhttps://manager.intteam.co.kr/verify?token=${tkn}`)
    } else if (r.emoji.name == '⏰') {
        if (r.message.id != ops.roleMessage) return;
        if (u.bot) return r.users.remove(u.id);
        await r.message.guild.member(u).roles.add(ops.alarmRole);
    } else if (r.emoji.name == '💻') {
        if (r.message.id != ops.roleMessage) return;
        if (u.bot) return r.users.remove(u.id);
        await r.message.guild.member(u).roles.add(ops.teamAlarmRole);
    } else if (r.emoji.name == '🎫') {
        if (r.message.id != ops.ticketMessage) return;
        if (u.bot) return r.users.remove(u.id);
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
                .setDescription('문의 하실 내용이 무엇인가요?')
                .setColor('GREEN')
                .setFooter(u.tag, u.displayAvatarURL())
                .setTimestamp()
            let m = await tktCh.send(u.toString(), {
                embed: embed
            });
            const embed2 = new Discord.MessageEmbed()
                .setTitle('티켓이 열렸어요! 관리자는 일하세요!')
                .addField('티켓 채널', tktCh.toString())
                .setColor('YELLOW')
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
            .setColor('RED')
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
            .setColor('GREEN')
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
            .setColor('RED')
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
    } else if (r.emoji.name == 'yes') {
        await r.message.guild.member(u).roles.remove(ops.animeRole);
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
    if (message.channel.id == ops.noticeChannel) {
        if (message.author.id != client.user.id) return message.delete();
        axios.post(`https://discord.com/api/channels/${message.channel.id}/messages/${message.id}/crosspost`, {}, {
            headers: {
                Authorization: `Bot ${client.token}`
            }
        });
    }
    if (!message.author || message.author.bot) return;
    if (message.member.roles.cache.has(ops.adminRole)) return;
    if (ops.invites.some(x => message.content.includes(x)) && !ops.inviteWLChannels.includes(message.channel.id)) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('ready', () => {
    backup.setStorageFolder(__dirname + '/backups')
    console.log(`Login ${client.user.username}\n------------------`);
    client.guilds.cache.get(ops.guildId).members.fetch();
    client.users.cache.forEach(x => {
        x.fetch();
    });
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
require("./Utils/log").start(client , ops)
require('./web.js').start(client, ops);
client.login(process.env.TOKEN);
