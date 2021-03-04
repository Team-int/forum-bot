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
        .setTitle("데이터 저장중...")
        .setColor("YELLOW")
        .setTimestamp()
        .setFooter(message.author.tag, message.author.displayAvatarURL())
    );
    // Create the backup
    backup.create(message.guild, {
        jsonBeautify: true
    }).then((backupData) => {
        // And send informations to the backup owner
        message.author.send(`백업 코드 까먹을 까봐 디엠으로 전해드렸어요. 백업 코드 : ${backupData.id}`);
    m.edit(
      new Discord.MessageEmbed()
        .setTitle(":white_check_mark: 백업 완료되었어요!")
        .setDescription("백업 완료되었어요. 아래 코드를 사용하여 i.복구 <CODE> 입력해서 데이터 이전이 가능해요")
        .addField("백업 코드", `${backupData.id}`)
        .setColor("GREEN")
        .setTimestamp()
        .setFooter("혹시 몰라서 백업 코드를 DM 으로 전해드렸어요", message.author.displayAvatarURL())
    );
    });
  },
};
