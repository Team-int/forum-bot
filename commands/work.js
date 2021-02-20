const Discord = require("discord.js");
const fs = require("fs");
module.exports = {
  name: "work",
  aliases: [
    "출근",
    "퇴근",
    "일",
    "출퇴근",
    "재가",
    "cnfrms",
    "xhlrms",
    "dlf",
    "ccnfxhlrms",
  ],
  description: "출근/퇴근을 해요.(팀원만 사용 가능)",
  usage: "i.work [출/퇴근 사유]",
  run: async (client, message, args, ops) => {
    if (!message.member.roles.cache.has(ops.teamRole))
      return message.channel.send("팀원만 사용할 수 있어요.");
    let statFile = require("data/work.json");
    if (!statFile.anal[message.author.id])
      statFile.anal[message.author.id] = { count: 0, time: 0 };
    if (statFile.curr.find((x) => x.id == message.author.id)) {
      statFile.anal[message.author.id].time +=
        new Date() -
        statFile.curr.find((x) => x.id == message.author.id).startTime;
      const embed = new Discord.MessageEmbed()
        .setTitle("퇴근")
        .setColor("RED")
        .addField("유저", message.author.toString())
        .addField("이유", args[1] ? args.slice(1).join(" ") : "없음")
        .addField(
          "시각",
          new Date().toLocaleString("ko-kr", { timeZone: "Asia/Seoul" })
        )
        .addField(
          "총 출근 횟수",
          `${statFile.anal[message.author.id].count}/2회`
        )
        .addField(
          "총 일한 시간",
          `${Math.floor(
            statFile.anal[message.author.id].time / 86400000
          )}일 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(
                      statFile.anal[message.author.id].time / 86400000
                    ) *
                      86400000
                ) / 3600000
              )
                .toString()
                .split(".")[0]
            )
          )}시간 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(
                      statFile.anal[message.author.id].time / 3600000
                    ) *
                      3600000
                ) / 60000
              )
                .toString()
                .split(".")[0]
            )
          )}분 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(statFile.anal[message.author.id].time / 60000) *
                      60000
                ) / 1000
              )
                .toString()
                .split(".")[0]
            )
          )}초 ${
            statFile.anal[message.author.id].time -
            Math.floor(statFile.anal[message.author.id].time / 1000) * 1000
          }ms`
        )
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp();
      client.channels.cache.get(ops.workChannel).send(embed);
      message.react("✅");
      statFile.curr.splice(
        statFile.curr.indexOf(
          statFile.curr.find((x) => x.id == message.author.id)
        ),
        1
      );
      fs.writeFileSync("data/work.json", JSON.stringify(statFile));
    } else {
      statFile.anal[message.author.id].count++;
      const embed = new Discord.MessageEmbed()
        .setTitle("출근")
        .setColor("GREEN")
        .addField("유저", message.author.toString())
        .addField("이유", args[1] ? args.slice(1).join(" ") : "없음")
        .addField(
          "시각",
          new Date().toLocaleString("ko-kr", { timeZone: "Asia/Seoul" })
        )
        .addField(
          "총 출근 횟수",
          `${statFile.anal[message.author.id].count}/2회`
        )
        .addField(
          "총 일한 시간",
          `${Math.floor(
            statFile.anal[message.author.id].time / 86400000
          )}일 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(
                      statFile.anal[message.author.id].time / 86400000
                    ) *
                      86400000
                ) / 3600000
              )
                .toString()
                .split(".")[0]
            )
          )}시간 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(
                      statFile.anal[message.author.id].time / 3600000
                    ) *
                      3600000
                ) / 60000
              )
                .toString()
                .split(".")[0]
            )
          )}분 ${Math.floor(
            parseInt(
              Math.floor(
                Math.floor(
                  statFile.anal[message.author.id].time -
                    Math.floor(statFile.anal[message.author.id].time / 60000) *
                      60000
                ) / 1000
              )
                .toString()
                .split(".")[0]
            )
          )}초 ${
            statFile.anal[message.author.id].time -
            Math.floor(statFile.anal[message.author.id].time / 1000) * 1000
          }ms`
        )
        .setFooter(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp();
      client.channels.cache.get(ops.workChannel).send(embed);
      message.react("✅");
      statFile.curr.push({
        id: message.author.id,
        startTime: new Date() - 1 + 1,
      });
      fs.writeFileSync("data/work.json", JSON.stringify(statFile));
    }
  },
};
