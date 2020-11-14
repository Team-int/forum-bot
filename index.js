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
function memberChanges(o, n) {
    let arr = [];
    if (o.displayHexColor != n.displayHexColor) arr.push({
        name: '디스플레이 색',
        value: `${o.displayHexColor} -> ${n.displayHexColor}`
    });
    if (o.displayName != n.displayName) arr.push({
        name: '디스플레이 이름',
        value: `${o.displayName} -> ${n.displayName}`
    });
    if (o.nickname != n.nickname) arr.push({
        name: '서버 내 별명',
        value: `${o.nickname || '없음'} -> ${n.nickname || '없음'}`
    });
    if (o.premiumSince != n.premiumSince) arr.push({
        name: '서버 부스트 여부',
        value: `${o.premiumSince ? '✅' : '❌'} -> ${n.premiumSince ? '✅' : '❌'}`
    });
    if (o.roles.cache.array() != n.roles.cache.array()) {
        let arr2 = [];
        for (let i of o.roles.cache.array()) {
            if (!n.roles.cache.get(i.id)) arr2.push(`${i}: ✅ -> ❌`)
        }
        for (let i of n.roles.cache.array()) {
            if (!o.roles.cache.get(i.id)) arr2.push(`${i}: ❌ -> ✅`)
        }
        arr.push({
            name: '역할',
            value: arr2.join('\n') || '변경되지 않음'
        });
    }
    if (o.voice != n.voice) arr.push({
        name: '음성 상태',
        value: `변경됨`
    });
    return arr;
}
function guildChanges(o, n) {
    let arr = [];
    if (o.banner != n.banner) arr.push({
        name: '서버 배너',
        value: `${o.bannerURL() || '없음'} -> ${n.bannerURL() || '없음'}`
    });
    if (o.defaultMessageNotifications != n.defaultMessageNotifications) arr.push({
        name: '알림 설정 기본값',
        value: `${ops.notifySettings[o.defaultMessageNotifications]} -> ${ops.notifySettings[n.defaultMessageNotifications]}`
    });
    if (o.description != n.description) arr.push({
        name: '서버 설명(디스커버리에 보여짐)',
        value: `${o.description || '없음'} -> ${n.description || '없음'}`
    });
    if (o.discoverySplash != n.discoverySplash) arr.push({
        name: '디스커버리 스플래시',
        value: `${o.discoverySplashURL() || '없음'} -> ${n.discoverySplashURL() || '없음'}`
    });
    if (o.emojis.cache.array() != n.emojis.cache.array()) arr.push({
        name: '서버 이모지',
        value: '변경됨'
    });
    if (o.explicitContentFilter != n.explicitContentFilter) arr.push({
        name: '유해 미디어 콘텐츠 필터',
        value: `${ops.explicitFilterSettings[o.explicitContentFilter]} -> ${ops.explicitFilterSettings[n.explicitContentFilter]}`
    });
    if (o.icon != n.icon) arr.push({
        name: '서버 아이콘',
        value: `${o.iconURL() || '없음'} -> ${n.iconURL() || '없음'}`
    });
    if (o.mfaLevel != n.mfaLevel) arr.push({
        name: '서버 관리에 2FA 필요 여부',
        value: `${o.mfaLevel == 1 ? '✅' : '❌'} -> ${n.mfaLevel == 1 ? '✅' : '❌'}`
    });
    if (o.name != n.name) arr.push({
        name: '서버 이름',
        value: `${o.name} -> ${n.name}`
    });
    if (o.owner != n.owner) arr.push({
        name: '서버 주인',
        value: `${o.owner.user}(${o.owner.user.id}) -> ${n.owner.user}(${n.owner.user.id})`
    });
    if (o.partnered != n.partnered) arr.push({
        name: 'Discord Partner 서버 여부',
        value: `${o.partnered ? '✅' : '❌'} -> ${n.partnered ? '✅' : '❌'}`
    });
    if (o.preferredLocale != n.preferredLocale) arr.push({
        name: '서버 주요 사용 언어',
        value: `${o.preferredLocale} -> ${n.preferredLocale}`
    });
    if (o.premiumSubscriptionCount != n.premiumSubscriptionCount) arr.push({
        name: '서버 부스트 횟수',
        value: `${o.premiumSubscriptionCount}번 -> ${n.premiumSubscriptionCount}번`
    });
    if (o.premiumTier != n.premiumTier) arr.push({
        name: '서버 부스트 레벨',
        value: `레벨 ${o.premiumTier} -> 레벨 ${n.premiumTier}`
    });
    if (o.publicUpdatesChannel != n.publicUpdatesChannel) arr.push({
        name: '커뮤니티 업데이트 채널',
        value: `${o.publicUpdatesChannel ? `${o.publicUpdatesChannel}(${o.publicUpdatesChannel.id})` : `없음`} -> ${n.publicUpdatesChannel ? `${n.publicUpdatesChannel}(${n.publicUpdatesChannel.id})` : `없음`}`
    });
    if (o.region != n.region) arr.push({
        name: '음성 서버 위치',
        value: `${o.region} -> ${n.region}`
    });
    if (o.rulesChannel != n.rulesChannel) arr.push({
        name: '서버 규칙 채널',
        value: `${o.rulesChannel ? `${o.rulesChannel}(${o.rulesChannel.id})` : `없음`} -> ${n.rulesChannel ? `${n.rulesChannel}(${n.rulesChannel.id})` : `없음`}`
    });
    if (o.splash != n.splash) arr.push({
        name: '서버 초대 배경',
        value: `${o.splashURL() || '없음'} -> ${n.splashURL() || '없음'}`
    });
    if (o.systemChannel != n.systemChannel) arr.push({
        name: '시스템 메세지 채널',
        value: `${o.systemChannel ? `${o.systemChannel}(${o.systemChannel.id})` : `없음`} -> ${n.systemChannel ? `${n.systemChannel}(${n.systemChannel.id})` : `없음`}`
    });
    if (o.systemChannelFlags.bitfield != n.systemChannelFlags.bitfield) {
        let arr2 = [];
        for (let i of n.systemChannelFlags.toArray()) {
            if (!o.systemChannelFlags.toArray().find(x => x == i)) arr2.push(`${ops.sysMsg[i]}: ✅ -> ❌`)
        }
        for (let i of o.systemChannelFlags.toArray()) {
            if (!n.systemChannelFlags.toArray().find(x => x == i)) arr2.push(`${ops.sysMsg[i]}: ❌ -> ✅`)
        }
        arr.push({
            name: '시스템 메세지 내용',
            value: arr2.join('\n') || '변경되지 않음'
        });
    }
    if (o.vanityURLCode != n.vanityURLCode) arr.push({
        name: '커스텀 초대 링크',
        value: `${o.vanityURLCode ? `https://discord.gg/${o.vanityURLCode}` : '없음'} -> ${n.vanityURLCode ? `https://discord.gg/${n.vanityURLCode}` : '없음'}`
    });
    if (o.verificationLevel != n.verificationLevel) arr.push({
        name: '서버 보안 수준',
        value: `${ops.verifyLevel[o.verificationLevel]} -> ${ops.verifyLevel[n.verificationLevel]}`
    });
    if (o.verified != n.verified) arr.push({
        name: '인증된 서버 여부',
        value: `${o.verified ? '✅' : '❌'} -> ${n.verified ? '✅' : '❌'}`
    });
    if (o.widgetChannel != n.widgetChannel) arr.push({
        name: '서버 위젯 채널',
        value: `${o.widgetChannel ? `${o.widgetChannel}(${o.widgetChannel.id})` : `없음`} -> ${n.widgetChannel ? `${n.widgetChannel}(${n.widgetChannel.id})` : `없음`}`
    });
    if (o.widgetEnabled != n.widgetEnabled) arr.push({
        name: '서버 위젯 사용 여부',
        value: `${o.widgetEnabled ? '✅' : '❌'} -> ${n.widgetEnabled ? '✅' : '❌'}`
    });
    console.log(arr);
    return arr;
}
function roleChanges(o, n) {
    let arr = [];
    if (o.hexColor != n.hexColor) arr.push({
        name: '역할 색',
        value: `${o.hexColor} -> ${n.hexColor}`
    });
    if (o.hoist != n.hoist) arr.push({
        name: '역할 호이스팅 여부',
        value: `${o.hoist ? '✅' : '❌'} -> ${n.hoist ? '✅' : '❌'}`
    });
    if (o.mentionable != n.mentionable) arr.push({
        name: '역할 멘션 가능 여부',
        value: `${o.mentionable ? '✅' : '❌'} -> ${n.mentionable ? '✅' : '❌'}`
    });
    if (o.permissions.bitfield != n.permissions.bitfield) {
        let arr2 = [];
        for (let i of o.permissions.toArray()) {
            if (!n.permissions.toArray().find(x => x == i)) arr2.push(`${ops.rolePerms[i]}: ✅ -> ❌`)
        }
        for (let i of n.permissions.toArray()) {
            if (!o.permissions.toArray().find(x => x == i)) arr2.push(`${ops.rolePerms[i]}: ❌ -> ✅`)
        }
        arr.push({
            name: '권한',
            value: arr2.join('\n') || '변경되지 않음'
        });
    }
    return arr;
}
function channelChanges(o, n) {
    let arr = [];
    if (o.name != n.name) arr.push({
        name: '채널 이름',
        value: `${o.name} -> ${n.name}`
    });
    if (o.position != n.position) arr.push({
        name: '채널 순서',
        value: `${o.position} -> ${n.position}`
    });
    if (o.parent != n.parent) arr.push({
        name: '채널 카테고리',
        value: `${o.parent ? `${o.parent.name}(${o.parent.id})` : '카테고리 없음'} -> ${n.parent ? `${n.parent.name}(${n.parent.id})` : '카테고리 없음'}`
    });
    if (o.topic != n.topic) arr.push({
        name: '채널 주제',
        value: `${o.topic || '없음'} -> ${n.topic || '없음'}`
    });
    if (o.nsfw != n.nsfw) arr.push({
        name: 'NSFW 여부',
        value: `${o.nsfw ? '✅' : '❌'} -> ${n.nsfw ? '✅' : '❌'}`
    });
    if (o.type != n.type) arr.push({
        name: '채널 타입',
        value: `${ops.channels[o.type]} -> ${ops.channels[n.type]}`
    });
    if (o.rateLimitPerUser != n.rateLimitPerUser) arr.push({
        name: '슬로우 모드',
        value: `${o.rateLimitPerUser != undefined ? (o.ratelimitPerUser == 0 ? '슬로우 모드 없음' : `${o.rateLimitPerUser}초`) : '해당 없음'} -> ${n.rateLimitPerUser != undefined ? (n.rateLimitPerUser == 0 ? '슬로우 모두 없음' : `${n.rateLimitPerUser}초`) : '해당 없음'}`
    });
    if (o.bitrate != n.bitrate) arr.push({
        name: '비트레이트',
        value: `${o.bitrate != undefined ? `${o.bitrate / 1000}kbps` : '없음'} -> ${n.bitrate != undefined ? `${n.bitrate/ 1000}kbps` : '없음'}`
    });
    if (o.userLimit != n.userLimit) arr.push({
        name: '유저 수 제한',
        value: `${o.userLimit != undefined ? (o.userLimit == 0 ? '제한 없음' : `${o.userLimit}명`) : '해당 없음'} -> ${n.userLimit != undefined ? (n.userLimit == 0 ? '제한 없음' : `${n.userLimit}명`) : '해당 없음'}`
    });
    if (o.permissionOverwrites.array() != n.permissionOverwrites.array()) arr.push({
        name: '채널 권한',
        value: '변경됨'
    });
    return arr;
}
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
    if (member.user.bot) await member.roles.add('751403263030722621');
});
client.on('messageReactionAdd', async (r, u) => {
    if (r.partial) await r.fetch();
    if (r.message.partial) await r.message.fetch();
    if (u.id == client.user.id) return;
    if (r.emoji.name == 'yes') {
        if (r.message.id != ops.verifyMessage) {
            if (r.message.channel.id == ops.roleMessage) {
                r.message.member.roles.add(ops.animeRole);
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
    } else if (r.emoji.name == 'check') {
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
                .setColor('RANDOM')
                .setFooter(u.tag, u.displayAvatarURL())
                .setTimestamp()
            let m = await tktCh.send(u.toString(), {
                embed: embed
            });
            const embed2 = new Discord.MessageEmbed()
                .setTitle('티켓이 열렸어요! 관리자는 일하세요!')
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
    if (message.channel.id == ops.noticeChannel) {
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
client.on('messageUpdate', async (old, message) => {
    if (!message.author || message.author.bot) return;
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle('메세지 수정됨')
        .setColor('RANDOM')
        .addField('새 메세지', message.content ? (message.content.length > 1024 ? `${message.content.substr(0, 1021)}...` : message.content) : '내용 없음')
        .addField('기존 메세지', old.content ? (old.content.length > 1024 ? `${old.content.substr(0, 1021)}...` : old.content) : '내용 없음')
        .addField('메세지 링크', message.url)
        .addField('유저', `${message.author.toString()}(${message.author.id})`)
        .addField('채널', `${message.channel.toString()}(${message.channel.id})`)
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
    });
    if (message.member.roles.cache.has(ops.adminRole)) return;
    if (ops.invites.some(x => message.content.includes(x)) && !ops.inviteWLChannels.includes(message.channel.id)) {
        await message.delete();
        message.author.send('초대 링크는 보낼 수 없어요.');
    }
});
client.on('messageDelete', message => {
    if (!message.author || message.author.bot) return;
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle('메세지 삭제됨')
        .setColor('RANDOM')
        .addField('메세지 내용', message.content ? (message.content.length > 1024 ? `${message.content.substr(0, 1021)}...` : message.content) : '내용 없음')
        .addField('메세지 id', message.id)
        .addField('유저', `${message.author}(${message.author.id})`)
        .addField('채널', `${message.channel}(${message.channel.id})`)
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('messageDeleteBulk', async messages => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MESSAGE_BULK_DELETE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`메세지 ${messages.size}개 삭제됨`)
        .setColor('RANDOM')
        .addField('채널', `${messages.first().channel}(${messages.first().channel.id})`)
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('channelCreate', async channel => {
    if (channel.type == 'dm') return;
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'CHANNEL_CREATE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`채널 생성됨`)
        .setColor('RANDOM')
        .addField('채널', `${channel}(${channel.id})`)
        .addField('채널 타입', ops.channels[channel.type])
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('channelDelete', async channel => {
    if (channel.type == 'dm') return;
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'CHANNEL_DELETE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`채널 삭제됨`)
        .setColor('RANDOM')
        .addField('채널', `${channel.name}(${channel.id})`)
        .addField('채널 타입', ops.channels[channel.type])
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('guildBanAdd', async (guild, user) => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MEMBER_BAN_ADD'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`멤버 차단됨`)
        .setColor('RANDOM')
        .addField('차단된 유저', `${user.tag || '알 수 없는 유저'}(${user.id})`)
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('guildBanRemove', async (guild, user) => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MEMBER_BAN_REMOVE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`멤버 차단 해제됨`)
        .setColor('RANDOM')
        .addField('차단 해제된 유저', `${user.tag || '알 수 없는 유저'}(${user.id})`)
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('channelUpdate', async (old, _new) => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'CHANNEL_UPDATE'
    });
    if (_new.type == 'dm') return;
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`채널 설정 변경됨`)
        .setColor('RANDOM')
        .addField('채널', `${_new}(${_new.id})`)
        .addFields(channelChanges(old, _new))
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('roleCreate', async role => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'ROLE_CREATE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`역할 생성됨`)
        .setColor('RANDOM')
        .addField('역할', `${role}(${role.id})`)
        .addField('역할 색', role.hexColor)
        .addField('역할 호이스팅 여부', role.hoist ? '✅' : '❌')
        .addField('역할 멘션 가능 여부', role.mentionable ? '✅' : '❌')
        .addField('권한', role.permissions.toArray().map(x => ops.rolePerms[x]).join('\n'))
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('roleUpdate', async (old, _new) => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'ROLE_UPDATE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`역할 수정됨`)
        .setColor('RANDOM')
        .addField('역할', `${_new}(${_new.id})`)
        .addFields(roleChanges(old, _new))
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('roleDelete', async role => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'ROLE_DELETE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`역할 삭제됨`)
        .setColor('RANDOM')
        .addField('역할', `${role.name}(${role.id})`)
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('guildUpdate', async (old, _new) => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'GUILD_UPDATE'
    });
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`서버 설정 변경됨`)
        .setColor('RANDOM')
        .addFields(guildChanges(old, _new))
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('guildMemberRemove', async member => {
    let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MEMBER_KICK'
    });
    if (!al || !al.entries || !al.entries.first() || !al.entries.first() || !al.entries.first().target || al.entries.first().target.id != member.user.id) return;
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`멤버 추방됨`)
        .setColor('RANDOM')
        .addField('추방된 유저', `${member.user.tag}(${member.user.id})`)
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('guildMemberUpdate', async (old, _new) => {
    let al;
    let al1 = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MEMBER_UPDATE'
    });
    let al2 = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
        type: 'MEMBER_ROLE_UPDATE'
    });
    if (al1.entries.first().createdAt > al2.entries.first().createdAt) {
        al = al1;
    } else {
        al = al2;
    }
    client.channels.cache.get(ops.logChannel).send({
        embed: new Discord.MessageEmbed()
        .setTitle(`멤버 설정 변경됨`)
        .setColor('RANDOM')
        .addField('멤버', `${_new.user}(${_new.id})`)
        .addFields(memberChanges(old, _new))
        .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
        .setTimestamp()
    });
});
client.on('ready', () => {
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
require('./web.js').start(client, ops);
client.login(process.env.TOKEN);
