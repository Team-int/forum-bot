const Discord = require('discord.js');
module.exports = {
    name: 'tempban',
    aliases: ['임시차단', '임시밴', 'ㅅ드ㅔㅠ무', 'dlatlckeks', 'dlatlqos'],
    description: '유저를 임시(1일 이상)로 차단해요. (int Team 멤버만 사용 가능)',
    usage: 'i.tempban <유저 멘션> <차단할 일 수(1 이상의 정수)> [차단 이유]',
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has('761464991340953621')) return message.channel.send('int Team 멤버만 사용할 수 있어요.');
        if (!message.mentions.users.first()) return message.channel.send('차단할 유저를 멘션해주세요');
        if (!args[2] || isNaN(parseInt(args[2])) || parseInt(args[2]) < 1) return message.channel.send('차단할 일 수를 1 이상의 정수로 입력해주세요.')
        if (!message.guild.member(message.mentions.users.first())) return message.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!message.guild.member(message.mentions.users.first()).bannable) return message.channel.send('이 유저는 제가 치딘할 수 없어요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 차단할까요?')
            .setColor('RANDOM')
            .addField('차단할 멤버', message.mentions.users.first().toString())
            .addField('차단할 일 수', args[2])
            .addField('차단 이유', args.slice(3).join(' ') || '없음')
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
                await message.mentions.users.first().send({
                    embed: new Discord.MessageEmbed()
                        .setTitle(`${message.guild.name}에서 차단되었어요`)
                        .setColor('RANDOM')
                        .addField('차단 이유', args.slice(3).join(' ') || '없음')
                        .addField('차단된 날 수', args[2])
                        .addField('차단한 유저', message.author.tag)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                });
                await message.guild.member(message.mentions.users.first()).ban({
                    reason: args.slice(3).join(' ')
                });
                embed.setTitle('멤버가 차단되었어요')
                    .setColor('RANDOM')
                    .spliceFields(0, 2, [{
                        name: '차단한 멤버',
                        value: message.mentions.users.first().toString()
                    }, {
                        name: '차단한 날 수',
                        value: args[2]
                    }])
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
                setTimeout(() => {
                    message.guild.members.unban(message.mentions.users.first().id);
                }, parseInt(args[2]) * 86400000);
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