const Discord = require('discord.js');
const fs = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Command', 'Reload Status');
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
        client.commands.clear();
        client.aliases.clear();
        const list = fs.readdirSync('./commands/');
        for (let file of list) {
            try {
                delete require.cache[require.resolve(`./${file}`)]
                let pull = require(`./${file}`);
                if (pull.name && pull.run && pull.aliases) {
                    table.addRow(file, '✅');
                    for (let alias of pull.aliases) {
                        client.aliases.set(alias, pull.name);
                    }
                    client.commands.set(pull.name, pull);
                } else {
                    table.addRow(file, '❌ -> Error');
                    continue;
                }
            } catch (e) {
                table.addRow(file, `❌ -> ${e}`);
                continue;
            }
        }
        embed.setTitle(`리로드 완료!(${client.commands.size}개)`)
            .setColor('RANDOM')
            .setTimestamp();
        m.edit({
            embed: embed
        });
    }
}