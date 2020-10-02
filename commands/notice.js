const Discord = require('discord.js');
module.exports = {
    name: 'notice',
    aliases: ['공지', 'rhdwl', 'ㅜㅐ샻ㄷ'],
    description: '공지를 보내요. (int Team 멤버만 가능)\n일반 공지: Alarm 역할 멘션\n중요 공지: everyone 멘션',
    usage: 'i.notice <일반|중요> <공지 내용>',
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has('761464991340953621')) return message.channel.send('int Team 멤버만 사용할 수 있어요.');
        if (args[1] != '일반' && args[1] != '중요') return message.channel.send('공지 타입을 입력해주세요.');
        if (!args[2]) return message.channel.send('공지 내용을 입력해주세요.');
        const embed = new Discord.MessageEmbed()
        .setTitle('공지를 보낼까요?')
        .setColor('RANDOM')
        .addField('공지 타입', args[1])
        .addField('공지 내용', `\`\`\`\n${args.slice(2).join(' ')}\n\`\`\``)
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
                client.channels.cache.get('761479235029303296').send(args[1] == '중요' ? client.guilds.cache.get('758562685070737438').roles.everyone.toString() : client.guilds.cache.get('758562685070737438').roles.cache.get('761453114074202173').toString(), {
                    embed: new Discord.MessageEmbed()
                    .setTitle(`${message.guild.name} 공지`)
                    .setDescription(args.slice(2).join(' '))
                    .setColor('RANDOM')
                    .setFooter(message.author.id, message.author.displayAvatarURL())
                    .setTimestamp()
                });
                embed.setTitle('공지를 보냈어요.')
                .setColor('RANDOM')
                .setTimestamp()
                m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('공지 전송이 취소되었어요.')
                .setColor('RANDOM')
                .setTimestamp()
                m.edit({
                    embed: embed
                });
            }
        });
    }
}