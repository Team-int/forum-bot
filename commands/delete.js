const Discord = require('discord.js')
module.exports = {
  name: 'delete',
  aliases: ['tkrwp', '삭제', 'ㅇ딛ㅅㄷ'],
  description:
    '입력한 개수만큼 메세지를 삭제해요. (14일 이내 메세지만 가능, 봇 관리자만 사용 가능)',
  usage: 'i.delete <삭제할 메세지 개수(99 이하의 정수)>',
  run: async (client, message, args, ops) => {
    if (!message.member.roles.cache.has(ops.adminRole))
      return message.channel.send('봇 관리자만 사용할 수 있어요.')
    if (!args[1] || isNaN(args[1]) || parseInt(args[1]) > 99 || parseInt(args[1]) < 1)
      return message.channel.send('삭제할 메세지 개수를 1~99 범위의 정수로 입력해주세요.')
    let deletedMessages = await message.channel.bulkDelete(parseInt(args[1]) + 1)
    let m = await message.channel.send(
      `${
        deletedMessages.size < parseInt(args[1]) ? deletedMessages.size - 1 : parseInt(args[1])
      }개의 메세지를 삭제했어요.`
    )
    setTimeout(() => {
      m.delete()
    }, 5000)
  }
}
