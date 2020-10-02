const Discord = require('discord.js');
module.exports = {
    name: 'kick',
    aliases: ['추방', '킥', 'ㅏㅑ차', 'zlr', 'cnqkd'],
    description: '유저를 추방해요. (int Team 멤버만 사용 가능)',
    usage: 'i.kick <유저 멘션> [추방 이유]',
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has('761464991340953621')) return message.channel.send('int Team 멤버만 사용할 수 있어요.');
        if (!message.mentions.users.first()) return message.channel.send('추방할 유저를 멘션해주세요');
        if (!message.guild.member(message.mentions.users.first())) return message.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!message.guild.member(message.mentions.users.first()).kickable) return message.channel.send('이 유저는 제가 추방할 수 없어요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 추방할까요?')
            .setColor('RANDOM')
            .addField('추방할 멤버', message.mentions.users.first().toString())
            .addField('추방 이유', args.slice(2).join(' ') || '없음')
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
                        .setTitle(`${message.guild.name}에서 추방되었어요`)
                        .setColor('RANDOM')
                        .addField('추방 이유', args.slice(2).join(' ') || '없음')
                        .addField('추방한 유저', message.author.tag)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                });
                await message.guild.member(message.mentions.users.first()).kick(args.slice(2).join(' '));
                embed.setTitle('멤버가 추방되었어요')
                    .setColor('RANDOM')
                    .spliceFields(0, 1, {
                        name: '추방한 멤버',
                        value: message.mentions.users.first().toString()
                    })
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('멤버 추방이 취소되었어요')
                    .setColor('RANDOM')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
    }
}