const Discord = require('discord.js');
const webpush = require('web-push');
module.exports = {
    name: 'call',
    aliases: ['ghcnf', 'qnfmrl', 'ㅊ미ㅣ', '호출', '부르기'],
    description: '관리자를 불러요.(팀원만 사용 가능)\n이 명령어를 사용하면 관리자에게 푸시 알림이 전송되기 때문에 중요한 상황이고 멘션이나 DM을 받지 않을 경우에만 이용해주세요.',
    usage: 'i.call <int|CSH|mswgen> [호출 이유]',
    run: async (client, message, args, ops) => {
        if (!args[1] && args[1] != 'int' && args[1] != 'CSH' && args[1] != 'mswgen') return message.channel.send('호출할 대상을 입력해주세요.');
        if (ops.callTarget[message.author.id] == args[1]) return message.channel.send('자기 자신은 호출할 수 없어요.');
        if (!message.member.roles.cache.has(ops.teamRole)) return message.channel.send('팀원만 사용할 수 있어요.')
        if (client.callQueue.get(message.author.id)) return message.channel.send('조금 있다가 다시 해보세요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('관리자를 호출할까요?')
            .setColor('RANDOM')
            .addField('호출할 관리자', args[1])
            .addField('호출 이유', args.slice(2).join(' ') || '없음')
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
                await m.reactions.removeAll();
                embed.setTitle(`${args[1]} 님을 호출하고 있어요...`)
                    .setColor('RANDOM')
                    .setDescription(`아래 반응을 누르거나 ${args[1]} 님이 메세지를 입력하거나 30분이 지나면 호출이 종료돼요.`)
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp();
                await m.edit(embed);
                client.callQueue.set(message.author.id, args[1]);
                let callFile = require(`/home/azureuser/intmanager/data/call${args[1]}.json`);
                webpush.setGCMAPIKey(process.env.GCM_API_KEY);
                webpush.setVapidDetails('mailto: mswgen02@gmail.com', 'BI600VywPkLZAS9ULBbIO35OiwO8ZVYmDDwajL2_MrypJFoEZrMeeGPFZZevWGfn0wZEzcM4Y3V76lN30daPJTY', process.env.VAPID_PRIVATE_KEY);
                for (let sub of callFile.subscriptions) {
                    webpush.sendNotification(sub, JSON.stringify({
                        title: '호출됨',
                        body: `${message.author.tag}(${message.author.id})님이 ${message.channel.name}에서 ${args[1]} 님을 호출했어요.\호출 이유: ${args.slice(2).join(' ') || '없음'}`,
                        icon: '/static/image/inticon-512.png'
                    }))
                }
                let calling = setInterval(() => {
                    for (let sub of callFile.subscriptions) {
                        webpush.sendNotification(sub, JSON.stringify({
                            title: '호출됨',
                            body: `${message.author.tag}(${message.author.id})님이 ${message.channel.name}에서 ${args[1]} 님을 호출했어요.\n호출 이유: ${args.slice(2).join(' ') || '없음'}`,
                            icon: '/static/image/inticon-512.png'
                        }))
                    }
                }, 10000);
                await m.react('❌');
                const filter2 = (r, u) => u.id == message.author.id && r.emoji.name == '❌';
                const collector2 = m.createReactionCollector(filter2, {
                    max: 1
                });
                const filter3 = m => ops.callTarget[m.author.id] ? true : false;
                const collector3 = m.channel.createMessageCollector(filter3, {
                    max: 1
                });
                let cooldowns = setTimeout(() => {
                    collector2.stop();
                    m.reactions.removeAll();
                    collector3.stop();
                    embed.setTitle('호출 정지됨')
                            .setDescription('30분이 지나서 호출이 정지되었어요')
                            .setColor('RANDOM')
                            .setFooter(message.author.tag, message.author.displayAvatarURL())
                            .setTimestamp();
                        m.edit(embed);
                }, 1800000);
                setTimeout(() => {
                    client.callQueue.delete(message.author.id);
                }, 600000);
                collector2.on('end', collected2 => {
                    if (collected2.first()) {
                        m.reactions.removeAll();
                        clearInterval(calling);
                        collector3.stop();
                        clearTimeout(cooldowns);
                        embed.setTitle('호출 정지됨')
                            .setDescription('❌ 반응을 눌러서 호출이 정지되었어요')
                            .setColor('RANDOM')
                            .setFooter(message.author.tag, message.author.displayAvatarURL())
                            .setTimestamp();
                        m.edit(embed);
                    }
                });
                collector3.on('end', collected3 => {
                    if (collected3.first()) {
                        m.reactions.removeAll();
                        clearTimeout(cooldowns);
                        clearInterval(calling);
                        collector2.stop();
                        embed.setTitle('호출 정지됨')
                            .setDescription('관리자가 도착해서 호출이 정지되었어요')
                            .setColor('RANDOM')
                            .setFooter(message.author.tag, message.author.displayAvatarURL())
                            .setTimestamp();
                        m.edit(embed);
                    }
                })
            } else {
                embed.setTitle('관리자 호출이 취소되었어요')
                    .setColor('RANDOM')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
    }
}