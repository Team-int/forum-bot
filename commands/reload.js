const Discord = require('discord.js');
module.exports = {
    name: 'reload',
    aliases: ['리로드', 'ㄹㄹㄷ', 'ㄱ디ㅐㅁㅇ', 'flfhem', 'ffe'],
    description: '모든 명령어를 리로드해요. (개발자만 사용 가능)',
    usage: 'i.reload',
    run: async (client, message, args, ops) => {
        if (!ops.devs.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있어요.`);
        const embed = new Discord.MessageEmbed()
            .setTitle(`리로드 중...`)
            .setColor('RANDOM')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        let m = await message.channel.send({
            embed: embed
        });
        client.reload().then(commands => {
            embed.setTitle(`리로드 완료!(${commands}개)`)
                .setColor('RANDOM')
                .setTimestamp();
            m.edit({
                embed: embed
            });
        });
    }
}