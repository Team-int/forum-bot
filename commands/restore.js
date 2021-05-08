const Discord = require("discord.js");
module.exports = {
  name: "restore",
  aliases: ["복원", "복구", "ㄱㄷㄴ색ㄷ", "qhrrn", "qhrdnjs"],
  description: "기존에 백업된 데이터로 서버를 복원해요.",
  usage: "i.restore",
  run: async (client, message, args, ops) => {
    if (message.author.id != "647736678815105037")
      return message.channel.send("봇 관리자만 사용할 수 있어요.");
    const embed = new Discord.MessageEmbed()
      .setTitle("서버를 복원할까요?")
      .setColor("RED")
      .setTimestamp()
      .setFooter(message.author.tag, message.author.displayAvatarURL());
    let m = await message.channel.send(embed);
    await m.react("✅");
    await m.react("❌");
    const filter = (r, u) =>
      (r.emoji.name == "✅" || r.emoji.name == "❌") &&
      u.id == message.author.id;
    const collector = m.createReactionCollector(filter, {
      max: 1,
    });
    collector.on("end", async (collected) => {
      if (collected.first().emoji.name == "✅") {
        message.guild.channels.cache.forEach(async (x) => x.delete());
        console.log(1);
        message.guild.roles.cache
          .filter((x) => !x.managed && x.id != message.guild.id)
          .forEach((x) => x.delete());
        console.log(1);
        let backupFile = require("/home/azureuser/intmanager/data/backup.json");
        await message.guild.setName(backupFile.name);
        console.log(1);
        await message.guild.setIcon(backupFile.icon);
        console.log(1);
        await message.guild.setRegion(backupFile.region);
        console.log(1);
        await message.guild.setDefaultMessageNotifications(backupFile.notify);
        console.log(1);
        for (let r of backupFile.roles) {
          await message.guild.roles.create({ data: r });
        }
        console.log(1);
        let i = 0;
        for (let e of backupFile.emojis) {
          i++;
          setTimeout(async () => {
            await message.guild.emojis.create(e.url, e.name);
          }, i * 3000);
        }
        console.log(1);
        await message.guild.setVerificationLevel(backupFile.verifyLevel);
        console.log(1);
        await message.guild.setExplicitContentFilter(backupFile.media);
        console.log(1);
        for (let b of backupFile.bans) {
          await message.guild.members.ban(b);
        }
        console.log(1);
        i = 0;
        for (let c of backupFile.channels) {
          i++;
          setTimeout(async () => {
            await message.guild.channels.create(c.name, {
              type: c.type,
              topic: c.topic,
              nsfw: c.nsfw,
              bitrate: c.bit,
              userLimit: c.users,
              permissionOverwrites: c.perms.map((x) => {
                return {
                  id: message.guild.roles.cache.find((r) => r.name == x.name)
                    .id,
                  allow: x.allow,
                  deny: x.deny,
                };
              }),
              position: c.position,
              rateLimitPerUser: c.slow,
            });
          }, i * 3000);
          console.log(1);
        }
        console.log(1);
        setTimeout(() => {
          i = 0;
          message.guild.channels.cache.forEach(async (x) => {
            i++;
            setTimeout(async () => {
              if (!backupFile.channels.find((a) => a.name == x.name).parent)
                return;
              await x.setParent(
                message.guild.channels.cache.find(
                  (a) =>
                    a.name ==
                    backupFile.channels.find((a) => a.name == x.name).parent
                ).id
              );
            }, i * 3000);
          });
        }, backupFile.channels.length * 4000 + 100000);
        console.log(1);
        await message.guild.setAFKChannel(backupFile.afkCh);
        await message.guild.setAFKTimeout(backupFile.afkTime);
        await message.guild.setSystemChannel(backupFile.sysCh);
        await message.guild.setSystemChannelFlags(backupFile.sysMsg);
      }
    });
  },
};
