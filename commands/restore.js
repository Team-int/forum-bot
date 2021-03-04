const Discord = require("discord.js");
module.exports = {
  name: "restore",
  aliases: ["복원", "복구", "ㄱㄷㄴ색ㄷ", "qhrrn", "qhrdnjs"],
  description: "기존에 백업된 데이터로 서버를 복원해요.",
  usage: "i.restore",
  run: async (client, message, args, ops) => {
    if (message.author.id != "647736678815105037")
      return message.channel.send("봇 관리자만 사용할 수 있어요.");
    let backupID = args[0];
    if (!backupID){
        return message.channel.send(":x:ㅣ백업 아이디를 적어주세요!");
    }
      const embed = new Discord.MessageEmbed()
        .setTitle("서버를 복원할까요?")
        .setColor("RED")
        .setTimestamp()
        .setFooter("서버 복원하면 데이터가 이전됩니다", message.author.displayAvatarURL());
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
              backup.load(backupID, message.guild, {
              }).then(() => {
                  // backup.remove(backupID);
              }).catch((err) => {
                embed
                  .setTitle(":x: 이런 오류가 났네요...")
                  .addField("오류 내용", err)
                  .setColor("RED")
                  .setTimestamp();
                m.edit({
                  embed: embed,
                });
            });
        } else {
          embed
            .setTitle("복원 취소 됬어요.")
            .setColor("GREEN")
            .setTimestamp();
          m.edit({
            embed: embed,
          }).catch((err) => {
          embed
            .setTitle(":x: 이런 오류가 났네요...")
            .addField("오류 내용", err)
            .setColor("RED")
            .setTimestamp();
          m.edit({
            embed: embed,
          });
      });
        }
      })
  },
};
