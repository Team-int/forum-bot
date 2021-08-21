const axios = require('axios').default
const fs = require('fs')
const qs = require('querystring')
module.exports = {
  pathname: '/bug',
  method: 'GET',
  run: async (client, req, res, parsed, ops) => {
    if (!parsed.query.code) {
      res.writeHead(401, {
        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
      })
      res.end('Discord authentication cancled')
    } else {
      axios
        .post(
          'https://discord.com/api/oauth2/token',
          qs.stringify({
            client_id: client.user.id,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: parsed.query.code,
            scope: 'identify guilds',
            redirect_uri: process.env.BUG_REDIRECT
          }),
          {
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            }
          }
        )
        .then((tokenRes) => {
          axios
            .get('https://discord.com/api/users/@me', {
              headers: {
                Authorization: `Bearer ${tokenRes.data.access_token}`
              }
            })
            .then((userRes) => {
              axios
                .get('https://discord.com/api/users/@me/guilds', {
                  headers: {
                    Authorization: `${tokenRes.data.token_type} ${tokenRes.data.access_token}`
                  }
                })
                .then(async (guildRes) => {
                  if (!guildRes.data.find((x) => x.id == ops.guildId)) {
                    res.writeHead(400, {
                      'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                    })
                    res.end("You're not in the guild")
                  } else {
                    if (userRes.data.bot == true) {
                      res.writeHead(403, {
                        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                      })
                      res.end("You're a bot")
                    } else {
                      if (!client.guilds.cache.get(ops.guildId).members.cache.get(userRes.data.id))
                        await client.guilds.cache.get(ops.guildId).members.fetch(userRes.data.id)
                      const bugReports = require('/home/azureuser/intmanager/data/bugs.json')
                      let reps = ''
                      for (let report of bugReports.bugs) {
                        if (
                          report.author == userRes.data.id ||
                          client.guilds.cache
                            .get(ops.guildId)
                            .members.cache.get(userRes.data.id)
                            .roles.cache.has(ops.adminRole)
                        ) {
                          let tmpRep = `<h3>${report.title}</h3><div class="report">`
                          for (let comment of report.comments) {
                            if (comment.isAdmin) {
                              tmpRep += `<div class="response"><div class="sentBy" style="color: red;">관리자</div><div class="comment">${comment.text}</div></div>`
                            } else {
                              tmpRep += `<div class="sent"><div class="sentBy" style="color: blue;">${comment.by}</div><div class="comment">${comment.text}</div></div>`
                            }
                          }
                          tmpRep += `<textarea type='text' class='new-comment' id='${report.id}' placeholder='메세지 입력'></textarea><button class='new-comment-submit' id='${report.id}-submit'>확인</button>`
                          reps += tmpRep
                        }
                      }
                      fs.readFile('./assets/html/bugreport.html', 'utf8', (err, data) => {
                        res.writeHead(200, {
                          'Content-Type': 'text/html; charset=utf-8',
                          'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        })
                        res.end(
                          data
                            .replace(
                              /{token}/gi,
                              `${tokenRes.data.token_type} ${tokenRes.data.access_token}`
                            )
                            .replace(/{nick}/gi, client.users.cache.get(userRes.data.id).tag)
                            .replace(/{reports}/gi, reps)
                        )
                      })
                    }
                  }
                })
            })
        })
        .catch(console.log)
    }
  }
}
