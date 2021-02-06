const Discord = require('discord.js');
const webpush = require('web-push');
module.exports = {
    name: 'ban',
    aliases: ['차단', '밴', 'ㅠ무', 'ckeks', 'qos'],
    description: '유저를 차단해요. (봇 관리자만 사용 가능)',
    usage: 'i.ban <유저 멘션> [차단 이유]',
    run: async (client, message, args, ops) => {
        if (!message.member.roles.cache.has(ops.adminRole)) return message.channel.send('봇 관리자만 사용할 수 있어요.');
        if (!message.mentions.users.first()) return message.channel.send('차단할 유저를 멘션해주세요');
        if (!message.guild.member(message.mentions.users.first())) return message.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!message.guild.member(message.mentions.users.first()).bannable) return message.channel.send('이 유저는 제가 차딘할 수 없어요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 차단할까요?')
            .setColor('RANDOM')
            .addField('차단할 멤버', message.mentions.users.first().toString())
            .addField('차단 이유', args.slice(2).join(' ') || '없음')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        let m = await message.channel.send({
            embed: embed
        });
        await m.react('✅');
        await m.react('❌');
        const filter = (r, u) => u.id == message.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
        const collector = m.createReactionCollector(filter, {
            max: 1
        });
        collector.on('end', async collected => {
            if (collected.first().emoji.name == '✅') {
                message.mentions.users.first().send({
                    embed: new Discord.MessageEmbed()
                        .setTitle(`${message.guild.name}에서 차단되었어요`)
                        .setColor('RANDOM')
                        .addField('차단 이유', args.slice(2).join(' ') || '없음')
                        .addField('차단한 유저', message.author.tag)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                });
                await message.guild.member(message.mentions.users.first()).ban({
                    reason: args.slice(2).join(' ')
                });
                embed.setTitle('멤버가 차단되었어요')
                    .setColor('RANDOM')
                    .spliceFields(0, 1, {
                        name: '차단한 멤버',
                        value: message.mentions.users.first().toString()
                    })
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
                webpush.setGCMAPIKey(process.env.GCM_API_KEY);
                webpush.setVapidDetails('mailto: mswgen02@gmail.com', 'BI600VywPkLZAS9ULBbIO35OiwO8ZVYmDDwajL2_MrypJFoEZrMeeGPFZZevWGfn0wZEzcM4Y3V76lN30daPJTY', process.env.VAPID_PRIVATE_KEY);
                let sub = require('/home/azureuser/intmanager/data/notifications.json').subscriptions;
                sub.forEach(s => {
                    webpush.sendNotification(s, JSON.stringify({
                        title: '멤버 차단됨',
                        body: `${message.mentions.users.first().tag}(${message.mentions.users.first().id})님이 ${message.guild.name}에서 차단되었어요.\n차단 이유: ${args.slice(2).join(' ') || '없음'}`,
                        icon: '/static/image/inticon-512.png'
                    }));
                });
            } else {
                embed.setTitle('멤버 차단이 취소되었어요')
                    .setColor('RANDOM')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
    }
}
