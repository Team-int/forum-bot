const Discord = require('discord.js');
module.exports = {
    name: 'mute',
    aliases: ['뮤트', 'ㅡㅕㅅㄷ', 'abxm'],
    description: '유저를 뮤트해요. (봇 관리자만 사용 가능)',
    usage: 'i.mute <유저 멘션> [뮤트 이유]',
    run: async (client, message, args, ops) => {
        if (!message.member.roles.cache.has(ops.adminRole)) return message.channel.send('봇 관리자만 사용할 수 있어요.');
        if (!message.mentions.users.first()) return message.channel.send('뮤트할 유저를 멘션해주세요');
        if (!message.guild.member(message.mentions.users.first())) return message.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!message.guild.member(message.mentions.users.first()).manageable) return message.channel.send('이 유저는 제가 뮤트할 수 없어요.');
        if (message.guild.member(message.mentions.users.first()).roles.cache.has(ops.mutedRole)) return message.channel.send('이 유저는 이미 뮤트되어있어요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 뮤트할까요?')
            .setColor('RANDOM')
            .addField('뮤트할 멤버', message.mentions.users.first().toString())
            .addField('뮤트 이유', args.slice(2).join(' ') || '없음')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp();
        let m = await client.channels.cache.get(message.channel.id).send({
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
                await message.mentions.users.first().send({
                    embed: new Discord.MessageEmbed()
                        .setTitle(`${message.guild.name}에서 뮤트되었어요`)
                        .setColor('RANDOM')
                        .addField('뮤트 이유', args.slice(2).join(' ') || '없음')
                        .addField('뮤트한 유저', message.author.tag)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                });
                await message.guild.member(message.mentions.users.first()).roles.add(ops.mutedRole)
                await message.guild.member(message.mentions.users.first()).roles.remove(ops.userRole)
                embed.setTitle('멤버가 뮤트되었어요')
                    .setColor('RANDOM')
                    .spliceFields(0, 1, {
                        name: '뮤트한 멤버',
                        value: message.mentions.users.first().toString()
                    })
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('멤버 뮤트가 취소되었어요')
                    .setColor('RANDOM')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
    }
}