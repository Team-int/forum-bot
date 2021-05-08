const Discord = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "backup",
  aliases: ["백업", "ㅠㅁ차ㅕㅔ", "qordjq"],
  description: "서버를 백업해요.",
  usage: "i.backup",
  run: async (client, message, args, ops) => {
    if (!message.member.roles.cache.has(ops.adminRole))
      return message.channel.send("봇 관리자만 사용할 수 있어요.");
    let m = await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle("서버 백업 중...")
        .setColor("#ff9900")
        .setTimestamp()
        .setFooter(message.author.tag, message.author.displayAvatarURL())
    );
    let backupFile = require("/home/azureuser/intmanager/data/backup.json");
    backupFile.name = client.guilds.cache.get("750705387124031510").name;
    backupFile.icon = client.guilds.cache
      .get("750705387124031510")
      .iconURL({ format: "png" });
    backupFile.region = client.guilds.cache.get("750705387124031510").region;
    backupFile.afkCh = client.guilds.cache.get(
      "750705387124031510"
    ).afkChannelID;
    backupFile.afkTime = client.guilds.cache.get(
      "750705387124031510"
    ).afkTimeout;
    backupFile.sysCh = client.guilds.cache.get(
      "750705387124031510"
    ).systemChannelID;
    backupFile.sysMsg = client.guilds.cache.get(
      "750705387124031510"
    ).systemChannelFlags;
    backupFile.notify = client.guilds.cache.get(
      "750705387124031510"
    ).defaultMessageNotifications;
    backupFile.roles = client.guilds.cache
      .get("750705387124031510")
      .roles.cache.filter((x) => !x.managed && x.id != x.guild.id)
      .map((x) => {
        return {
          name: x.name,
          color: x.hexColor,
          hoist: x.hoist,
          mentionable: x.mentionable,
          permissions: x.permissions.bitfield,
          position: x.position,
        };
      });
    backupFile.emojis = client.guilds.cache
      .get("750705387124031510")
      .emojis.cache.map((x) => {
        return {
          name: x.name,
          url: x.url,
        };
      });
    backupFile.verifyLevel = client.guilds.cache.get(
      "750705387124031510"
    ).verificationLevel;
    backupFile.media = client.guilds.cache.get(
      "750705387124031510"
    ).explicitContentFilter;
    backupFile.bans = (
      await client.guilds.cache.get("750705387124031510").fetchBans()
    ).map((x) => x.user.id);
    backupFile.channels = client.guilds.cache
      .get("750705387124031510")
      .channels.cache.map((x) => {
        return {
          name: x.name,
          topic: x.topic,
          type: x.type == "news" ? "text" : x.type,
          slow: x.rateLimitPerUser,
          nsfw: x.nsfw,
          perms: x.permissionOverwrites
            .filter((x) => message.guild.roles.cache.get(x.id))
            .map((p) => {
              return {
                name: message.guild.roles.cache.get(p.id).name,
                allow: p.allow.bitfield,
                deny: p.deny.bitfield,
              };
            }),
          parent: x.parent ? x.parent.name : undefined,
          position: x.position,
          bit: x.bitrate > 96000 ? 96000 : x.bitrate,
          users: x.userLimit,
        };
      });
    fs.writeFileSync("/home/azureuser/intmanager/data/backup.json", JSON.stringify(backupFile));
    await m.edit(
      new Discord.MessageEmbed()
        .setTitle("서버 백업이 완료되었어요")
        .setColor("GREEN")
        .setTimestamp()
        .setFooter(message.author.tag, message.author.displayAvatarURL())
    );
  },
};
