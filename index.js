require('dotenv').config()
const axios = require('axios').default

import Discord from 'discord.js'
import ops from './config.json'
import ascii from 'ascii-table'
import fs from 'fs'

const table1 = new ascii()
const table2 = new ascii()
const client = new Discord.Client({
  partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER', 'USER']
})

client.verifyQueue = new Discord.Collection()
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.paths = new Discord.Collection()
client.callQueue = new Discord.Collection()

import tokenGen from './utils/tokenGen'
import memberChanges from './utils/logger/memberChanges'
import channelChanges from './utils/logger/channelChanges'
import guildChanges from './utils/logger/guildChanges'
import roleChanges from './utils/logger/roleChanges'

table1.setHeading('Command', 'Load Status')

fs.readdir('./commands/', (err, list) => {
  for (let file of list) {
    try {
      let pull = require(`./commands/${file}`)
      if (pull.name && pull.run && pull.aliases) {
        table1.addRow(file, '✅')
        for (let alias of pull.aliases) {
          client.aliases.set(alias, pull.name)
        }
        client.commands.set(pull.name, pull)
      } else {
        table1.addRow(file, '❌ -> Error')
        continue
      }
    } catch (e) {
      table1.addRow(file, `❌ -> ${e}`)
      continue
    }
  }
  console.log(table1.toString())
})
table2.setHeading('Path', 'Load Status')
fs.readdir('./web/', (err, list) => {
  for (let file of list) {
    try {
      let pull = require(`./web/${file}`)
      if (pull.pathname && pull.run && pull.method) {
        table2.addRow(file, '✅')
        client.paths.set(pull.pathname, pull)
      } else {
        table2.addRow(file, '❌ -> Error')
        continue
      }
    } catch (e) {
      table2.addRow(file, `❌ -> ${e}`)
      continue
    }
  }
  console.log(table2.toString())
})
setInterval(() => {
  let date = new Date()
  if (
    date.getDay() == 0 &&
    date.getHours() == 0 &&
    date.getMinutes() == 0 &&
    date.getSeconds() <= 3
  ) {
    let workStat = require('/home/azureuser/intmanager/data/work.json')
    workStat.anal = {}
    fs.writeFileSync('/home/azureuser/intmanager/data/work.json', JSON.stringify(workStat))
  }
}, 2000)
client.on('message', async (message) => {
  if (message.author.bot) return
  if (message.channel.type != 'text' && message.channel.type != 'news') return
  if (!message.content.startsWith(ops.prefix)) return
  message.channel.startTyping(1)
  let args = message.content.substr(ops.prefix.length).trim().split(' ')
  if (client.commands.get(args[0])) {
    client.commands.get(args[0]).run(client, message, args, ops)
  } else if (client.aliases.get(args[0])) {
    client.commands.get(client.aliases.get(args[0])).run(client, message, args, ops)
  } else {
    let s = 0
    let sname = undefined
    let typed = args[0]
    let valids = []
    for (let x of client.commands.array()) {
      for (let y of x.aliases) {
        valids.push(y)
      }
      valids.push(x.name)
    }
    for (let curr of valids) {
      let cnt = 0
      let i = 0
      for (let curlet of curr.split('')) {
        if (curlet[i] && typed.split('')[i] && curlet[i] == typed.split('')[i]) {
          cnt++
        }
        i++
      }
      if (cnt > s) {
        s = cnt
        sname = curr
      }
    }
    if (sname) {
      let msgClone = message
      let argsClone = args
      argsClone[0] = `${ops.prefix}${sname}`
      msgClone.content = message.content.replace(typed, sname)
      let m = await message.channel.send({
        embed: new Discord.MessageEmbed()
          .setTitle('명령어 자동 수정')
          .setColor('RANDOM')
          .setDescription('입력한 명령어는 존재하지 않아요.\n대신 아래 명령어를 대신 실행하까요?')
          .addField('실행할 명령어', msgClone.content)
          .setFooter(message.author.tag, message.author.displayAvatarURL())
          .setTimestamp()
      })
      await m.react('✅')
      await m.react('❌')
      const filter = (r, u) =>
        (r.emoji.name == '✅' || r.emoji.name == '❌') && u.id == message.author.id
      const collector = m.createReactionCollector(filter, {
        max: 1
      })
      collector.on('end', (collected) => {
        m.delete()
        if (collected.first().emoji.name == '✅') {
          ;(client.commands.get(sname) || client.commands.get(client.aliases.get(sname))).run(
            client,
            msgClone,
            argsClone,
            ops
          )
        }
      })
    }
  }
  message.channel.stopTyping(true)
})
let defaultVerifyQueue = new Discord.Collection()
client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return member.roles.add('751403263030722621')
  defaultVerifyQueue.set(member.user.id, member.user.id)
})
client.on('guildMemberRemove', async (member) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('멤버 퇴장')
    .setColor('RANDOM')
    .setDescription(`${member.user.tag}님이 ${member.guild.name}에서 나갔어요`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter(member.user.tag, member.user.displayAvatarURL())
    .setTimestamp()
  if (!member.user.bot)
    await client.channels.cache.get(ops.welcomeChannel).send({
      embed: embed
    })
})
client.on('messageReactionAdd', async (r, u) => {
  if (r.partial) await r.fetch()
  if (r.message.partial) await r.message.fetch()
  if (u.id == client.user.id) return
  if (r.emoji.name == 'yes') {
    if (r.message.id != ops.verifyMessage) {
      if (r.message.id == ops.roleMessage) {
        await r.message.guild.member(u).roles.add(ops.animeRole)
      }
      return
    }
    if (u.id == client.user.id) return
    if (u.bot) return r.users.remove(u.id)
    r.users.remove(u.id)
    if (r.message.guild.member(u).roles.cache.has(ops.userRole)) return
    let tkn = tokenGen(client)
    client.verifyQueue.set(tkn, u)
    u.send(`아래 링크를 눌러 인증해주세요.\nhttps://manager.teamint.xyz/verify?token=${tkn}`)
  } else if (r.emoji.name == '⏰') {
    if (r.message.id != ops.roleMessage) return
    if (u.bot) return r.users.remove(u.id)
    await r.message.guild.member(u).roles.add(ops.alarmRole)
  } else if (r.emoji.name == '💻') {
    if (r.message.id != ops.roleMessage) return
    if (u.bot) return r.users.remove(u.id)
    await r.message.guild.member(u).roles.add(ops.teamAlarmRole)
  } else if (r.emoji.name == '🎫') {
    if (r.message.id != ops.ticketMessage) return
    if (u.bot) return r.users.remove(u.id)
    r.users.remove(u.id)
    client.guilds.cache
      .get(ops.guildId)
      .channels.create(`티켓-${u.id}-${Math.floor(Math.random() * 10000000)}`, {
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
      })
      .then(async (tktCh) => {
        const embed = new Discord.MessageEmbed()
          .setTitle('환영합니다!')
          .setDescription('문의 하실 내용이 무엇인가요?')
          .setColor('RANDOM')
          .setFooter(u.tag, u.displayAvatarURL())
          .setTimestamp()
        let m = await tktCh.send(u.toString(), {
          embed: embed
        })
        const embed2 = new Discord.MessageEmbed()
          .setTitle('티켓이 열렸어요! 관리자는 일하세요!')
          .addField('티켓 채널', tktCh.toString())
          .setColor('RANDOM')
          .setFooter(u.tag, u.displayAvatarURL())
          .setTimestamp()
        await client.channels.cache
          .get(ops.confRoomChannel)
          .send(client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole).toString(), {
            embed: embed2
          })
        await m.react('🔒')
      })
  } else if (r.emoji.name == '🔒') {
    if (!r.message.channel.name.startsWith('티켓-')) return
    r.users.remove(u.id)
    const embed = new Discord.MessageEmbed()
      .setTitle('티켓이 닫혔어요')
      .setDescription('아래 반응을 클릭해서 티켓을 다시 열거나 완전히 지울 수 있어요.')
      .setColor('RANDOM')
      .setFooter(u.tag, u.displayAvatarURL())
      .setTimestamp()
    let m = await r.message.channel.send(
      `${u} ${client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole)}`,
      {
        embed: embed
      }
    )
    await r.message.channel.setName(`닫힌-${r.message.channel.name}`)
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
        allow: ['ADD_REACTIONS', 'CREATE_INSTANT_INVITE', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'],
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
    ])
    await m.react('🔓')
    await m.react('🗑')
  } else if (r.emoji.name == '🔓') {
    if (!r.message.channel.name.startsWith('닫힌-티켓-')) return
    r.users.remove(u.id)
    const embed = new Discord.MessageEmbed()
      .setTitle('티켓이 열렸어요')
      .setDescription('아래 반응을 클릭해서 티켓을 닫을 수 있어요.')
      .setColor('RANDOM')
      .setFooter(u.tag, u.displayAvatarURL())
      .setTimestamp()
    let m = await r.message.channel.send(
      `${u} ${client.guilds.cache.get(ops.guildId).roles.cache.get(ops.adminRole)}`,
      {
        embed: embed
      }
    )
    await r.message.channel.setName(r.message.channel.name.substr(3))
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
    ])
    await m.react('🔒')
  } else if (r.emoji.name == '🗑') {
    if (!r.message.channel.name.startsWith('닫힌-티켓-')) return
    r.users.remove(u.id)
    if (!r.message.guild.member(u).roles.cache.has(ops.guildAdminRole))
      return r.message.channel.send('티켓 채널 삭제는 관리자만 할 수 있어요.')
    const embed = new Discord.MessageEmbed()
      .setTitle('티켓을 완전히 지울까요?')
      .setDescription('한번 지우면 다시 복구할 수 없어요.')
      .setColor('RANDOM')
      .setFooter(u.tag, u.displayAvatarURL())
      .setTimestamp()
    let m = await r.message.channel.send({
      embed: embed
    })
    await m.react('✅')
    await m.react('❌')
    const filter = (rct, usr) =>
      usr.id == u.id && (rct.emoji.name == '✅' || rct.emoji.name == '❌')
    const collector = m.createReactionCollector(filter, {
      max: 1
    })
    collector.on('end', (collected) => {
      if (collected.first().emoji.name == '✅') {
        r.message.channel.delete()
      } else {
        embed
          .setTitle('티켓 삭제가 취소되었어요.')
          .setDescription('위에 있는 삭제 이모지를 클릭해서 티켓을 언제든지 삭제할 수 있어요.')
          .setColor('RANDOM')
          .setTimestamp()
        m.edit({
          embed: embed
        })
      }
    })
  }
})
client.on('messageReactionRemove', async (r, u) => {
  if (r.partial) await r.fetch()
  if (r.message.partial) await r.message.fetch()
  if (r.message.id != ops.roleMessage) return
  if (r.emoji.name == '⏰') {
    await r.message.guild.member(u).roles.remove(ops.alarmRole)
  } else if (r.emoji.name == '💻') {
    await r.message.guild.member(u).roles.remove(ops.teamAlarmRole)
  } else if (r.emoji.name == 'yes') {
    await r.message.guild.member(u).roles.remove(ops.animeRole)
  }
})
client.on('message', (message) => {
  if (!message.system) return
  if (message.channel.id != message.guild.systemChannelID) return
  switch (message.type) {
    case 'USER_PREMIUM_GUILD_SUBSCRIPTION':
      message.delete()
      client.channels.cache
        .get(ops.noticeChannel)
        .send(
          message.author.toString(),
          new Discord.MessageEmbed()
            .setTitle(`새 부스트`)
            .setColor('RANDOM')
            .setDescription(`${message.author}님이 방금 이 서버를 부스트했어요!`)
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        )
      break
    case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1':
      message.delete()
      client.channels.cache
        .get(ops.noticeChannel)
        .send(
          message.author.toString(),
          new Discord.MessageEmbed()
            .setTitle(`새 부스트`)
            .setColor('RANDOM')
            .setDescription(
              `${message.author}님이 방금 이 서버를 부스트했어요! 이제 이 서버의 부스트 레벨은 **1레벨**이에요!`
            )
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        )
      break
    case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2':
      message.delete()
      client.channels.cache
        .get(ops.noticeChannel)
        .send(
          message.author.toString(),
          new Discord.MessageEmbed()
            .setTitle(`새 부스트`)
            .setColor('RANDOM')
            .setDescription(
              `${message.author}님이 방금 이 서버를 부스트했어요! 이제 이 서버의 부스트 레벨은 **2레벨**이에요!`
            )
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        )
      break
    case 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3':
      message.delete()
      client.channels.cache
        .get(ops.noticeChannel)
        .send(
          message.author.toString(),
          new Discord.MessageEmbed()
            .setTitle(`새 부스트`)
            .setColor('RANDOM')
            .setDescription(
              `${message.author}님이 방금 이 서버를 부스트했어요! 이제 이 서버의 부스트 레벨은 **3레벨**이에요!`
            )
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        )
      break
  }
})
client.on('message', (message) => {
  if (message.author.id != ops.mee6Id) return
  if (!message.content.startsWith('GG ')) return
  const member = client.guilds.cache.get(ops.guildId).member(message.mentions.users.first())
  const level = parseInt(message.content.split(' ')[7].replace('!', ''))
  if (level == 5) {
    member.roles.add(ops.levelRoles.m)
  } else if (level == 10) {
    member.roles.add(ops.levelRoles.u)
  } else if (level == 15) {
    member.roles.add(ops.levelRoles.s)
  } else if (level == 20) {
    member.roles.add(ops.levelRoles.k)
  }
})
client.on('message', async (message) => {
  if (message.channel.id == ops.noticeChannel) {
    if (message.author.id != client.user.id) return message.delete()
    axios.post(
      `https://discord.com/api/channels/${message.channel.id}/messages/${message.id}/crosspost`,
      {},
      {
        headers: {
          Authorization: `Bot ${client.token}`
        }
      }
    )
  }
  if (!message.author || message.author.bot) return
  if (message.member.roles.cache.has(ops.adminRole)) return
  if (
    ops.invites.some((x) => message.content.includes(x)) &&
    !ops.inviteWLChannels.includes(message.channel.id)
  ) {
    await message.delete()
    message.author.send('초대 링크는 보낼 수 없어요.')
  }
})
client.on('messageUpdate', async (old, message) => {
  if (!message.author || message.author.bot) return
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle('메세지 수정됨')
      .setColor('RANDOM')
      .addField(
        '새 메세지',
        message.content
          ? message.content.length > 1024
            ? `${message.content.substr(0, 1021)}...`
            : message.content
          : '내용 없음'
      )
      .addField(
        '기존 메세지',
        old.content
          ? old.content.length > 1024
            ? `${old.content.substr(0, 1021)}...`
            : old.content
          : '내용 없음'
      )
      .addField('메세지 링크', message.url)
      .addField('유저', `${message.author.toString()}(${message.author.id})`)
      .addField('채널', `${message.channel.toString()}(${message.channel.id})`)
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
  })
  if (message.member.roles.cache.has(ops.adminRole)) return
  if (
    ops.invites.some((x) => message.content.includes(x)) &&
    !ops.inviteWLChannels.includes(message.channel.id)
  ) {
    await message.delete()
    message.author.send('초대 링크는 보낼 수 없어요.')
  }
})
client.on('messageDelete', (message) => {
  if (!message.author || message.author.bot) return
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle('메세지 삭제됨')
      .setColor('RANDOM')
      .addField(
        '메세지 내용',
        message.content
          ? message.content.length > 1024
            ? `${message.content.substr(0, 1021)}...`
            : message.content
          : '내용 없음'
      )
      .addField('메세지 id', message.id)
      .addField('유저', `${message.author}(${message.author.id})`)
      .addField('채널', `${message.channel}(${message.channel.id})`)
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('messageDeleteBulk', async (messages) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MESSAGE_BULK_DELETE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`메세지 ${messages.size}개 삭제됨`)
      .setColor('RANDOM')
      .addField('채널', `${messages.first().channel}(${messages.first().channel.id})`)
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('channelCreate', async (channel) => {
  if (channel.type == 'dm') return
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'CHANNEL_CREATE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`채널 생성됨`)
      .setColor('RANDOM')
      .addField('채널', `${channel}(${channel.id})`)
      .addField('채널 타입', ops.channels[channel.type])
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('channelDelete', async (channel) => {
  if (channel.type == 'dm') return
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'CHANNEL_DELETE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`채널 삭제됨`)
      .setColor('RANDOM')
      .addField('채널', `${channel.name}(${channel.id})`)
      .addField('채널 타입', ops.channels[channel.type])
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('guildBanAdd', async (guild, user) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MEMBER_BAN_ADD'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`멤버 차단됨`)
      .setColor('RANDOM')
      .addField('차단된 유저', `${user.tag || '알 수 없는 유저'}(${user.id})`)
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('guildBanRemove', async (guild, user) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MEMBER_BAN_REMOVE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`멤버 차단 해제됨`)
      .setColor('RANDOM')
      .addField('차단 해제된 유저', `${user.tag || '알 수 없는 유저'}(${user.id})`)
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('channelUpdate', async (old, _new) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'CHANNEL_UPDATE'
  })
  if (_new.type == 'dm') return
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`채널 설정 변경됨`)
      .setColor('RANDOM')
      .addField('채널', `${_new}(${_new.id})`)
      .addFields(channelChanges(old, _new))
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('roleCreate', async (role) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'ROLE_CREATE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`역할 생성됨`)
      .setColor('RANDOM')
      .addField('역할', `${role}(${role.id})`)
      .addField('역할 색', role.hexColor)
      .addField('역할 호이스팅 여부', role.hoist ? '✅' : '❌')
      .addField('역할 멘션 가능 여부', role.mentionable ? '✅' : '❌')
      .addField(
        '권한',
        role.permissions
          .toArray()
          .map((x) => ops.rolePerms[x])
          .join('\n')
      )
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('roleUpdate', async (old, _new) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'ROLE_UPDATE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`역할 수정됨`)
      .setColor('RANDOM')
      .addField('역할', `${_new}(${_new.id})`)
      .addFields(roleChanges(old, _new))
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('roleDelete', async (role) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'ROLE_DELETE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`역할 삭제됨`)
      .setColor('RANDOM')
      .addField('역할', `${role.name}(${role.id})`)
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('guildUpdate', async (old, _new) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'GUILD_UPDATE'
  })
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`서버 설정 변경됨`)
      .setColor('RANDOM')
      .addFields(guildChanges(old, _new))
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('guildMemberRemove', async (member) => {
  let al = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MEMBER_KICK'
  })
  if (
    !al ||
    !al.entries ||
    !al.entries.first() ||
    !al.entries.first() ||
    !al.entries.first().target ||
    al.entries.first().target.id != member.user.id
  )
    return
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`멤버 추방됨`)
      .setColor('RANDOM')
      .addField('추방된 유저', `${member.user.tag}(${member.user.id})`)
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('guildMemberUpdate', async (old, _new) => {
  let al
  let al1 = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MEMBER_UPDATE'
  })
  let al2 = await client.guilds.cache.get(ops.guildId).fetchAuditLogs({
    type: 'MEMBER_ROLE_UPDATE'
  })
  if (al1.entries.first().createdAt > al2.entries.first().createdAt) {
    al = al1
  } else {
    al = al2
  }
  client.channels.cache.get(ops.logChannel).send({
    embed: new Discord.MessageEmbed()
      .setTitle(`멤버 설정 변경됨`)
      .setColor('RANDOM')
      .addField('멤버', `${_new.user}(${_new.id})`)
      .addFields(memberChanges(old, _new))
      .setFooter(al.entries.first().executor.tag, al.entries.first().executor.displayAvatarURL())
      .setTimestamp()
  })
})
client.on('ready', () => {
  console.log(`Login ${client.user.username}\n------------------`)
  client.guilds.cache.get(ops.guildId).members.fetch()
  client.users.cache.forEach((x) => {
    x.fetch()
  })
  setInterval(() => {
    switch (Math.floor(Math.random() * 5)) {
      case 0:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `int 관리`,
            type: 'PLAYING'
          }
        })
        break
      case 1:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `이 메시지는 10초마다 바뀝니다!`,
            type: 'PLAYING'
          }
        })
        break
      case 2:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `${
              client.guilds.cache.get(ops.guildId).members.cache.filter((x) => !x.user.bot).size
            }명의 멤버와 함께하는 int입니다!`,
            type: 'PLAYING'
          }
        })
        break
      case 3:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `i.help를 보내 물어보세요!`,
            type: 'PLAYING'
          }
        })
        break
      case 4:
        client.user.setPresence({
          status: 'online',
          activity: {
            name: `int`,
            type: 'STREAMING',
            url: 'https://twitch.tv/int'
          }
        })
        break
    }
  }, 10000)
})
client.on('raw', (data) => {
  if (data.t != 'GUILD_MEMBER_UPDATE') return
  if (defaultVerifyQueue.get(data.d.user.id) && !data.d.is_pending) {
    defaultVerifyQueue.delete(data.d.user.id)
    const embed = new Discord.MessageEmbed()
      .setTitle('환영합니다!')
      .setColor('RANDOM')
      .setDescription(
        `<@${data.d.user.id}>님, ${
          client.guilds.cache.get(data.d.guild_id).name
        }에 오신 것을 환영합니다!\n먼저 ${client.channels.cache.get(
          ops.ruleChannel
        )}에서 규칙을 읽고 인증해주세요!`
      )
      .setThumbnail(client.users.cache.get(data.d.user.id).displayAvatarURL())
      .setFooter(
        client.users.cache.get(data.d.user.id).tag,
        client.users.cache.get(data.d.user.id).displayAvatarURL()
      )
      .setTimestamp()
    client.channels.cache.get(ops.welcomeChannel).send(embed)
  }
})
require('./web.js').start(client, ops)
client.login(process.env.TOKEN)
