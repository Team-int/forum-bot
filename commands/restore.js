const Discord = require('discord.js');
module.exports = {
    name: 'restore',
    aliases: ['복원', '복구', 'ㄱㄷㄴ색ㄷ', 'qhrrn', 'qhrdnjs'],
    description: '기존에 백업된 데이터로 서버를 복원해요.',
    usage: 'i.restore',
    run: async (client, message, args, ops) => {
        // if (!message.member.roles.cache.has(ops.adminRole)) return message.channel.send('봇 관리자만 사용할 수 있어요.');
        const embed = new Discord.MessageEmbed()
        .setTitle('서버를 복원할까요?')
        .setColor('RANDOM')
        .setTimestamp()
        .setFooter(message.author.tag, message.author.displayAvatarURL());
        let m = await message.channel.send(embed);
        const filter = (r, u) => (r.emoji.name == '✅' || r.emoji.name == '❌') && u.id == message.author.id;
        const collector = message.channel.createReactionCollector(filter, {
            max: 1
        });
        collector.on('end', collected => {
            if (collected.first().emoji.name == '✅') {
                message.guild.channels.cache.forEach(x => x.delete());
                message.guild.roles.cache.forEach(x => x.delete());
                let backupFile = require('/home/data/backup.json');
                message.guild.setName(backupFile.name);
                message.guild.setIcon(backupFile.icon);
                message.guild.setRegion(backupFile.region);
                message.guild.setDefaultMessageNotifications(backupFile.notify);
                for (let r of backupFile.roles) {
                    message.guild.roles.create({data: r});
                }
                for (let e of backupFile.emojis) {
                    message.guild.emojis.create(e.url, e.name);
                }
                message.guild.setVerificationLevel(backupFile.verifyLevel);
                message.guild.setExplicitContentFilter(backupFile.media);
                for (let b of backupFile.bans) {
                    message.guild.members.ban(b);
                }
                for (let c of backupFile.channels) {
                    message.guild.channels.create(c.name, {
                        type: c.type,
                        topic: c.topic,
                        nsfw: c.nsfw,
                        bitrate: c.bit,
                        userLimit: c.users,
                        parent: c.parent,
                        permissionOverwrites: c.perms,
                        position: c.position,
                        rateLimitPerUser: c.slow
                    });
                }
                message.guild.setAFKChannel(backupFile.afkCh);
                message.guild.setAFKTimeout(backupFile.afkTime);
                message.guild.setSystemChannel(backupFile.sysCh);
                message.guild.setSystemChannelFlags(backupFile.sysMsg);
            }
        });
    }
}