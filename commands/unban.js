const Discord = require('discord.js')
const webpush = require('web-push')
module.exports = {
  name: 'unban',
  aliases: ['언밴', '차단해제', 'ㅕㅜㅠ무', 'djsqos', 'ckeksgowp'],
  description: '멤버의 차단을 해제해요. (봇 관리자만 가능)',
  usage: 'i.unban <유저 id>',
  run: async (client, message, args, ops) => {
    if (!message.member.roles.cache.has(ops.adminRole))
      return message.channel.send('봇 관리자만 사용할 수 있어요.')
    if (!args[1]) return message.channel.send('차단 해제할 유저의 id를 입력해주세요.')
    if (!(await message.guild.fetchBans()).has(args[1]))
      return message.channel.send('이 유저는 차단되어있지 않아요.')
    let info = (await message.guild.fetchBans()).get(args[1])
    const embed = new Discord.MessageEmbed()
      .setTitle('멤버를 차단 해제할까요?')
      .setColor('RANDOM')
      .addField('차단 해제할 유저', info.user.tag)
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
    let m = await message.channel.send({
      embed: embed
    })
    await m.react('✅')
    await m.react('❌')
    const filter = (r, u) =>
      u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌')
    const collector = m.createReactionCollector(filter, {
      max: 1
    })
    collector.on('end', async (collected) => {
      if (collected.first().emoji.name == '✅') {
        message.guild.members.unban(args[1])
        embed
          .setTitle('멤버가 차단 해제되었어요.')
          .setColor('RANDOM')
          .setTimestamp()
          .spliceFields(0, 1, {
            name: '차단 해제된 유저',
            value: info.user.tag
          })
        await m.edit({
          embed: embed
        })
        webpush.setGCMAPIKey(process.env.GCM_API_KEY)
        webpush.setVapidDetails(
          'mailto: mswgen02@gmail.com',
          'BI600VywPkLZAS9ULBbIO35OiwO8ZVYmDDwajL2_MrypJFoEZrMeeGPFZZevWGfn0wZEzcM4Y3V76lN30daPJTY',
          process.env.VAPID_PRIVATE_KEY
        )
        let sub = require('/home/azureuser/intmanager/data/notifications.json').subscriptions
        sub.forEach((s) => {
          webpush.sendNotification(
            s,
            JSON.stringify({
              title: '멤버 차단 해제됨',
              body: `${info.user.tag}(${info.user.id})님이 ${message.guild.name}에서 차단 해제되었어요.`,
              icon: '/static/image/inticon-512.png'
            })
          )
        })
      } else {
        embed.setTitle('멤버 차단 해제가 취소되었어요.').setColor('RANDOM').setTimestamp()
        await m.edit({
          embed: embed
        })
      }
    })
  }
}
